/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// PharmacyContext.jsx
//
// Week 8 update: medicines/batches/stockMovements/sales each now route
// their initial list through pharmacyService via useAsyncData.
// isLoading/error are new, additive combined fields. Every mutation
// function (adjustStock, updateBatchStatus, recordPurchase, recordSale,
// add/update/deleteMedicine) is completely UNCHANGED — still
// synchronous, local-state-only, exactly as before.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { pharmacyService } from "../services/pharmacyService";
import {
  initialMedicines,
  initialBatches,
} from "../pages/pharmacy/pharmacyData";

const PharmacyContext = createContext(null);

export const PharmacyProvider = ({ children }) => {
  const {
    data: medicines,
    setData: setMedicines,
    isLoading: medicinesLoading,
    error: medicinesError,
  } = useAsyncData(pharmacyService.getMedicines, initialMedicines);
  const {
    data: batches,
    setData: setBatches,
    isLoading: batchesLoading,
    error: batchesError,
  } = useAsyncData(pharmacyService.getBatches, initialBatches);
  const {
    data: stockMovements,
    setData: setStockMovements,
    isLoading: movementsLoading,
  } = useAsyncData(pharmacyService.getStockMovements, []);
  const {
    data: sales,
    setData: setSales,
    isLoading: salesLoading,
  } = useAsyncData(pharmacyService.getSales, []);

  const addMedicine = useCallback(
    (medicine) => {
      setMedicines((prev) => [medicine, ...prev]);
    },
    [setMedicines],
  );

  const updateMedicine = useCallback(
    (updated) => {
      setMedicines((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m)),
      );
    },
    [setMedicines],
  );

  const deleteMedicine = useCallback(
    (id) => {
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    },
    [setMedicines],
  );

  const adjustStock = useCallback(
    ({ batchId, type, quantityChange, reason }) => {
      setBatches((prev) => {
        const batch = prev.find((b) => b.id === batchId);
        if (!batch) return prev;
        const before = batch.quantity;
        const after = Math.max(0, before + quantityChange);

        setStockMovements((movements) => [
          {
            id: `MOV-${Date.now()}`,
            batchId,
            medicineId: batch.medicineId,
            batchNumber: batch.batchNumber,
            type,
            quantityBefore: before,
            quantityAfter: after,
            quantityChange: after - before,
            reason,
            timestamp: new Date().toISOString(),
          },
          ...movements,
        ]);

        return prev.map((b) =>
          b.id === batchId ? { ...b, quantity: after } : b,
        );
      });
    },
    [setBatches, setStockMovements],
  );

  const updateBatchStatus = useCallback(
    ({ batchId, newStatus, reason }) => {
      setBatches((prev) => {
        const batch = prev.find((b) => b.id === batchId);
        if (!batch) return prev;

        setStockMovements((movements) => [
          {
            id: `MOV-${Date.now()}`,
            batchId,
            medicineId: batch.medicineId,
            batchNumber: batch.batchNumber,
            type: newStatus,
            quantityBefore: batch.quantity,
            quantityAfter: batch.quantity,
            quantityChange: 0,
            reason,
            timestamp: new Date().toISOString(),
          },
          ...movements,
        ]);

        return prev.map((b) =>
          b.id === batchId ? { ...b, status: newStatus } : b,
        );
      });
    },
    [setBatches, setStockMovements],
  );

  const recordPurchase = useCallback(
    ({ supplier, invoiceNumber, purchaseDate, lines }) => {
      setBatches((prev) => {
        let next = [...prev];
        lines.forEach((line) => {
          const existing = next.find(
            (b) =>
              b.medicineId === line.medicineId &&
              b.batchNumber.trim().toLowerCase() ===
                line.batchNumber.trim().toLowerCase(),
          );
          if (existing) {
            next = next.map((b) =>
              b.id === existing.id
                ? { ...b, quantity: b.quantity + line.quantity }
                : b,
            );
          } else {
            next = [
              {
                id: `B-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                medicineId: line.medicineId,
                batchNumber: line.batchNumber,
                quantity: line.quantity,
                unitCost: line.unitCost,
                mrp: line.mrp,
                expiryDate: line.expiryDate,
                shelfLocation: line.shelfLocation,
                supplier,
                invoiceNumber,
                purchaseDate,
                status: "Active",
              },
              ...next,
            ];
          }
        });
        return next;
      });
    },
    [setBatches],
  );

  const recordSale = useCallback(
    (sale) => {
      const record = { id: `SALE-${Date.now()}`, ...sale };
      setBatches((prev) =>
        prev.map((b) => {
          const line = sale.items.find((item) => item.batchId === b.id);
          return line
            ? { ...b, quantity: Math.max(0, b.quantity - line.quantity) }
            : b;
        }),
      );
      setSales((prev) => [record, ...prev]);
      return record;
    },
    [setBatches, setSales],
  );

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        batches,
        stockMovements,
        sales,
        isLoading:
          medicinesLoading ||
          batchesLoading ||
          movementsLoading ||
          salesLoading,
        error: medicinesError || batchesError || null,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        adjustStock,
        updateBatchStatus,
        recordPurchase,
        recordSale,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be used inside PharmacyProvider");
  return ctx;
};
