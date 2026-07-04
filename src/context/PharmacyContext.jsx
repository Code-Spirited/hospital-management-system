/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// PharmacyContext.jsx
//
// Holds three parallel collections: medicines (Product tier), batches
// (Shipment tier), and stockMovements (the audit trail for manual
// adjustments AND status changes — Disposed/Removed). sales is a fourth,
// added today: recordSale's return value was previously discarded
// entirely, meaning a completed sale left no trace anywhere once its
// toast faded. It's now stored and returned, so a receipt number/history
// actually exists.
//
// addBatch and adjustBatchQuantity (both from Monday) have been removed:
// both had zero callers anywhere in the app. adjustBatchQuantity was
// additionally a live risk — an unaudited quantity-mutator sitting next
// to the audited adjustStock, which could silently bypass Friday's audit
// trail if anything ever called it by mistake.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import {
  initialMedicines,
  initialBatches,
} from "../pages/pharmacy/pharmacyData";

const PharmacyContext = createContext(null);

export const PharmacyProvider = ({ children }) => {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [batches, setBatches] = useState(initialBatches);
  // Audit trail for manual stock changes: quantity adjustments (Damage/
  // Loss/Correction/Transfer, from Stock Management) AND status changes
  // (Removed/Disposed, from Expiry Alerts). Purchase/Sale quantity
  // changes are NOT logged here — those remain visible in their own
  // existing records (a Batch's own purchaseDate/invoiceNumber, and each
  // sale's own record in `sales` below) — a deliberate scope boundary.
  const [stockMovements, setStockMovements] = useState([]);
  // Every completed sale, newest first. Previously computed by
  // recordSale but never stored anywhere — fixed today.
  const [sales, setSales] = useState([]);

  // ── Medicine (Product tier) ──────────────────────────────────────────────
  const addMedicine = useCallback((medicine) => {
    setMedicines((prev) => [medicine, ...prev]);
  }, []);

  const updateMedicine = useCallback((updated) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m)),
    );
  }, []);

  const deleteMedicine = useCallback((id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    // Batches belonging to a deleted medicine become orphaned by design
    // for now — a deliberate, documented scope boundary, not a silent
    // side effect.
  }, []);

  // ── Batch (Shipment tier) ─────────────────────────────────────────────────

  // Records a manual stock adjustment: Damage, Loss, Correction, or
  // Transfer. Always writes an audit entry (before/after quantity,
  // reason, timestamp) alongside the actual quantity change, atomically —
  // it's structurally impossible to change a batch's quantity through
  // this path without a matching audit record being created.
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
    [],
  );

  // Marks a batch Removed or Disposed (Expiry Alerts). Quantity is
  // deliberately LEFT UNCHANGED on the record — same pattern as IPD
  // keeping bedNumber after discharge: harmless for aggregate
  // calculations (getActiveBatches already filters by status === "Active",
  // so a non-Active batch's quantity is never counted regardless of its
  // value), and useful as a historical fact ("38 units were disposed").
  // Still writes to the same audit log as adjustStock, just with
  // quantityChange: 0 since this is a status change, not a quantity one.
  const updateBatchStatus = useCallback(({ batchId, newStatus, reason }) => {
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
  }, []);

  // Records one full Purchase Entry invoice: a header (supplier/invoice/
  // date, applied identically to every line) plus one or more line
  // items. Each line independently decides restock-existing-batch vs.
  // create-new-batch based on whether its batchNumber matches one
  // already on file for that medicineId. Can NEVER create a new
  // Medicine — only Add Medicine does that.
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
    [],
  );

  // Records one Sales Billing transaction: decrements quantity from the
  // exact batch each cart line was assigned to, stores the finished sale
  // record in `sales`, and returns it — so the billing page can show a
  // real receipt reference (sale.id), and the sale isn't lost the moment
  // its confirmation toast disappears.
  const recordSale = useCallback((sale) => {
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
  }, []);

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        batches,
        stockMovements,
        sales,
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
