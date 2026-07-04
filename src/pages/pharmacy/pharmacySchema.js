// ─────────────────────────────────────────────────────────────────────────────
// pharmacySchema.js
//
// medicineSchema now covers ONLY Product-tier fields — no quantity,
// batchNumber, or expiryDate, since those never belong on a Medicine
// record in the two-tier model. purchaseEntrySchema covers a full
// multi-line invoice: header fields once, then a repeatable array of
// batch line items, each referencing an existing Medicine.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { validDDMMYYYY, parseDDMMYYYY } from "../../utils/dateValidators";

// ── Add Medicine (Product tier only) ──────────────────────────────────────────
export const medicineSchema = z.object({
  brandName: z.string().min(2, "Medicine name must be at least 2 characters"),
  genericName: z.string().min(2, "Generic name must be at least 2 characters"),
  strength: z
    .string()
    .min(1, "Strength is required (e.g. 500mg, or — if not applicable)"),
  category: z.string().min(1, "Please select a category"),
  dosageForm: z.string().min(1, "Please select a dosage form"),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  schedule: z.string().min(1, "Please select a drug schedule"),
  storageCondition: z.string().min(1, "Please select a storage condition"),
  reorderLevel: z.coerce.number().min(0, "Cannot be negative"),
  gstPercent: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(28, "GST slabs in India do not exceed 28%"),
});

// ── Purchase Entry — one invoice line item ────────────────────────────────────
const purchaseLineSchema = z
  .object({
    medicineId: z.string().min(1, "Please select a medicine"),
    batchNumber: z.string().min(2, "Batch number is required"),
    quantity: z.coerce.number().min(1, "Must receive at least 1 unit"),
    unitCost: z.coerce.number().min(0, "Enter a valid unit cost"),
    mrp: z.coerce.number().min(0, "Enter a valid MRP"),
    shelfLocation: z.string().min(1, "Please select a shelf location"),
    expiryDate: z
      .string()
      .min(1, "Expiry date is required")
      .refine(validDDMMYYYY, "Enter date as DD-MM-YYYY")
      .refine(
        (val) => parseDDMMYYYY(val) > new Date(),
        "Expiry date must be in the future",
      ),
  })
  .refine((data) => data.mrp >= data.unitCost, {
    message: "MRP cannot be lower than the unit cost",
    path: ["mrp"],
  });

// ── Purchase Entry — full invoice ─────────────────────────────────────────────
export const purchaseEntrySchema = z.object({
  supplier: z.string().min(1, "Please select a supplier"),
  invoiceNumber: z.string().min(2, "Invoice number is required"),
  purchaseDate: z
    .string()
    .min(1, "Purchase date is required")
    .refine(validDDMMYYYY, "Enter date as DD-MM-YYYY")
    .refine(
      (val) => parseDDMMYYYY(val) <= new Date(),
      "Purchase date cannot be in the future",
    ),
  lines: z
    .array(purchaseLineSchema)
    .min(1, "Add at least one medicine to this invoice"),
});
