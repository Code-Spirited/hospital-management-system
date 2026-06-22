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
