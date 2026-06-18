// ─────────────────────────────────────────────────────────────────────────────
// notificationsData.js
//
// All timestamps are calculated relative to "now" at import time
// so the notification feed always looks current regardless of when
// the app is opened. In Week 8, this is replaced by a WebSocket or
// Server-Sent Events connection that pushes real notifications.
// ─────────────────────────────────────────────────────────────────────────────

import dayjs from "dayjs";

const now = dayjs();

export const initialNotifications = [
  {
    id: 1,
    type: "emergency",
    title: "Critical Alert — ICU",
    message:
      "Arjun Patel (P-1040) vitals deteriorating. Oxygen saturation at 84%.",
    timestamp: now.subtract(4, "minute").toDate(),
    read: false,
    priority: "critical",
    action: { label: "Open Record", path: "/ipd" },
  },
  {
    id: 2,
    type: "lab",
    title: "Lab Report Ready",
    message:
      "Blood panel for Kavya Reddy (P-1039) is available. CBC shows elevated WBC.",
    timestamp: now.subtract(22, "minute").toDate(),
    read: false,
    priority: "high",
    action: { label: "View Report", path: "/reports" },
  },
  {
    id: 3,
    type: "appointment",
    title: "Appointment Confirmed",
    message:
      "Mohammed Iqbal (P-1038) confirmed his 11:30 AM appointment with Dr. Ravi Gupta.",
    timestamp: now.subtract(47, "minute").toDate(),
    read: false,
    priority: "normal",
    action: { label: "View Schedule", path: "/opd" },
  },
  {
    id: 4,
    type: "pharmacy",
    title: "Stock Alert — Paracetamol 500mg",
    message:
      "Current stock: 48 strips. Reorder level reached. Supplier order recommended.",
    timestamp: now.subtract(2, "hour").toDate(),
    read: true,
    priority: "high",
    action: { label: "Manage Stock", path: "/pharmacy" },
  },
  {
    id: 5,
    type: "patient",
    title: "New Admission — Ward B",
    message:
      "Sunita Verma (P-1041) admitted to Ward B-12 under Dr. Anil Kumar post-surgery.",
    timestamp: now.subtract(3, "hour").toDate(),
    read: true,
    priority: "normal",
    action: { label: "View Ward", path: "/ipd" },
  },
  {
    id: 6,
    type: "appointment",
    title: "Appointment Cancelled",
    message:
      "Deepak Nair (P-1036) cancelled his 3:00 PM follow-up. Slot is now available.",
    timestamp: now.subtract(1, "day").subtract(2, "hour").toDate(),
    read: true,
    priority: "normal",
    action: null,
  },
  {
    id: 7,
    type: "lab",
    title: "X-Ray Results Ready",
    message:
      "Chest X-Ray for Harish Menon (P-1034) processed. Radiologist review pending.",
    timestamp: now.subtract(1, "day").subtract(4, "hour").toDate(),
    read: true,
    priority: "normal",
    action: { label: "View Results", path: "/reports" },
  },
  {
    id: 8,
    type: "pharmacy",
    title: "New Purchase Entry",
    message:
      "Batch of Amoxicillin 250mg received from MedSupply Pvt. Ltd. Verified & shelved.",
    timestamp: now.subtract(1, "day").subtract(6, "hour").toDate(),
    read: true,
    priority: "normal",
    action: null,
  },
  {
    id: 9,
    type: "emergency",
    title: "Emergency — Road Accident",
    message:
      "Two patients en route. ETA 8 minutes. ER team and surgical bay on standby.",
    timestamp: now.subtract(2, "day").subtract(1, "hour").toDate(),
    read: true,
    priority: "critical",
    action: { label: "ER Dashboard", path: "/ipd" },
  },
  {
    id: 10,
    type: "system",
    title: "Scheduled Maintenance Complete",
    message:
      "System backup and database optimisation completed successfully. All services operational.",
    timestamp: now.subtract(3, "day").toDate(),
    read: true,
    priority: "low",
    action: null,
  },
  {
    id: 11,
    type: "patient",
    title: "Patient Discharged",
    message:
      "Vikram Singh (P-1032) discharged after recovery. Follow-up scheduled for 30 June.",
    timestamp: now.subtract(3, "day").subtract(3, "hour").toDate(),
    read: true,
    priority: "normal",
    action: null,
  },
  {
    id: 12,
    type: "appointment",
    title: "48 Appointments Tomorrow",
    message:
      "Tomorrow's OPD schedule is full. Dr. Priya Mehta has 18 confirmed appointments.",
    timestamp: now.subtract(4, "day").toDate(),
    read: true,
    priority: "normal",
    action: { label: "View Schedule", path: "/opd" },
  },
];

// Notification type configuration — icons, colors, and labels in one place.
// Centralised here so adding a new type only requires one change.
export const NOTIFICATION_CONFIG = {
  emergency: {
    label: "Emergency",
    color: "#ef4444",
    bg: "#fef2f2",
    emoji: "🚨",
  },
  patient: { label: "Patient", color: "#2563eb", bg: "#eff6ff", emoji: "👤" },
  appointment: {
    label: "Appointment",
    color: "#7c3aed",
    bg: "#f5f3ff",
    emoji: "📅",
  },
  lab: { label: "Lab", color: "#d97706", bg: "#fffbeb", emoji: "🧪" },
  pharmacy: { label: "Pharmacy", color: "#059669", bg: "#ecfdf5", emoji: "💊" },
  system: { label: "System", color: "#64748b", bg: "#f8fafc", emoji: "⚙️" },
};

// Simulated live notifications — each one pushes in after a delay
// to demonstrate the real-time notification system.
// In production this would come from a WebSocket server.
export const liveNotificationQueue = [
  {
    id: 100,
    type: "lab",
    title: "Urgent Lab Result",
    message:
      "Potassium level critical for Anjali Desai (P-1037). Notify Dr. Anil Kumar immediately.",
    timestamp: new Date(),
    read: false,
    priority: "critical",
    action: { label: "View Result", path: "/reports" },
  },
  {
    id: 101,
    type: "appointment",
    title: "Walk-in Patient",
    message:
      "New walk-in registered at OPD reception. Assigned token number T-047.",
    timestamp: new Date(),
    read: false,
    priority: "normal",
    action: null,
  },
];
