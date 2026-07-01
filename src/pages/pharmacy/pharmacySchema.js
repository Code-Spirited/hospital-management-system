// ─────────────────────────────────────────────────────────────────────────────
// pharmacySchema.js
//
// Zod validation for the Add Medicine form. Mirrors the field set already
// established in pharmacyData.js's seed records exactly, so every medicine
// added through this form is shaped identically to the ones already in
// the register — no field this form produces is missing from what
// MedicineInventory.jsx and getStockStatus/getExpiryStatus expect.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { validDDMMYYYY, parseDDMMYYYY } from "../../utils/dateValidators";

export const medicineSchema = z
  .object({
    brandName: z.string().min(2, "Brand name must be at least 2 characters"),
    genericName: z
      .string()
      .min(2, "Generic name must be at least 2 characters"),
    strength: z
      .string()
      .min(1, "Strength is required (e.g. 500mg, or — if not applicable)"),
    category: z.string().min(1, "Please select a category"),
    dosageForm: z.string().min(1, "Please select a dosage form"),
    manufacturer: z.string().min(2, "Manufacturer is required"),
    batchNumber: z.string().min(2, "Batch number is required"),
    schedule: z.string().min(1, "Please select a drug schedule"),
    storageCondition: z.string().min(1, "Please select a storage condition"),
    quantity: z.coerce.number().min(0, "Cannot be negative"),
    reorderLevel: z.coerce.number().min(0, "Cannot be negative"),
    unitPrice: z.coerce.number().min(0, "Enter a valid unit cost"),
    mrp: z.coerce.number().min(0, "Enter a valid MRP"),
    gstPercent: z.coerce
      .number()
      .min(0, "Cannot be negative")
      .max(28, "GST slabs in India do not exceed 28%"),
    expiryDate: z
      .string()
      .min(1, "Expiry date is required")
      .refine(validDDMMYYYY, "Enter date as DD-MM-YYYY")
      .refine(
        (val) => parseDDMMYYYY(val) > new Date(),
        "Expiry date must be in the future — an already-expired medicine shouldn't be added to active stock",
      ),
  })
  .refine((data) => data.mrp >= data.unitPrice, {
    message: "MRP cannot be lower than the unit cost",
    path: ["mrp"],
  });
