// ─────────────────────────────────────────────────────────────────────────────
// authSchema.js
//
// Brings Login.jsx and ForgotPassword.jsx onto the same Zod +
// react-hook-form standard used by every other form in this app — both
// previously used manual useState + imperative if/else validation, a
// real, standalone inconsistency rather than a deliberate design choice.
//
// loginSchema's password field uses strongPasswordSchema (shared with
// changePasswordSchema in userSchema.js) — the SAME rule set Login's
// visual checklist has always displayed, now actually enforced via Zod
// rather than duplicated as a second, independent set of manual checks.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import {
  requiredEmailSchema,
  strongPasswordSchema,
} from "../../utils/validators";

export const loginSchema = z.object({
  email: requiredEmailSchema,
  password: strongPasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: requiredEmailSchema,
});
