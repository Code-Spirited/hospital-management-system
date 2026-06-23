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
