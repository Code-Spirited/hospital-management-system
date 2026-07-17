// ─────────────────────────────────────────────────────────────────────────────
// validators.js
//
// Shared, cross-module Zod primitives — mirrors the exact precedent set
// by dateValidators.js: pull out logic that was independently duplicated
// across schema files, so a future fix only happens once. Extracted
// after finding phoneRegex re-declared 3 times (opdSchema, ipdSchema,
// userSchema), the 0-100 percent pattern duplicated 5 times byte-for-
// byte, and a full billing line-items array schema duplicated word-for-
// word between OPD and IPD billing.
//
// Deliberately NOT extracted here: pharmacy's GST ceiling (28%, one call
// site only), per-field min-length name/address messages (too field-
// specific to generalize usefully), and "cannot be in the future" date
// checks (DOB uses strict <, joining/purchase dates use <=, for
// genuinely different domain reasons — collapsing them would hide a
// real distinction, not remove real duplication).
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ── Phone ──────────────────────────────────────────────────────────────────
export const phoneRegex = /^\d{10}$/;
export const requiredPhoneSchema = z
  .string()
  .regex(phoneRegex, "Enter a valid 10-digit mobile number");
export const optionalPhoneSchema = z
  .string()
  .regex(phoneRegex, "Enter a valid 10-digit mobile number")
  .optional()
  .or(z.literal(""));

// ── Email ──────────────────────────────────────────────────────────────────
// requiredEmailSchema checks non-empty BEFORE format, so a blank field
// shows "Email address is required" rather than the more confusing
// "Enter a valid email address" — fixes a real inconsistency found in
// userSchema.js, which previously used a bare .email() with no explicit
// empty-string message on 3 separate schemas.
export const requiredEmailSchema = z
  .string()
  .min(1, "Email address is required")
  .email("Enter a valid email address");
export const optionalEmailSchema = z
  .string()
  .email("Enter a valid email address")
  .optional()
  .or(z.literal(""));

// ── Percent (0–100) ────────────────────────────────────────────────────────
// Used identically by every discount/tax field across OPD, IPD, and
// Pharmacy billing — duplicated byte-for-byte 5 times before today.
export const percentSchema = z.coerce
  .number()
  .min(0, "Cannot be negative")
  .max(100, "Cannot exceed 100%");

// ── Non-negative currency amount ───────────────────────────────────────────
export const nonNegativeAmountSchema = z.coerce
  .number()
  .min(0, "Enter a valid amount");

// ── Billing line items (OPD Billing + IPD Billing's extra-charges rows) ────
export const billingLineItemsSchema = z.array(
  z.object({
    description: z.string().min(2, "Description required"),
    amount: nonNegativeAmountSchema,
  }),
);

// ── Password strength ──────────────────────────────────────────────────────
// Single source of truth for "what makes a password strong" — used by
// BOTH Login.jsx's live checklist UI (re-testing each rule against the
// watched password value on every keystroke) AND every Zod schema that
// sets/changes a password. Before today, Login's checklist visually
// enforced all 5 rules but was purely cosmetic (Login has no real
// backend), while changePasswordSchema only required min(8) — meaning a
// real password CHANGE was allowed to be weaker than what the login
// screen visually promised. This array closes that gap for good: both
// places now read from the exact same definition and can't drift apart.
export const PASSWORD_RULES = [
  {
    key: "length",
    test: (v) => v.length >= 8,
    checklistLabel: "At least 8 characters",
    errorMessage: "At least 8 characters required",
  },
  {
    key: "uppercase",
    test: (v) => /[A-Z]/.test(v),
    checklistLabel: "One uppercase letter (A–Z)",
    errorMessage: "Add one uppercase letter (A–Z)",
  },
  {
    key: "lowercase",
    test: (v) => /[a-z]/.test(v),
    checklistLabel: "One lowercase letter (a–z)",
    errorMessage: "Add one lowercase letter (a–z)",
  },
  {
    key: "number",
    test: (v) => /\d/.test(v),
    checklistLabel: "One number (0–9)",
    errorMessage: "Add one number (0–9)",
  },
  {
    key: "special",
    test: (v) => /[^A-Za-z0-9]/.test(v),
    checklistLabel: "One special character (!@#$…)",
    errorMessage: "Add one special character",
  },
];

// Surfaces only the FIRST unmet rule's message, matching the priority-
// ordered messaging this app's forms already used (one message shown at
// a time, not five stacked at once).
export const strongPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .superRefine((val, ctx) => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: rule.errorMessage,
        });
        return;
      }
    }
  });
