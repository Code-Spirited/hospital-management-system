// ─────────────────────────────────────────────────────────────────────────────
// userData.js
//
// System users — staff who log into this HMS, distinct from Patients
// (who receive care) and from opdData.js's DOCTORS array (a flat list of
// dropdown strings with no real identity behind them, used throughout
// OPD/IPD forms since Week 3).
//
// CONTINUITY, NOT UNIFICATION: this file's six Doctor-role users reuse
// the exact same names already seeded in opdData.js's DOCTORS array,
// with departments inferred from each doctor's actual historical
// appointment/admission reasons (e.g. Dr. Sunita Rao's OPD seed data was
// consistently gynaecology-related, so she's Gynaecology & Obstetrics
// here). The technically correct long-term fix — DOCTORS derived live
// from Users where role === "Doctor", so adding a doctor here updates
// every OPD/IPD dropdown automatically — is NOT done today. That would
// require editing opdData.js and five files that import DOCTORS, none
// confirmed fresh in this conversation. Flagged as real, valuable future
// work, not silently skipped.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_CONFIG = {
  Doctor: { color: "#2563eb", bg: "#eff6ff" },
  Nurse: { color: "#7c3aed", bg: "#f5f3ff" },
  Pharmacist: { color: "#059669", bg: "#ecfdf5" },
  Receptionist: { color: "#d97706", bg: "#fffbeb" },
  "Lab Technician": { color: "#0d9488", bg: "#f0fdfa" },
  Administrator: { color: "#dc2626", bg: "#fef2f2" },
};

// Suspended is deliberately distinct from Inactive — a real HR/access-
// control difference. Inactive: role no longer active (transferred,
// long leave). Suspended: temporarily blocked from logging in pending
// review (policy violation, security concern).
export const USER_STATUS_CONFIG = {
  Active: { color: "#059669", bg: "#ecfdf5" },
  Inactive: { color: "#64748b", bg: "#f1f5f9" },
  Suspended: { color: "#dc2626", bg: "#fef2f2" },
};

// Shown on the Roles & Permissions reference page, alongside a live
// count of Active users currently holding each role.
export const ROLE_DESCRIPTIONS = {
  Doctor:
    "Diagnoses and treats patients; manages consultations, prescriptions, and inpatient care.",
  Nurse:
    "Provides direct patient care; manages ward operations and treatment administration.",
  Pharmacist:
    "Manages the medicine inventory and dispenses prescriptions to patients.",
  Receptionist:
    "Handles patient registration, appointment scheduling, and OPD billing.",
  "Lab Technician":
    "Processes diagnostic tests and records results for patient care.",
  Administrator:
    "Oversees system configuration, staff accounts, and hospital-wide operations.",
};

// Modules a role's permission can be scoped to — matches the app's real
// top-level sections (Sidebar's own menu list) exactly.
export const MODULES = [
  "Dashboard",
  "OPD",
  "IPD",
  "Pharmacy",
  "Users",
  "Reports",
];

export const PERMISSION_LEVELS = ["No Access", "View Only", "Full Access"];

export const PERMISSION_LEVEL_CONFIG = {
  "No Access": { color: "#64748b", bg: "#f1f5f9" },
  "View Only": { color: "#2563eb", bg: "#eff6ff" },
  "Full Access": { color: "#059669", bg: "#ecfdf5" },
};

// Default role → module → access-level matrix, reflecting real hospital
// role scopes (e.g. a Pharmacist needs to VIEW OPD/IPD prescriptions to
// fill them, but only needs Full Access within Pharmacy itself).
// Administrator is intentionally fixed at Full Access everywhere and
// excluded from the editable matrix on the Roles & Permissions page — a
// real safeguard against ever accidentally locking out the one role
// capable of fixing a misconfigured permission set.
export const DEFAULT_PERMISSIONS = {
  Doctor: {
    Dashboard: "View Only",
    OPD: "Full Access",
    IPD: "Full Access",
    Pharmacy: "View Only",
    Users: "No Access",
    Reports: "View Only",
  },
  Nurse: {
    Dashboard: "View Only",
    OPD: "View Only",
    IPD: "Full Access",
    Pharmacy: "View Only",
    Users: "No Access",
    Reports: "No Access",
  },
  Pharmacist: {
    Dashboard: "View Only",
    OPD: "View Only",
    IPD: "View Only",
    Pharmacy: "Full Access",
    Users: "No Access",
    Reports: "View Only",
  },
  Receptionist: {
    Dashboard: "View Only",
    OPD: "Full Access",
    IPD: "View Only",
    Pharmacy: "No Access",
    Users: "No Access",
    Reports: "No Access",
  },
  "Lab Technician": {
    Dashboard: "View Only",
    OPD: "View Only",
    IPD: "View Only",
    Pharmacy: "No Access",
    Users: "No Access",
    Reports: "No Access",
  },
  Administrator: {
    Dashboard: "Full Access",
    OPD: "Full Access",
    IPD: "Full Access",
    Pharmacy: "Full Access",
    Users: "Full Access",
    Reports: "Full Access",
  },
};

export const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Gynaecology & Obstetrics",
  "ENT",
  "Dermatology",
  "Emergency & Trauma",
  "ICU",
  "Radiology",
  "Pathology & Lab",
  "Pharmacy",
  "Administration",
  "Front Office",
];

export const initialUsers = [
  // ── Doctors (6) — names match opdData.js's DOCTORS exactly ──────────────
  {
    id: "U-1001",
    fullName: "Dr. Priya Mehta",
    email: "priya.mehta@auctechhms.com",
    phone: "9876500101",
    role: "Doctor",
    department: "General Medicine",
    gender: "Female",
    status: "Active",
    joinedOn: "2021-06-12",
    lastLogin: "2026-07-05T08:15:00",
  },
  {
    id: "U-1002",
    fullName: "Dr. Anil Kumar",
    email: "anil.kumar@auctechhms.com",
    phone: "9876500102",
    role: "Doctor",
    department: "General Medicine",
    gender: "Male",
    status: "Active",
    joinedOn: "2019-11-03",
    lastLogin: "2026-07-04T17:20:00",
  },
  {
    id: "U-1003",
    fullName: "Dr. Neha Singh",
    email: "neha.singh@auctechhms.com",
    phone: "9876500103",
    role: "Doctor",
    department: "Emergency & Trauma",
    gender: "Female",
    status: "Active",
    joinedOn: "2020-02-18",
    lastLogin: "2026-07-05T06:45:00",
  },
  {
    id: "U-1004",
    fullName: "Dr. Ravi Gupta",
    email: "ravi.gupta@auctechhms.com",
    phone: "9876500104",
    role: "Doctor",
    department: "Cardiology",
    gender: "Male",
    status: "Active",
    joinedOn: "2018-09-25",
    lastLogin: "2026-07-03T14:10:00",
  },
  {
    id: "U-1005",
    fullName: "Dr. Sunita Rao",
    email: "sunita.rao@auctechhms.com",
    phone: "9876500105",
    role: "Doctor",
    department: "Gynaecology & Obstetrics",
    gender: "Female",
    status: "Active",
    joinedOn: "2022-01-10",
    lastLogin: "2026-07-05T09:30:00",
  },
  {
    id: "U-1006",
    fullName: "Dr. Mohammed Ali",
    email: "mohammed.ali@auctechhms.com",
    phone: "9876500106",
    role: "Doctor",
    department: "Orthopedics",
    gender: "Male",
    status: "Active",
    joinedOn: "2017-04-30",
    lastLogin: "2026-07-02T11:00:00",
  },

  // ── Nurses (6) ────────────────────────────────────────────────────────────
  {
    id: "U-1007",
    fullName: "Kavita Joshi",
    email: "kavita.joshi@auctechhms.com",
    phone: "9876500107",
    role: "Nurse",
    department: "ICU",
    gender: "Female",
    status: "Active",
    joinedOn: "2021-03-15",
    lastLogin: "2026-07-05T07:00:00",
  },
  {
    id: "U-1008",
    fullName: "Suresh Nair",
    email: "suresh.nair@auctechhms.com",
    phone: "9876500108",
    role: "Nurse",
    department: "Emergency & Trauma",
    gender: "Male",
    status: "Active",
    joinedOn: "2020-08-20",
    lastLogin: "2026-07-04T22:15:00",
  },
  {
    id: "U-1009",
    fullName: "Anjali Kapoor",
    email: "anjali.kapoor@auctechhms.com",
    phone: "9876500109",
    role: "Nurse",
    department: "Pediatrics",
    gender: "Female",
    status: "Active",
    joinedOn: "2022-05-02",
    lastLogin: "2026-07-05T08:50:00",
  },
  {
    id: "U-1010",
    fullName: "Ramesh Yadav",
    email: "ramesh.yadav@auctechhms.com",
    phone: "9876500110",
    role: "Nurse",
    department: "General Medicine",
    gender: "Male",
    status: "Active",
    joinedOn: "2019-12-11",
    lastLogin: "2026-07-04T15:30:00",
  },
  {
    id: "U-1011",
    fullName: "Deepika Menon",
    email: "deepika.menon@auctechhms.com",
    phone: "9876500111",
    role: "Nurse",
    department: "Gynaecology & Obstetrics",
    gender: "Female",
    status: "Active",
    joinedOn: "2023-02-28",
    lastLogin: "2026-07-05T09:05:00",
  },
  {
    id: "U-1012",
    fullName: "Vikram Chauhan",
    email: "vikram.chauhan@auctechhms.com",
    phone: "9876500112",
    role: "Nurse",
    department: "Orthopedics",
    gender: "Male",
    status: "Inactive",
    joinedOn: "2018-07-19",
    lastLogin: "2026-05-19T10:00:00",
  },

  // ── Receptionists (3) ─────────────────────────────────────────────────────
  {
    id: "U-1013",
    fullName: "Pooja Sharma",
    email: "pooja.sharma@auctechhms.com",
    phone: "9876500113",
    role: "Receptionist",
    department: "Front Office",
    gender: "Female",
    status: "Active",
    joinedOn: "2022-09-05",
    lastLogin: "2026-07-05T08:00:00",
  },
  {
    id: "U-1014",
    fullName: "Arjun Verma",
    email: "arjun.verma@auctechhms.com",
    phone: "9876500114",
    role: "Receptionist",
    department: "Front Office",
    gender: "Male",
    status: "Active",
    joinedOn: "2021-11-14",
    lastLogin: "2026-07-04T18:45:00",
  },
  {
    id: "U-1015",
    fullName: "Rekha Iyer",
    email: "rekha.iyer@auctechhms.com",
    phone: "9876500115",
    role: "Receptionist",
    department: "Front Office",
    gender: "Female",
    status: "Suspended",
    joinedOn: "2020-04-22",
    lastLogin: "2026-06-15T09:20:00",
  },

  // ── Pharmacists (3) ───────────────────────────────────────────────────────
  {
    id: "U-1016",
    fullName: "Sanjay Bhatt",
    email: "sanjay.bhatt@auctechhms.com",
    phone: "9876500116",
    role: "Pharmacist",
    department: "Pharmacy",
    gender: "Male",
    status: "Active",
    joinedOn: "2019-06-30",
    lastLogin: "2026-07-05T09:45:00",
  },
  {
    id: "U-1017",
    fullName: "Meera Pillai",
    email: "meera.pillai@auctechhms.com",
    phone: "9876500117",
    role: "Pharmacist",
    department: "Pharmacy",
    gender: "Female",
    status: "Active",
    joinedOn: "2021-10-08",
    lastLogin: "2026-07-05T07:30:00",
  },
  {
    id: "U-1018",
    fullName: "Rajiv Malhotra",
    email: "rajiv.malhotra@auctechhms.com",
    phone: "9876500118",
    role: "Pharmacist",
    department: "Pharmacy",
    gender: "Male",
    status: "Active",
    joinedOn: "2023-01-16",
    lastLogin: "2026-07-04T20:10:00",
  },

  // ── Lab Technicians (3) ───────────────────────────────────────────────────
  {
    id: "U-1019",
    fullName: "Nisha Reddy",
    email: "nisha.reddy@auctechhms.com",
    phone: "9876500119",
    role: "Lab Technician",
    department: "Pathology & Lab",
    gender: "Female",
    status: "Active",
    joinedOn: "2020-03-27",
    lastLogin: "2026-07-05T06:20:00",
  },
  {
    id: "U-1020",
    fullName: "Manoj Tiwari",
    email: "manoj.tiwari@auctechhms.com",
    phone: "9876500120",
    role: "Lab Technician",
    department: "Pathology & Lab",
    gender: "Male",
    status: "Active",
    joinedOn: "2022-07-11",
    lastLogin: "2026-07-04T19:00:00",
  },
  {
    id: "U-1021",
    fullName: "Priyanka Das",
    email: "priyanka.das@auctechhms.com",
    phone: "9876500121",
    role: "Lab Technician",
    department: "Pathology & Lab",
    gender: "Female",
    status: "Active",
    joinedOn: "2023-05-09",
    lastLogin: "2026-07-05T08:40:00",
  },

  // ── Administrators (3) ────────────────────────────────────────────────────
  {
    id: "U-1022",
    fullName: "Alok Sharma",
    email: "alok.sharma@auctechhms.com",
    phone: "9876500122",
    role: "Administrator",
    department: "Administration",
    gender: "Male",
    status: "Active",
    joinedOn: "2017-01-20",
    lastLogin: "2026-07-05T09:00:00",
  },
  {
    id: "U-1023",
    fullName: "Sunanda Rao",
    email: "sunanda.rao@auctechhms.com",
    phone: "9876500123",
    role: "Administrator",
    department: "Administration",
    gender: "Female",
    status: "Active",
    joinedOn: "2019-08-14",
    lastLogin: "2026-07-05T09:15:00",
  },
  {
    id: "U-1024",
    fullName: "Farhan Khan",
    email: "farhan.khan@auctechhms.com",
    phone: "9876500124",
    role: "Administrator",
    department: "Administration",
    gender: "Male",
    status: "Inactive",
    joinedOn: "2018-12-01",
    lastLogin: "2026-05-06T13:00:00",
  },
];
