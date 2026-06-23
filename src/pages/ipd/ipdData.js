// ─────────────────────────────────────────────────────────────────────────────
// ipdData.js
//
// IPD admission registry. An admission record represents ONE inpatient
// stay: who, which doctor, what ward type, why, and when. Separate from
// both the Patient record (permanent identity) and an OPD Appointment (an
// outpatient encounter) — one patient can have many admissions over time.
//
// bedNumber (added Week 4 Wednesday) is a SPECIFIC bed within the ward
// (1-indexed, scoped to that ward type — "General Bed 3" and "ICU Bed 3"
// are different beds). Deliberately left unset on about half the
// currently-admitted seed records: this models a realistic backlog of
// patients admitted before bed-level tracking existed, which the new
// BedAllocation.jsx page lets you resolve interactively rather than
// pretending every record was always perfectly tracked.
// ─────────────────────────────────────────────────────────────────────────────

// Admission status — tracks whether this inpatient stay is ongoing or has
// ended. Kept separate from a patient's own Active/Inactive status and
// from an OPD appointment's workflow status — this is its own entity.
//
//   Admitted   — currently occupying a bed. Example: "Vikram Singh,
//                admitted to ICU since 16 Jun for post-accident monitoring."
//   Discharged — the inpatient stay has formally ended (Week 4 Friday's
//                Discharge Summary task implements this transition in
//                full).
export const ADMISSION_STATUS_CONFIG = {
  Admitted: { color: "#2563eb", bg: "#eff6ff" },
  Discharged: { color: "#059669", bg: "#ecfdf5" },
};

// Ward type — the category of room/bed a patient is admitted under.
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

// Total bed count per ward CATEGORY. Placeholder figures until a real
// facilities/bed-inventory API exists (Week 8).
export const WARD_CAPACITY = {
  General: 40,
  "Semi-Private": 20,
  Private: 10,
  ICU: 8,
};

export const initialAdmissions = [
  // ── General Ward (10 Admitted · 5 have a specific bed, 5 don't yet) ──────
  {
    id: "ADM-3003",
    patientId: "P-1001",
    patientName: "Ramesh Sharma",
    admittingDoctor: "Dr. Priya Mehta",
    wardType: "General",
    admissionDate: "2026-06-21",
    reasonForAdmission: "Post-procedure observation following minor surgery",
    diagnosisAtAdmission: "Recovering well, stable vitals",
    attendantName: "Sunil Sharma",
    attendantPhone: "9876543260",
    expectedStayDays: "3",
    status: "Admitted",
    bedNumber: 1,
  },
  {
    id: "ADM-3004",
    patientId: "P-1004",
    patientName: "Kavya Reddy",
    admittingDoctor: "Dr. Priya Mehta",
    wardType: "General",
    admissionDate: "2026-06-20",
    reasonForAdmission: "Dehydration and viral fever requiring IV fluids",
    diagnosisAtAdmission: "Viral fever with mild dehydration",
    attendantName: "Lakshmi Reddy",
    attendantPhone: "9876543261",
    expectedStayDays: "2",
    status: "Admitted",
    bedNumber: 2,
  },
  {
    id: "ADM-3005",
    patientId: "P-1007",
    patientName: "Deepak Nair",
    admittingDoctor: "Dr. Ravi Gupta",
    wardType: "General",
    admissionDate: "2026-06-19",
    reasonForAdmission: "Severe allergic reaction requiring monitoring",
    diagnosisAtAdmission: "Acute allergic dermatitis, stabilized",
    attendantName: "Meera Nair",
    attendantPhone: "9876543262",
    expectedStayDays: "2",
    status: "Admitted",
    bedNumber: 3,
  },
  {
    id: "ADM-3006",
    patientId: "P-1009",
    patientName: "Harish Menon",
    admittingDoctor: "Dr. Neha Singh",
    wardType: "General",
    admissionDate: "2026-06-22",
    reasonForAdmission: "Diabetic ketoacidosis under management",
    diagnosisAtAdmission: "Type 2 diabetes with DKA, responding to treatment",
    attendantName: "Radha Menon",
    attendantPhone: "9876543263",
    expectedStayDays: "4",
    status: "Admitted",
    bedNumber: 4,
  },
  {
    id: "ADM-3007",
    patientId: "P-1012",
    patientName: "Meena Krishnan",
    admittingDoctor: "Dr. Ravi Gupta",
    wardType: "General",
    admissionDate: "2026-06-21",
    reasonForAdmission: "Post-cardiology procedure observation",
    diagnosisAtAdmission: "Stable, minor arrhythmia under watch",
    attendantName: "Krishnan Iyer",
    attendantPhone: "9876543264",
    expectedStayDays: "2",
    status: "Admitted",
    bedNumber: 5,
  },
  {
    id: "ADM-3008",
    patientId: "P-1014",
    patientName: "Nisha Kapoor",
    admittingDoctor: "Dr. Sunita Rao",
    wardType: "General",
    admissionDate: "2026-06-22",
    reasonForAdmission: "Gynaecological procedure recovery",
    diagnosisAtAdmission: "Stable post-procedure",
    attendantName: "Arvind Kapoor",
    attendantPhone: "9876543265",
    expectedStayDays: "2",
    status: "Admitted",
  },
  {
    id: "ADM-3009",
    patientId: "P-1016",
    patientName: "Divya Nambiar",
    admittingDoctor: "Dr. Priya Mehta",
    wardType: "General",
    admissionDate: "2026-06-18",
    reasonForAdmission: "Severe migraine with vomiting requiring IV management",
    diagnosisAtAdmission: "Status migrainosus, responding to IV medication",
    attendantName: "Rajan Nambiar",
    attendantPhone: "9876543266",
    expectedStayDays: "1",
    status: "Admitted",
  },
  {
    id: "ADM-3010",
    patientId: "P-1019",
    patientName: "Rahul Joshi",
    admittingDoctor: "Dr. Mohammed Ali",
    wardType: "General",
    admissionDate: "2026-06-22",
    reasonForAdmission: "Sports injury requiring post-op observation",
    diagnosisAtAdmission: "Stable following minor orthopaedic procedure",
    attendantName: "Vijay Joshi",
    attendantPhone: "9876543267",
    expectedStayDays: "2",
    status: "Admitted",
  },
  {
    id: "ADM-3011",
    patientId: "P-1021",
    patientName: "Suresh Babu",
    admittingDoctor: "Dr. Anil Kumar",
    wardType: "General",
    admissionDate: "2026-06-20",
    reasonForAdmission: "Pneumonia requiring IV antibiotics",
    diagnosisAtAdmission: "Community-acquired pneumonia, improving",
    attendantName: "Lakshmi Babu",
    attendantPhone: "9876543268",
    expectedStayDays: "5",
    status: "Admitted",
  },
  {
    id: "ADM-3012",
    patientId: "P-1024",
    patientName: "Sudha Pillai",
    admittingDoctor: "Dr. Mohammed Ali",
    wardType: "General",
    admissionDate: "2026-06-21",
    reasonForAdmission: "Hip pain evaluation and observation",
    diagnosisAtAdmission: "Suspected early osteoarthritis, under evaluation",
    attendantName: "Mohan Pillai",
    attendantPhone: "9876543269",
    expectedStayDays: "3",
    status: "Admitted",
  },

  // ── Semi-Private Ward (6 Admitted · 3 have a specific bed) ────────────────
  {
    id: "ADM-3013",
    patientId: "P-1002",
    patientName: "Sunita Verma",
    admittingDoctor: "Dr. Anil Kumar",
    wardType: "Semi-Private",
    admissionDate: "2026-06-21",
    reasonForAdmission: "Medication-resistant hypertension under observation",
    diagnosisAtAdmission: "Hypertensive crisis, stabilizing",
    attendantName: "Rakesh Verma",
    attendantPhone: "9876543270",
    expectedStayDays: "3",
    status: "Admitted",
    bedNumber: 1,
  },
  {
    id: "ADM-3014",
    patientId: "P-1005",
    patientName: "Mohammed Iqbal",
    admittingDoctor: "Dr. Ravi Gupta",
    wardType: "Semi-Private",
    admissionDate: "2026-06-19",
    reasonForAdmission: "Post-surgical recovery requiring extended monitoring",
    diagnosisAtAdmission: "Recovering well from prior surgery",
    attendantName: "Ayesha Iqbal",
    attendantPhone: "9876543271",
    expectedStayDays: "4",
    status: "Admitted",
    bedNumber: 2,
  },
  {
    id: "ADM-3015",
    patientId: "P-1008",
    patientName: "Pooja Iyer",
    admittingDoctor: "Dr. Sunita Rao",
    wardType: "Semi-Private",
    admissionDate: "2026-06-22",
    reasonForAdmission: "High-risk pregnancy under close observation",
    diagnosisAtAdmission: "Third trimester, mild preeclampsia, stable",
    attendantName: "Vivek Iyer",
    attendantPhone: "9876543272",
    expectedStayDays: "5",
    status: "Admitted",
    bedNumber: 3,
  },
  {
    id: "ADM-3016",
    patientId: "P-1013",
    patientName: "Rajesh Tiwari",
    admittingDoctor: "Dr. Anil Kumar",
    wardType: "Semi-Private",
    admissionDate: "2026-06-20",
    reasonForAdmission: "Cardiac monitoring following abnormal ECG",
    diagnosisAtAdmission: "Stable angina, under medical management",
    attendantName: "Shalini Tiwari",
    attendantPhone: "9876543273",
    expectedStayDays: "3",
    status: "Admitted",
  },
  {
    id: "ADM-3017",
    patientId: "P-1020",
    patientName: "Priya Nair",
    admittingDoctor: "Dr. Sunita Rao",
    wardType: "Semi-Private",
    admissionDate: "2026-06-22",
    reasonForAdmission: "Postnatal complications under observation",
    diagnosisAtAdmission:
      "Mild postpartum infection, responding to antibiotics",
    attendantName: "Anoop Nair",
    attendantPhone: "9876543274",
    expectedStayDays: "2",
    status: "Admitted",
  },
  {
    id: "ADM-3018",
    patientId: "P-1026",
    patientName: "Rekha Singh",
    admittingDoctor: "Dr. Mohammed Ali",
    wardType: "Semi-Private",
    admissionDate: "2026-06-21",
    reasonForAdmission: "Severe back pain requiring traction therapy",
    diagnosisAtAdmission: "Lumbar disc prolapse, conservative management",
    attendantName: "Manjeet Singh",
    attendantPhone: "9876543275",
    expectedStayDays: "4",
    status: "Admitted",
  },

  // ── Private Ward (4 Admitted · 2 have a specific bed) ─────────────────────
  {
    id: "ADM-3019",
    patientId: "P-1022",
    patientName: "Anita Bose",
    admittingDoctor: "Dr. Neha Singh",
    wardType: "Private",
    admissionDate: "2026-06-20",
    reasonForAdmission: "Post-surgical recovery, family requested private room",
    diagnosisAtAdmission: "Recovering well, no complications",
    attendantName: "Pradeep Bose",
    attendantPhone: "9876543276",
    expectedStayDays: "3",
    status: "Admitted",
    bedNumber: 1,
  },
  {
    id: "ADM-3020",
    patientId: "P-1027",
    patientName: "Venkat Rao",
    admittingDoctor: "Dr. Ravi Gupta",
    wardType: "Private",
    admissionDate: "2026-06-22",
    reasonForAdmission: "Cardiac evaluation requiring isolation and rest",
    diagnosisAtAdmission: "Suspected mild cardiac event, under evaluation",
    attendantName: "Padma Rao",
    attendantPhone: "9876543277",
    expectedStayDays: "3",
    status: "Admitted",
    bedNumber: 2,
  },
  {
    id: "ADM-3021",
    patientId: "P-1029",
    patientName: "Ramesh Iyer",
    admittingDoctor: "Dr. Priya Mehta",
    wardType: "Private",
    admissionDate: "2026-06-21",
    reasonForAdmission: "Immunocompromised patient requiring isolation",
    diagnosisAtAdmission:
      "Post-chemotherapy, low immunity, precautionary isolation",
    attendantName: "Kavitha Iyer",
    attendantPhone: "9876543278",
    expectedStayDays: "5",
    status: "Admitted",
  },
  {
    id: "ADM-3022",
    patientId: "P-1031",
    patientName: "Gopal Krishnan",
    admittingDoctor: "Dr. Mohammed Ali",
    wardType: "Private",
    admissionDate: "2026-06-19",
    reasonForAdmission: "Elderly patient, family requested private care",
    diagnosisAtAdmission: "Stable, under observation for fatigue and weakness",
    attendantName: "Saroja Krishnan",
    attendantPhone: "9876543279",
    expectedStayDays: "4",
    status: "Admitted",
  },

  // ── ICU (3 Admitted · 2 have a specific bed) ──────────────────────────────
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
    bedNumber: 1,
  },
  {
    id: "ADM-3023",
    patientId: "P-1003",
    patientName: "Arjun Patel",
    admittingDoctor: "Dr. Neha Singh",
    wardType: "ICU",
    admissionDate: "2026-06-20",
    reasonForAdmission:
      "Continuous cardiac monitoring after chest pain episode",
    diagnosisAtAdmission:
      "Suspected cardiac event, ruled out via ECG, under observation",
    attendantName: "Mahesh Patel",
    attendantPhone: "9876543280",
    expectedStayDays: "2",
    status: "Admitted",
    bedNumber: 2,
  },
  {
    id: "ADM-3024",
    patientId: "P-1023",
    patientName: "Karthik Rajan",
    admittingDoctor: "Dr. Ravi Gupta",
    wardType: "ICU",
    admissionDate: "2026-06-22",
    reasonForAdmission:
      "Severe respiratory distress requiring close monitoring",
    diagnosisAtAdmission:
      "Acute respiratory infection with low oxygen saturation",
    attendantName: "Geetha Rajan",
    attendantPhone: "9876543281",
    expectedStayDays: "3",
    status: "Admitted",
  },

  // ── Discharged (historical, beds already freed) ───────────────────────────
  {
    id: "ADM-3025",
    patientId: "P-1010",
    patientName: "Lakshmi Pillai",
    admittingDoctor: "Dr. Priya Mehta",
    wardType: "General",
    admissionDate: "2026-06-08",
    reasonForAdmission: "Knee replacement post-operative recovery",
    diagnosisAtAdmission: "Post-op recovery, uneventful",
    attendantName: "Suresh Pillai",
    attendantPhone: "9876543282",
    expectedStayDays: "5",
    status: "Discharged",
  },
  {
    id: "ADM-3026",
    patientId: "P-1017",
    patientName: "Ashok Pandey",
    admittingDoctor: "Dr. Ravi Gupta",
    wardType: "Semi-Private",
    admissionDate: "2026-06-10",
    reasonForAdmission: "Hypertensive episode requiring stabilization",
    diagnosisAtAdmission: "Hypertension, stabilized on medication",
    attendantName: "Sunita Pandey",
    attendantPhone: "9876543283",
    expectedStayDays: "2",
    status: "Discharged",
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
  {
    id: "ADM-3027",
    patientId: "P-1028",
    patientName: "Chitra Menon",
    admittingDoctor: "Dr. Neha Singh",
    wardType: "ICU",
    admissionDate: "2026-06-05",
    reasonForAdmission:
      "Severe allergic reaction requiring emergency stabilization",
    diagnosisAtAdmission: "Anaphylaxis, fully stabilized",
    attendantName: "Ravi Menon",
    attendantPhone: "9876543284",
    expectedStayDays: "1",
    status: "Discharged",
  },
];
