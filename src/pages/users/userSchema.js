// ─────────────────────────────────────────────────────────────────────────────
// userSchema.js
//
// addUserSchema covers everything set once at hiring. editUserSchema
// deliberately excludes gender/joinedOn, mirroring editPatientSchema's
// exact same immutable-identity principle.
//
// phone/email now import from utils/validators.js — previously
// duplicated locally, and (for email) missing an explicit "required"
// message on 3 separate schemas, meaning a blank email field showed the
// more confusing "Enter a valid email address" instead of "Email
// address is required." changePasswordSchema.newPassword now uses the
// shared strongPasswordSchema — previously only checked min(8), weaker
// than the 5 rules Login.jsx's checklist has always visually promised.
// This is a real, disclosed strengthening of what passes validation
// here, not a silent change: a password like "password123" that used to
// pass changePasswordSchema will now correctly fail it.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { validDDMMYYYY, parseDDMMYYYY } from "../../utils/dateValidators";
import {
  requiredPhoneSchema,
  requiredEmailSchema,
  strongPasswordSchema,
} from "../../utils/validators";

export const addUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: requiredEmailSchema,
  phone: requiredPhoneSchema,
  gender: z.string().min(1, "Please select a gender"),
  role: z.string().min(1, "Please select a role"),
  department: z.string().min(1, "Please select a department"),
  joinedOn: z
    .string()
    .min(1, "Joining date is required")
    .refine(validDDMMYYYY, "Enter date as DD-MM-YYYY")
    .refine(
      (val) => parseDDMMYYYY(val) <= new Date(),
      "Joining date cannot be in the future",
    ),
});

// ── Profile (self-service) ────────────────────────────────────────────────────
// Deliberately excludes role/status — those are administrative decisions
// ABOUT a person, not decisions a person should make about themselves.
export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: requiredEmailSchema,
  phone: requiredPhoneSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const editUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: requiredEmailSchema,
  phone: requiredPhoneSchema,
  role: z.string().min(1, "Please select a role"),
  department: z.string().min(1, "Please select a department"),
  status: z.string().min(1, "Please select a status"),
});
