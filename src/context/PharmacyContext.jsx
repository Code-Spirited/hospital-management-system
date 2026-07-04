/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// PharmacyContext.jsx
//
// Holds TWO parallel collections, mirroring the two-tier data model:
// medicines (Product tier, master catalog) and batches (Shipment tier,
// each referencing a medicineId). addMedicine only ever touches the
// medicines array. recordPurchase only ever touches the batches array —
// it can restock an existing batch number or create a brand-new batch,
// but it can NEVER create a new Medicine; that's Add Medicine's job
// alone, which is what makes the two screens genuinely non-overlapping
// now instead of doing the same thing twice.
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
    // for now — Stock Management's audit trail (Friday's task) is the
    // correct place to handle cascading deletion deliberately, not a
    // silent side effect here.
  }, []);

  // ── Batch (Shipment tier) ─────────────────────────────────────────────────
  // Positive delta = received; negative = dispensed/adjusted out.
  // Clamped at 0 — a batch's quantity can never go negative.
  const adjustBatchQuantity = useCallback((batchId, delta) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, quantity: Math.max(0, b.quantity + delta) }
          : b,
      ),
    );
  }, []);

  const addBatch = useCallback((batch) => {
    setBatches((prev) => [batch, ...prev]);
  }, []);

  // Records one full Purchase Entry invoice: a header (supplier/invoice/
  // date, applied identically to every line) plus one or more line
  // items. Each line independently decides restock-existing-batch vs.
  // create-new-batch based on whether its batchNumber matches one
  // already on file for that medicineId.
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

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        batches,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        addBatch,
        adjustBatchQuantity,
        recordPurchase,
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
