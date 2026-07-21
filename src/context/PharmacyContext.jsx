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
//
// Week 8, Friday — bug fix: three mutation functions below had a real
// correctness problem, not just a style issue. adjustStock and
// updateBatchStatus called setStockMovements from INSIDE their
// setBatches updater — a nested setState call that could fire twice
// (and double-write a single stock adjustment into the audit log) any
// time React invokes an updater more than once, which Strict Mode does
// on purpose in development. recordPurchase generated new batch ids
// with Math.random()/Date.now() called directly inside its setBatches
// updater — the exact anti-pattern generateId.js's own header warns
// against, for the identical reason. All three are restructured below;
// see each function's own comment for specifics.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback, useMemo } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { pharmacyService } from "../services/pharmacyService";
import { generateId } from "../utils/generateId";
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
    refetch: refetchMedicines,
  } = useAsyncData(pharmacyService.getMedicines, initialMedicines);
  const {
    data: batches,
    setData: setBatches,
    isLoading: batchesLoading,
    error: batchesError,
    refetch: refetchBatches,
  } = useAsyncData(pharmacyService.getBatches, initialBatches);
  const {
    data: stockMovements,
    setData: setStockMovements,
    isLoading: movementsLoading,
    refetch: refetchMovements,
  } = useAsyncData(pharmacyService.getStockMovements, []);
  const {
    data: sales,
    setData: setSales,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = useAsyncData(pharmacyService.getSales, []);

  // Combined retry — calls every source's own refetch. Simpler for a
  // consuming page to call one function than four.
  const refetch = useCallback(() => {
    refetchMedicines();
    refetchBatches();
    refetchMovements();
    refetchSales();
  }, [refetchMedicines, refetchBatches, refetchMovements, refetchSales]);

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

  // Week 8, Friday — bug fix: setStockMovements used to be called from
  // INSIDE this function's setBatches updater. Calling one state setter
  // as a side effect while computing another's update is risky for the
  // same reason as the Math.random() issue in recordPurchase below — if
  // setBatches's updater runs twice (Strict Mode does this on purpose),
  // the nested setStockMovements call would ALSO fire twice, which meant
  // a single stock adjustment could silently write two entries into the
  // audit log. Restructured so the batch is looked up once, up front,
  // and setStockMovements/setBatches run as separate, sibling calls —
  // neither nested inside the other — matching the pattern recordSale
  // below already uses safely.
  const adjustStock = useCallback(
    ({ batchId, type, quantityChange, reason }) => {
      const batch = batches.find((b) => b.id === batchId);
      if (!batch) return;
      const before = batch.quantity;
      const after = Math.max(0, before + quantityChange);

      setStockMovements((movements) => [
        {
          id: generateId("MOV", 1000, 90000),
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

      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, quantity: after } : b)),
      );
    },
    [batches, setBatches, setStockMovements],
  );

  // Week 8, Friday — bug fix: same issue and same fix as adjustStock
  // above — setStockMovements was nested inside setBatches's updater,
  // risking a duplicated audit-log entry per action under Strict Mode's
  // double-invocation. Restructured identically.
  const updateBatchStatus = useCallback(
    ({ batchId, newStatus, reason }) => {
      const batch = batches.find((b) => b.id === batchId);
      if (!batch) return;

      setStockMovements((movements) => [
        {
          id: generateId("MOV", 1000, 90000),
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

      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, status: newStatus } : b)),
      );
    },
    [batches, setBatches, setStockMovements],
  );

  // Week 8, Friday — bug fix: new-batch ids used to be minted with
  // Math.random()/Date.now() called directly inside this setBatches
  // updater. React can invoke an updater more than once for a single
  // update (Strict Mode does this deliberately, in development, to
  // surface exactly this class of bug) — see generateId.js's own header
  // for the full reasoning. Every id this function might need is now
  // pre-generated with generateId() before setBatches runs, so the
  // updater itself only ever consumes already-computed values. Lines
  // that turn out to match an existing batch simply don't use theirs.
  const recordPurchase = useCallback(
    ({ supplier, invoiceNumber, purchaseDate, lines }) => {
      const newBatchIds = lines.map(() => generateId("B", 1000, 90000));
      setBatches((prev) => {
        let next = [...prev];
        lines.forEach((line, i) => {
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
                id: newBatchIds[i],
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

  // Week 8, Friday — memoized; see NotificationsContext.jsx's comment
  // for why. isLoading/error pulled out as plain consts first so the
  // memo's dependency list can reference them directly.
  const isLoading =
    medicinesLoading || batchesLoading || movementsLoading || salesLoading;
  const error = medicinesError || batchesError || null;

  const value = useMemo(
    () => ({
      medicines,
      batches,
      stockMovements,
      sales,
      isLoading,
      error,
      refetch,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      adjustStock,
      updateBatchStatus,
      recordPurchase,
      recordSale,
    }),
    [
      medicines,
      batches,
      stockMovements,
      sales,
      isLoading,
      error,
      refetch,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      adjustStock,
      updateBatchStatus,
      recordPurchase,
      recordSale,
    ],
  );

  return (
    <PharmacyContext.Provider value={value}>
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be used inside PharmacyProvider");
  return ctx;
};
