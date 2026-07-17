// ─────────────────────────────────────────────────────────────────────────────
// ipdSchema.js
//
// Zod validation schema for every IPD form. phone/percent/billing-line-
// item patterns now import from utils/validators.js — see opdSchema.js's
// header for the exact duplication this removes.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { validDDMMYYYY } from "../../utils/dateValidators";
import {
  requiredPhoneSchema,
  percentSchema,
  nonNegativeAmountSchema,
  billingLineItemsSchema,
} from "../../utils/validators";

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
  attendantPhone: requiredPhoneSchema,
  expectedStayDays: z.string().optional().or(z.literal("")),
});

// ── Treatment Record schema — used by the IPD Treatment Records page ─────────
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
export const ipdBillingSchema = z.object({
  dailyRate: nonNegativeAmountSchema,
  numberOfDays: z.coerce.number().min(1, "Must be at least 1 day"),
  items: billingLineItemsSchema,
  discountPercent: percentSchema,
  taxPercent: percentSchema,
  paymentMethod: z.string().min(1, "Select a payment method"),
  paymentStatus: z.string().min(1, "Select a payment status"),
});
