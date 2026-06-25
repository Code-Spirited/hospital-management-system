// ─────────────────────────────────────────────────────────────────────────────
// ipdSchema.js
//
// Zod validation schema for the IPD Admission Form.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { validDDMMYYYY } from "../../utils/dateValidators";

const phoneRegex = /^\d{10}$/;

export const admissionSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  admittingDoctor: z.string().min(1, "Please select the admitting doctor"),
  wardType: z.string().min(1, "Please select a ward type"),
  admissionDate: z
    .string()
    .min(1, "Admission date is required")
    .refine(validDDMMYYYY, "Enter date as DD-MM-YYYY"),
  reasonForAdmission: z
    .string()
    .min(3, "Please describe the reason for admission"),
  diagnosisAtAdmission: z.string().optional().or(z.literal("")),
  attendantName: z.string().min(2, "Attendant name is required"),
  attendantPhone: z.string().regex(phoneRegex, "Enter a valid 10-digit number"),
  expectedStayDays: z.string().optional().or(z.literal("")),
});

// ── Treatment Record schema — used by the IPD Treatment Records page ─────────
// One admission can accumulate MANY of these over the course of a stay
// (unlike OPD's one-time Consultation) — daily rounds, vitals checks,
// medication administration. Only recordedBy is required; clinical detail
// fields stay optional, consistent with how OPD's consultationSchema was
// made fully optional earlier in this project.
export const treatmentRecordSchema = z.object({
  recordedBy: z.string().min(1, "Please select who is recording this"),
  bloodPressure: z.string().optional().or(z.literal("")),
  temperature: z.string().optional().or(z.literal("")),
  pulse: z.string().optional().or(z.literal("")),
  spo2: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  medicationGiven: z.string().optional().or(z.literal("")),
});

// ── Discharge Summary schema — closes out an IPD admission ───────────────────
// conditionAtDischarge and dischargedBy are required: every closed
// admission needs at least a recorded outcome and an accountable doctor.
// Narrative fields stay optional, consistent with consultationSchema.
export const dischargeSummarySchema = z.object({
  dischargeDate: z
    .string()
    .min(1, "Discharge date is required")
    .refine(validDDMMYYYY, "Enter date as DD-MM-YYYY"),
  conditionAtDischarge: z
    .string()
    .min(1, "Please select condition at discharge"),
  dischargedBy: z.string().min(1, "Please select the discharging doctor"),
  finalDiagnosis: z.string().optional().or(z.literal("")),
  treatmentSummary: z.string().optional().or(z.literal("")),
  followUpDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || validDDMMYYYY(val), "Enter date as DD-MM-YYYY"),
  followUpInstructions: z.string().optional().or(z.literal("")),
});

// ── IPD Billing schema ────────────────────────────────────────────────────────
// dailyRate and numberOfDays are both editable — auto-suggested from the
// admission's ward type and stay duration, the same "suggest, allow
// override" pattern used for OPD's consultationFee.
export const ipdBillingSchema = z.object({
  dailyRate: z.coerce.number().min(0, "Enter a valid amount"),
  numberOfDays: z.coerce.number().min(1, "Must be at least 1 day"),
  items: z.array(
    z.object({
      description: z.string().min(2, "Description required"),
      amount: z.coerce.number().min(0, "Enter a valid amount"),
    }),
  ),
  discountPercent: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  taxPercent: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  paymentMethod: z.string().min(1, "Select a payment method"),
  paymentStatus: z.string().min(1, "Select a payment status"),
});
