// ─────────────────────────────────────────────────────────────────────────────
// pharmacyUtils.js
//
// All computed values are derived live from Medicine + its Active
// Batches — never stored — same principle applied throughout this
// project (Patient lastVisit, Appointment status, IPD discharge
// condition). Rewritten for the two-tier model: every function here now
// takes a medicine PLUS the batches array, and aggregates across that
// medicine's Active batches rather than reading fields off one flat row.
// ─────────────────────────────────────────────────────────────────────────────

import dayjs from "dayjs";

export const EXPIRY_WARNING_DAYS = 90;

// All batches belonging to one medicine, regardless of status.
export const getBatchesForMedicine = (medicineId, batches) =>
  batches.filter((b) => b.medicineId === medicineId);

// Only batches actually counted as sellable stock.
export const getActiveBatches = (medicineId, batches) =>
  getBatchesForMedicine(medicineId, batches).filter(
    (b) => b.status === "Active",
  );

// Total sellable quantity across all Active batches of one medicine.
export const getTotalQuantity = (medicineId, batches) =>
  getActiveBatches(medicineId, batches).reduce((sum, b) => sum + b.quantity, 0);

export const getStockStatus = (medicine, batches) => {
  const qty = getTotalQuantity(medicine.id, batches);
  if (qty === 0) return "Out of Stock";
  if (qty <= medicine.reorderLevel) return "Low Stock";
  return "In Stock";
};

// The batch that should be dispensed next under FEFO (First-Expiry-
// First-Out) — the Active batch with the nearest expiry date. Returns
// null if the medicine currently has no Active batches at all.
export const getNearestExpiryBatch = (medicineId, batches) => {
  const active = getActiveBatches(medicineId, batches);
  if (active.length === 0) return null;
  return active.reduce((nearest, b) =>
    dayjs(b.expiryDate).isBefore(dayjs(nearest.expiryDate)) ? b : nearest,
  );
};

// A medicine's overall expiry status is driven by its SOONEST-expiring
// Active batch — one batch nearing expiry is enough to warrant attention
// on the medicine as a whole, even if other batches are fine.
export const getExpiryStatus = (medicine, batches) => {
  const nearest = getNearestExpiryBatch(medicine.id, batches);
  // Distinct from "Good" — this medicine has nothing to check the
  // expiry of at all, which is a different fact than "has stock, none
  // expiring soon."
  if (!nearest) return "No Active Batches";
  const today = dayjs();
  const expiry = dayjs(nearest.expiryDate);
  if (expiry.isBefore(today, "day")) return "Expired";
  if (expiry.diff(today, "day") <= EXPIRY_WARNING_DAYS) return "Expiring Soon";
  return "Good";
};

// Valued at acquisition cost (unitCost), summed across all Active
// batches of one medicine.
export const getMedicineInventoryValue = (medicineId, batches) =>
  getActiveBatches(medicineId, batches).reduce(
    (sum, b) => sum + b.quantity * b.unitCost,
    0,
  );

export const getTotalInventoryValue = (batches) =>
  batches
    .filter((b) => b.status === "Active")
    .reduce((sum, b) => sum + b.quantity * b.unitCost, 0);

// ── Finer-grained urgency tiering for the dedicated Expiry Alerts page ──────
// Deliberately separate from getExpiryStatus above, which already drives
// Inventory/Medicine Details with a simpler 3-state model — modifying
// that function would change behavior on screens that already work
// correctly. This adds a new, more granular view on the same underlying
// batch data without touching anything already relied upon.
export const EXPIRY_CRITICAL_DAYS = 30;

export const getBatchExpiryTier = (batch) => {
  const daysRemaining = dayjs(batch.expiryDate).diff(dayjs(), "day");
  if (daysRemaining < 0) return "Expired";
  if (daysRemaining <= EXPIRY_CRITICAL_DAYS) return "Critical";
  if (daysRemaining <= EXPIRY_WARNING_DAYS) return "Warning";
  return "Good";
};
