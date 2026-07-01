// ─────────────────────────────────────────────────────────────────────────────
// pharmacyUtils.js
//
// Stock and expiry status are COMPUTED here, never stored as a static
// field on a medicine record — the exact lesson this project has already
// learned three times (Patient "lastVisit", Appointment workflow stage,
// IPD discharge condition): a manually-set status field silently goes
// stale the moment reality changes underneath it. These functions are
// called fresh every render instead.
// ─────────────────────────────────────────────────────────────────────────────

import dayjs from "dayjs";

// 90 days is the threshold many real pharmacies use to flag stock for
// "First-Expiry-First-Out" (FEFO) clearance or return-to-distributor —
// a genuine inventory-management practice, not an arbitrary number.
export const EXPIRY_WARNING_DAYS = 90;

export const getStockStatus = (medicine) => {
  if (medicine.quantity === 0) return "Out of Stock";
  if (medicine.quantity <= medicine.reorderLevel) return "Low Stock";
  return "In Stock";
};

export const getExpiryStatus = (medicine) => {
  const today = dayjs();
  const expiry = dayjs(medicine.expiryDate);
  if (expiry.isBefore(today, "day")) return "Expired";
  if (expiry.diff(today, "day") <= EXPIRY_WARNING_DAYS) return "Expiring Soon";
  return "Good";
};

// Valued at acquisition cost (unitPrice), not retail (MRP) — standard
// accounting practice for stock valuation.
export const getInventoryValue = (medicine) =>
  medicine.quantity * medicine.unitPrice;
