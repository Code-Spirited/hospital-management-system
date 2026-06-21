// ─────────────────────────────────────────────────────────────────────────────
// opdSchema.js
//
// Zod validation schema for the patient registration form.
// Kept in its own file so it can be imported by both the form (for client-side
// validation) and, in Week 8, any server-side validation layer without change.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

const phoneRegex = /^\d{10}$/;
const pincodeRegex = /^\d{6}$/;
const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;

// Confirms a DD-MM-YYYY string is a real calendar date (rejects things
// like "31-02-2026"). Shared by both the registration form's date of
// birth and the appointment form's date field.
const validDDMMYYYY = (val) => {
  if (!ddmmyyyyRegex.test(val)) return false;
  const [d, m, y] = val.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getDate() === d &&
    date.getMonth() === m - 1 &&
    date.getFullYear() === y
  );
};
const parseDDMMYYYY = (val) => {
  const [d, m, y] = val.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const patientRegistrationSchema = z.object({
  // ── Step 1: Personal ──────────────────────────────────────────────────────
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Name is too long"),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(validDDMMYYYY, "Enter date as DD-MM-YYYY")
    .refine(
      (val) => parseDDMMYYYY(val) < new Date(),
      "Date of birth cannot be in the future",
    ),

  gender: z.string().min(1, "Please select a gender"),

  bloodGroup: z.string().optional(),
  maritalStatus: z.string().optional(),

  idType: z.string().optional(),
  idNumber: z
    .string()
    .max(30, "ID number too long")
    .optional()
    .or(z.literal("")),

  // ── Step 2: Contact ───────────────────────────────────────────────────────
  mobileNumber: z
    .string()
    .regex(phoneRegex, "Enter a valid 10-digit mobile number"),

  alternatePhone: z
    .string()
    .regex(phoneRegex, "Enter a valid 10-digit number")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),

  addressLine1: z.string().min(5, "Address must be at least 5 characters"),

  addressLine2: z.string().optional().or(z.literal("")),

  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State is required"),

  pincode: z.string().regex(pincodeRegex, "Enter a valid 6-digit pincode"),

  // ── Step 3: Emergency + Medical ───────────────────────────────────────────
  emergencyName: z.string().min(2, "Emergency contact name is required"),

  emergencyRelation: z.string().min(1, "Relationship is required"),

  emergencyPhone: z.string().regex(phoneRegex, "Enter a valid 10-digit number"),

  chiefComplaint: z
    .string()
    .min(5, "Please describe the chief complaint (at least 5 characters)"),

  symptoms: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  currentMedications: z.string().optional().or(z.literal("")),

  // ── Insurance (optional block within step 3) ──────────────────────────────
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional().or(z.literal("")),
  policyNumber: z.string().optional().or(z.literal("")),
});

// Per-step field lists — used to trigger validation only for the current
// step's fields before advancing, so the user doesn't see errors for
// fields they haven't reached yet.
export const STEP_FIELDS = {
  0: ["fullName", "dateOfBirth", "gender"],
  1: ["mobileNumber", "addressLine1", "city", "state", "pincode"],
  2: ["emergencyName", "emergencyRelation", "emergencyPhone", "chiefComplaint"],
};
// ── Edit Patient schema — used by the quick-edit drawer in PatientList ───────
export const editPatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  status: z.string().min(1, "Please select a status"),
  assignedDoctor: z.string().min(1, "Please select a doctor"),
});

// ── Appointment schema — used by the Book/Reschedule drawer ──────────────────
export const appointmentSchema = z.object({
  patientName: z.string().min(2, "Please enter the patient name"),
  doctor: z.string().min(1, "Please select a doctor"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine(validDDMMYYYY, "DD-MM-YYYY"),
  time: z.string().min(1, "Time is required"),
  visitType: z.string().min(1, "Please select a visit type"),
  reason: z.string().min(3, "Please describe the reason for the visit"),
});

// ── Consultation schema — vitals + clinical notes ─────────────────────────────
export const consultationSchema = z.object({
  bloodPressure: z.string().min(1, "Required"),
  temperature: z.string().min(1, "Required"),
  pulse: z.string().min(1, "Required"),
  weight: z.string().optional().or(z.literal("")),
  spo2: z.string().optional().or(z.literal("")),
  diagnosis: z.string().min(3, "Please enter a diagnosis"),
  notes: z.string().optional().or(z.literal("")),
  advice: z.string().optional().or(z.literal("")),
});
// ── Prescription schema ───────────────────────────────────────────────────────
export const prescriptionSchema = z.object({
  medicines: z
    .array(
      z.object({
        medicine: z.string().min(2, "Medicine name required"),
        dosage: z.string().min(1, "Dosage required"),
        frequency: z.string().min(1, "Frequency required"),
        duration: z.string().min(1, "Duration required"),
        instructions: z.string().optional().or(z.literal("")),
      }),
    )
    .min(1, "Add at least one medicine"),
  generalAdvice: z.string().optional().or(z.literal("")),
});
