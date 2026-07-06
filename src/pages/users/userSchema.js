// ─────────────────────────────────────────────────────────────────────────────
// userSchema.js
//
// addUserSchema covers everything set once at hiring (including the two
// truly permanent facts — gender, joinedOn). editUserSchema deliberately
// excludes both, mirroring editPatientSchema's exact same principle:
// correctable details (name typo, contact info, role/department/status)
// stay editable; immutable identity/historical facts don't.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { validDDMMYYYY, parseDDMMYYYY } from "../../utils/dateValidators";

const phoneRegex = /^\d{10}$/;

export const addUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
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
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const editUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  role: z.string().min(1, "Please select a role"),
  department: z.string().min(1, "Please select a department"),
  status: z.string().min(1, "Please select a status"),
});
