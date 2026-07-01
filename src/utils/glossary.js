// ─────────────────────────────────────────────────────────────────────────────
// glossary.js
//
// Central dictionary powering the <Abbr> tooltip component used
// throughout the app. Deliberately curated to genuinely domain-specific
// or regulatory abbreviations — NOT every short token in the UI. "ID" is
// intentionally left out: it's used so universally and unambiguously that
// a tooltip on it would be noise, not help — the same "highlight
// exceptions, not defaults" restraint already applied to status badges
// elsewhere in this app.
//
// Each entry: { full, description }. `description` is optional.
// ─────────────────────────────────────────────────────────────────────────────

export const GLOSSARY = {
  // ── Modules ──────────────────────────────────────────────────────────────
  OPD: {
    full: "Outpatient Department",
    description:
      "Patients who consult a doctor and go home the same day — no hospital stay.",
  },
  IPD: {
    full: "Inpatient Department",
    description:
      "Patients admitted to the hospital for an overnight stay or longer.",
  },
  ICU: {
    full: "Intensive Care Unit",
    description:
      "Continuous, round-the-clock monitoring for critically ill patients.",
  },

  // ── Clinical vitals ──────────────────────────────────────────────────────
  BP: {
    full: "Blood Pressure",
    description:
      "Force of blood against artery walls, recorded as two numbers (e.g. 120/80).",
  },
  SpO2: {
    full: "Oxygen Saturation",
    description:
      "Percentage of oxygen carried by red blood cells. Normal range is typically 95–100%.",
  },
  ECG: {
    full: "Electrocardiogram",
    description:
      "A recording of the heart's electrical activity, used to detect rhythm or rate problems.",
  },
  IV: {
    full: "Intravenous",
    description: "Given directly into a vein — for fluids or medication.",
  },

  // ── Pharmacy & regulatory ────────────────────────────────────────────────
  GST: {
    full: "Goods and Services Tax",
    description:
      "India's standard tax applied to the sale of goods and services.",
  },
  MRP: {
    full: "Maximum Retail Price",
    description:
      "The highest price a product can legally be sold for in India, taxes included.",
  },
  SCHEDULE_OTC: {
    full: "Schedule OTC",
    description: "Over-the-Counter — no prescription required to purchase.",
  },
  SCHEDULE_H: {
    full: "Schedule H Drug",
    description: "Requires a doctor's prescription to dispense.",
  },
  SCHEDULE_H1: {
    full: "Schedule H1 Drug",
    description:
      "Requires a prescription, and the pharmacist must log it in a dispensing register — introduced to curb antibiotic misuse.",
  },
  SCHEDULE_X: {
    full: "Schedule X Drug",
    description:
      "A narcotic or psychotropic substance requiring special licensing, secure storage, and long-term record-keeping.",
  },
};
