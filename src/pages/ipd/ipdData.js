// ─────────────────────────────────────────────────────────────────────────────
// ipdData.js
//
// IPD admission registry — the primary data source for the IPD module,
// following the same pattern as opdData.js/appointmentsData.js. An
// admission record represents ONE inpatient stay: who, which doctor,
// what ward type, why, and when. It is deliberately separate from both
// the Patient record (permanent identity) and an OPD Appointment (an
// outpatient encounter) — one patient can have many admissions over time,
// just as they can have many appointments.
// ─────────────────────────────────────────────────────────────────────────────

// Admission status — tracks whether this inpatient stay is ongoing or has
// ended. Kept separate from a patient's own Active/Inactive status and
// from an OPD appointment's workflow status — this is its own entity.
//
//   Admitted   — currently occupying a bed. Example: "Vikram Singh,
//                admitted to ICU since 16 Jun for post-accident monitoring."
//   Discharged — the inpatient stay has formally ended (Week 4 Friday's
//                Discharge Summary task implements this transition in
//                full). Until then, this status exists here as a defined
//                concept but isn't yet reachable from the UI.
export const ADMISSION_STATUS_CONFIG = {
  Admitted: { color: "#2563eb", bg: "#eff6ff" },
  Discharged: { color: "#059669", bg: "#ecfdf5" },
};

// Ward type — the category of room/bed a patient is admitted under. Exact
// bed/room NUMBER assignment is Week 4 Wednesday's dedicated Bed
// Allocation task — today's Admission Form only captures the ward
// CATEGORY, not a specific bed.
//
//   General      — shared, multi-bed ward. Most economical. Example:
//                  routine post-surgery recovery, stable conditions.
//   Semi-Private — 2 beds per room. Example: patient wants more privacy
//                  than General but doesn't need a private room.
//   Private      — single-occupancy room. Example: patient/family
//                  requests privacy, or doctor recommends isolation.
//   ICU          — Intensive Care Unit; continuous monitoring for
//                  critical patients. Example: severe trauma, post-major-
//                  surgery critical care, unstable vitals.
export const WARD_TYPE_CONFIG = {
  General: { color: "#2563eb", bg: "#eff6ff" },
  "Semi-Private": { color: "#7c3aed", bg: "#f5f3ff" },
  Private: { color: "#d97706", bg: "#fffbeb" },
  ICU: { color: "#dc2626", bg: "#fef2f2" },
};

// Both seed admissions deliberately link to patients who already have a
// matching Emergency appointment in appointmentsData.js (P-1011, P-1018)
// — the ER visit is what led to the admission, the same way a real
// hospital's records would connect across modules.
export const initialAdmissions = [
  {
    id: "ADM-3001",
    patientId: "P-1011",
    patientName: "Vikram Singh",
    admittingDoctor: "Dr. Neha Singh",
    wardType: "ICU",
    admissionDate: "2026-06-16",
    reasonForAdmission:
      "Post-accident monitoring following road traffic injury",
    diagnosisAtAdmission:
      "Soft tissue trauma with suspected internal injury, ruled out on imaging",
    attendantName: "Rohan Singh",
    attendantPhone: "9876543250",
    expectedStayDays: "3",
    status: "Admitted",
  },
  {
    id: "ADM-3002",
    patientId: "P-1018",
    patientName: "Geeta Sharma",
    admittingDoctor: "Dr. Neha Singh",
    wardType: "Private",
    admissionDate: "2026-06-12",
    reasonForAdmission:
      "Wrist fracture requiring observation post-cast application",
    diagnosisAtAdmission: "Hairline fracture, left wrist",
    attendantName: "Suresh Sharma",
    attendantPhone: "9876543251",
    expectedStayDays: "1",
    status: "Discharged",
  },
];
