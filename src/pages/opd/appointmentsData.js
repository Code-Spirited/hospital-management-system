// ─────────────────────────────────────────────────────────────────────────────
// appointmentsData.js
//
// Seed data for the OPD Appointment Module. Each record links to a real
// patient (by id) from opdData.js / PatientsContext — patientName is kept
// denormalized here purely for fast table rendering without a lookup on
// every row, the same way a real API response would typically include it.
//
// Dates are deliberately consistent with status: past dates never carry
// "Scheduled" (an appointment whose date already passed without being
// resolved isn't realistic — it should have become Completed, Cancelled,
// or No-Show). Future/today dates are the only ones marked "Scheduled".
// Two rows (APT-2010, APT-2019) are deliberately left mid-workflow
// (Consulted / Prescribed) as live examples for testing the "skip ahead to
// billing" actions. APT-2004 demonstrates a Completed visit that has
// billing but NO prescription — proof that skipping prescription entirely
// is a normal, supported outcome, not an edge case.
// ─────────────────────────────────────────────────────────────────────────────

// Appointment status — tracks WORKFLOW STAGE for this encounter, never
// anything about the patient as a person (that distinction is the whole
// point of this model).
//
//   Scheduled  — booked, hasn't happened yet. Example: "Sunita Verma,
//                10:00 tomorrow with Dr. Anil Kumar." Reschedule/Cancel
//                available.
//   Consulted  — the doctor has seen the patient; vitals + diagnosis are
//                recorded (or deliberately left blank). Implies "this
//                might need a prescription or billing next," but neither
//                is forced — either can be skipped straight to Completed.
//   Prescribed — medicines have been prescribed. Implies "this probably
//                needs billing next," but doesn't force it.
//   Completed  — this encounter is fully closed. Reached either by
//                finishing billing (the normal path — billing is always
//                the last stage), or manually at any earlier stage when
//                nothing further is actually needed.
//   Cancelled  — was Scheduled, called off before the visit happened.
//   No-Show    — was Scheduled, the patient never arrived.
export const STATUS_CONFIG = {
  Scheduled: { color: "#2563eb", bg: "#eff6ff" },
  Consulted: { color: "#7c3aed", bg: "#f5f3ff" },
  Prescribed: { color: "#d97706", bg: "#fffbeb" },
  Completed: { color: "#059669", bg: "#ecfdf5" },
  Cancelled: { color: "#94a3b8", bg: "#f8fafc" },
  "No-Show": { color: "#dc2626", bg: "#fef2f2" },
};

// Visit type — what KIND of encounter this is, decided at booking.
//
//   OPD        — standard outpatient visit: walk in, see a doctor, go home
//                same day. Example: first visit, annual checkup, fever.
//   Follow-up  — a return visit to check progress on something already
//                being treated. Example: "come back in 2 weeks to check
//                if the infection subsided."
//   Emergency  — urgent, often unplanned. Example: accident, trauma,
//                chest pain, a child with high fever.
export const VISIT_TYPE_CONFIG = {
  OPD: { color: "#2563eb", bg: "#eff6ff" },
  "Follow-up": { color: "#059669", bg: "#ecfdf5" },
  Emergency: { color: "#dc2626", bg: "#fef2f2" },
};

export const initialAppointments = [
  {
    id: "APT-2001",
    patientId: "P-1001",
    patientName: "Ramesh Sharma",
    doctor: "Dr. Priya Mehta",
    date: "2026-06-23",
    time: "09:30",
    visitType: "OPD",
    status: "Scheduled",
    reason: "Routine checkup and BP monitoring",
  },
  {
    id: "APT-2002",
    patientId: "P-1002",
    patientName: "Sunita Verma",
    doctor: "Dr. Anil Kumar",
    date: "2026-06-24",
    time: "10:00",
    visitType: "Follow-up",
    status: "Scheduled",
    reason: "Follow-up on medication dosage",
  },
  {
    id: "APT-2003",
    patientId: "P-1003",
    patientName: "Arjun Patel",
    doctor: "Dr. Neha Singh",
    date: "2026-06-20",
    time: "08:15",
    visitType: "Emergency",
    status: "Completed",
    reason: "Chest pain, urgent evaluation",
    vitals: {
      bloodPressure: "150/95",
      temperature: "99.1",
      pulse: "92",
      weight: "78",
      spo2: "96",
    },
    diagnosis:
      "Acute anxiety-induced chest pain; cardiac causes ruled out via ECG",
    notes:
      "Patient presented with sudden chest tightness; ECG and vitals stable, no signs of cardiac event",
    advice: "Avoid stress, follow up if symptoms recur",
    prescription: {
      medicines: [
        {
          medicine: "Alprazolam 0.25mg",
          dosage: "1 tablet",
          frequency: "As needed (SOS)",
          duration: "5 days",
          instructions: "Only if anxiety symptoms recur",
        },
      ],
      generalAdvice: "Rest, avoid caffeine, follow up in 1 week",
      issuedOn: "2026-06-20",
    },
    billing: {
      consultationFee: 1000,
      items: [{ description: "ECG Test", amount: 400 }],
      discountPercent: 0,
      taxPercent: 5,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      subtotal: 1400,
      discountAmount: 0,
      taxAmount: 70,
      total: 1470,
      billedOn: "2026-06-20",
    },
  },
  {
    id: "APT-2004",
    patientId: "P-1004",
    patientName: "Kavya Reddy",
    doctor: "Dr. Priya Mehta",
    date: "2026-06-19",
    time: "11:00",
    visitType: "OPD",
    status: "Completed",
    reason: "Annual health screening",
    vitals: {
      bloodPressure: "118/76",
      temperature: "98.4",
      pulse: "70",
      weight: "58",
      spo2: "99",
    },
    diagnosis: "No abnormalities found; routine screening normal",
    notes:
      "Annual health screening completed, all parameters within normal range",
    advice:
      "Continue regular exercise and balanced diet; next screening in 12 months",
    // No prescription — nothing needed, billed directly after consultation.
    billing: {
      consultationFee: 500,
      items: [],
      discountPercent: 0,
      taxPercent: 5,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      subtotal: 500,
      discountAmount: 0,
      taxAmount: 25,
      total: 525,
      billedOn: "2026-06-19",
    },
  },
  {
    id: "APT-2005",
    patientId: "P-1005",
    patientName: "Mohammed Iqbal",
    doctor: "Dr. Ravi Gupta",
    date: "2026-06-19",
    time: "14:30",
    visitType: "Follow-up",
    status: "Completed",
    reason: "Post-surgery recovery check",
    vitals: {
      bloodPressure: "128/82",
      temperature: "98.2",
      pulse: "76",
      weight: "70",
      spo2: "98",
    },
    diagnosis:
      "Post-operative recovery progressing well; wound healing satisfactorily",
    notes: "Surgical site clean, no signs of infection",
    advice: "Continue wound care, avoid heavy lifting for 2 more weeks",
    prescription: {
      medicines: [
        {
          medicine: "Amoxicillin 500mg",
          dosage: "1 capsule",
          frequency: "Three times daily (TDS)",
          duration: "5 days",
          instructions: "After food",
        },
        {
          medicine: "Paracetamol 650mg",
          dosage: "1 tablet",
          frequency: "As needed (SOS)",
          duration: "5 days",
          instructions: "For pain",
        },
      ],
      generalAdvice: "Keep wound dry, follow up in 2 weeks",
      issuedOn: "2026-06-19",
    },
    billing: {
      consultationFee: 300,
      items: [],
      discountPercent: 0,
      taxPercent: 5,
      paymentMethod: "Card",
      paymentStatus: "Paid",
      subtotal: 300,
      discountAmount: 0,
      taxAmount: 15,
      total: 315,
      billedOn: "2026-06-19",
    },
  },
  {
    id: "APT-2006",
    patientId: "P-1006",
    patientName: "Anjali Desai",
    doctor: "Dr. Anil Kumar",
    date: "2026-06-18",
    time: "09:00",
    visitType: "OPD",
    status: "No-Show",
    reason: "General consultation",
  },
  {
    id: "APT-2007",
    patientId: "P-1007",
    patientName: "Deepak Nair",
    doctor: "Dr. Ravi Gupta",
    date: "2026-06-23",
    time: "10:30",
    visitType: "OPD",
    status: "Scheduled",
    reason: "Skin allergy consultation",
  },
  {
    id: "APT-2008",
    patientId: "P-1008",
    patientName: "Pooja Iyer",
    doctor: "Dr. Sunita Rao",
    date: "2026-06-24",
    time: "11:45",
    visitType: "Follow-up",
    status: "Scheduled",
    reason: "Pregnancy follow-up",
  },
  {
    id: "APT-2009",
    patientId: "P-1009",
    patientName: "Harish Menon",
    doctor: "Dr. Neha Singh",
    date: "2026-06-17",
    time: "15:00",
    visitType: "OPD",
    status: "Completed",
    reason: "Diabetes management review",
    vitals: {
      bloodPressure: "132/85",
      temperature: "98.6",
      pulse: "78",
      weight: "82",
      spo2: "97",
    },
    diagnosis:
      "Type 2 diabetes, moderately controlled; HbA1c review recommended",
    notes: "Blood sugar levels slightly elevated since last visit",
    advice: "Dietary modification, increase physical activity",
    prescription: {
      medicines: [
        {
          medicine: "Metformin 500mg",
          dosage: "1 tablet",
          frequency: "Twice daily (BD)",
          duration: "30 days",
          instructions: "After food",
        },
      ],
      generalAdvice: "Recheck blood sugar in 4 weeks",
      issuedOn: "2026-06-17",
    },
    billing: {
      consultationFee: 500,
      items: [{ description: "Blood Sugar Test", amount: 150 }],
      discountPercent: 0,
      taxPercent: 5,
      paymentMethod: "Insurance",
      paymentStatus: "Paid",
      subtotal: 650,
      discountAmount: 0,
      taxAmount: 32.5,
      total: 682.5,
      billedOn: "2026-06-17",
    },
  },
  {
    id: "APT-2010",
    patientId: "P-1010",
    patientName: "Lakshmi Pillai",
    doctor: "Dr. Priya Mehta",
    date: "2026-06-22",
    time: "09:15",
    visitType: "Follow-up",
    status: "Consulted",
    reason: "Knee pain follow-up",
    vitals: {
      bloodPressure: "138/88",
      temperature: "98.3",
      pulse: "74",
      weight: "65",
      spo2: "98",
    },
    diagnosis:
      "Mild osteoarthritis of the right knee; no further medication needed at this time",
    notes: "Pain has reduced since last visit; range of motion improved",
    advice: "Continue physiotherapy exercises",
    // Deliberately Consulted with no prescription/billing yet — a live test
    // row for the "Generate Bill" action appearing directly on a Consulted
    // appointment, skipping Prescription entirely.
  },
  {
    id: "APT-2011",
    patientId: "P-1011",
    patientName: "Vikram Singh",
    doctor: "Dr. Neha Singh",
    date: "2026-06-16",
    time: "13:00",
    visitType: "Emergency",
    status: "Completed",
    reason: "Accident injury treatment",
    vitals: {
      bloodPressure: "110/70",
      temperature: "98.9",
      pulse: "98",
      weight: "74",
      spo2: "95",
    },
    diagnosis:
      "Soft tissue injury to left forearm; fracture ruled out via X-ray",
    notes: "Road accident; minor abrasions and swelling, no fracture detected",
    advice: "Ice application, rest the arm",
    prescription: {
      medicines: [
        {
          medicine: "Ibuprofen 400mg",
          dosage: "1 tablet",
          frequency: "Twice daily (BD)",
          duration: "5 days",
          instructions: "After food",
        },
      ],
      generalAdvice: "Avoid strain on the arm, follow up if swelling persists",
      issuedOn: "2026-06-16",
    },
    billing: {
      consultationFee: 1000,
      items: [{ description: "X-Ray - Forearm", amount: 600 }],
      discountPercent: 0,
      taxPercent: 5,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      subtotal: 1600,
      discountAmount: 0,
      taxAmount: 80,
      total: 1680,
      billedOn: "2026-06-16",
    },
  },
  {
    id: "APT-2012",
    patientId: "P-1012",
    patientName: "Meena Krishnan",
    doctor: "Dr. Ravi Gupta",
    date: "2026-06-22",
    time: "16:00",
    visitType: "OPD",
    status: "Scheduled",
    reason: "Cardiology consultation",
  },
  {
    id: "APT-2013",
    patientId: "P-1013",
    patientName: "Rajesh Tiwari",
    doctor: "Dr. Anil Kumar",
    date: "2026-06-15",
    time: "10:00",
    visitType: "OPD",
    status: "Cancelled",
    reason: "General checkup — patient rescheduled",
  },
  {
    id: "APT-2014",
    patientId: "P-1014",
    patientName: "Nisha Kapoor",
    doctor: "Dr. Sunita Rao",
    date: "2026-06-23",
    time: "11:00",
    visitType: "OPD",
    status: "Scheduled",
    reason: "Routine gynaecology visit",
  },
  {
    id: "APT-2015",
    patientId: "P-1015",
    patientName: "Santosh Kumar",
    doctor: "Dr. Mohammed Ali",
    date: "2026-06-14",
    time: "09:30",
    visitType: "Follow-up",
    status: "Completed",
    reason: "Orthopaedic follow-up",
    vitals: {
      bloodPressure: "124/80",
      temperature: "98.5",
      pulse: "72",
      weight: "68",
      spo2: "98",
    },
    diagnosis: "Recovering well post-fracture; healing on schedule",
    notes: "X-ray shows good callus formation",
    advice: "Continue using the brace for 2 more weeks",
    prescription: {
      medicines: [
        {
          medicine: "Calcium + Vitamin D3",
          dosage: "1 tablet",
          frequency: "Once daily (OD)",
          duration: "30 days",
          instructions: "After breakfast",
        },
      ],
      generalAdvice: "Follow up in 2 weeks with new X-ray",
      issuedOn: "2026-06-14",
    },
    billing: {
      consultationFee: 300,
      items: [],
      discountPercent: 0,
      taxPercent: 5,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      subtotal: 300,
      discountAmount: 0,
      taxAmount: 15,
      total: 315,
      billedOn: "2026-06-14",
    },
  },
  {
    id: "APT-2016",
    patientId: "P-1016",
    patientName: "Divya Nambiar",
    doctor: "Dr. Priya Mehta",
    date: "2026-06-24",
    time: "14:00",
    visitType: "OPD",
    status: "Scheduled",
    reason: "Migraine evaluation",
  },
  {
    id: "APT-2017",
    patientId: "P-1017",
    patientName: "Ashok Pandey",
    doctor: "Dr. Ravi Gupta",
    date: "2026-06-13",
    time: "10:30",
    visitType: "OPD",
    status: "Completed",
    reason: "Hypertension review",
    vitals: {
      bloodPressure: "145/92",
      temperature: "98.4",
      pulse: "80",
      weight: "76",
      spo2: "97",
    },
    diagnosis: "Hypertension, stage 1; medication adjustment required",
    notes: "BP higher than target range despite current medication",
    advice: "Reduce salt intake, monitor BP daily",
    prescription: {
      medicines: [
        {
          medicine: "Amlodipine 5mg",
          dosage: "1 tablet",
          frequency: "Once daily (OD)",
          duration: "30 days",
          instructions: "In the morning",
        },
      ],
      generalAdvice: "Recheck BP in 2 weeks",
      issuedOn: "2026-06-13",
    },
    billing: {
      consultationFee: 500,
      items: [],
      discountPercent: 10,
      taxPercent: 5,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      subtotal: 500,
      discountAmount: 50,
      taxAmount: 22.5,
      total: 472.5,
      billedOn: "2026-06-13",
    },
  },
  {
    id: "APT-2018",
    patientId: "P-1018",
    patientName: "Geeta Sharma",
    doctor: "Dr. Neha Singh",
    date: "2026-06-12",
    time: "08:00",
    visitType: "Emergency",
    status: "Completed",
    reason: "Fall injury assessment",
    vitals: {
      bloodPressure: "128/84",
      temperature: "98.7",
      pulse: "88",
      weight: "60",
      spo2: "96",
    },
    diagnosis: "Hairline fracture of the left wrist confirmed via X-ray",
    notes: "Fall at home; wrist swelling and tenderness",
    advice: "Cast applied; avoid weight-bearing on the wrist",
    prescription: {
      medicines: [
        {
          medicine: "Paracetamol 650mg",
          dosage: "1 tablet",
          frequency: "Three times daily (TDS)",
          duration: "5 days",
          instructions: "After food",
        },
      ],
      generalAdvice: "Keep cast dry, follow up in 3 weeks for cast removal",
      issuedOn: "2026-06-12",
    },
    billing: {
      consultationFee: 1000,
      items: [
        { description: "X-Ray - Wrist", amount: 500 },
        { description: "Cast Application", amount: 800 },
      ],
      discountPercent: 0,
      taxPercent: 5,
      paymentMethod: "Insurance",
      paymentStatus: "Paid",
      subtotal: 2300,
      discountAmount: 0,
      taxAmount: 115,
      total: 2415,
      billedOn: "2026-06-12",
    },
  },
  {
    id: "APT-2019",
    patientId: "P-1019",
    patientName: "Rahul Joshi",
    doctor: "Dr. Mohammed Ali",
    date: "2026-06-22",
    time: "12:30",
    visitType: "OPD",
    status: "Prescribed",
    reason: "Sports injury consultation",
    vitals: {
      bloodPressure: "118/74",
      temperature: "98.2",
      pulse: "68",
      weight: "64",
      spo2: "99",
    },
    diagnosis: "Grade 1 ankle sprain from sports activity",
    notes: "Mild swelling, no fracture suspected; advised rest",
    advice: "RICE protocol — rest, ice, compression, elevation",
    prescription: {
      medicines: [
        {
          medicine: "Diclofenac Gel",
          dosage: "Apply locally",
          frequency: "Twice daily (BD)",
          duration: "7 days",
          instructions: "Apply on affected area",
        },
      ],
      generalAdvice: "Avoid sports activity for 1 week",
      issuedOn: "2026-06-22",
    },
    // Deliberately Prescribed with no billing yet — a live test row for
    // the Billing page reached from a Prescribed appointment.
  },
  {
    id: "APT-2020",
    patientId: "P-1020",
    patientName: "Priya Nair",
    doctor: "Dr. Sunita Rao",
    date: "2026-06-25",
    time: "10:00",
    visitType: "Follow-up",
    status: "Scheduled",
    reason: "Postnatal checkup",
  },
];
