// ─────────────────────────────────────────────────────────────────────────────
// calendarData.js
//
// Appointments are keyed by ISO date string (YYYY-MM-DD) so the calendar
// widget can look up appointments for any selected day in O(1) time.
//
// Dates are computed relative to today using dayjs so the calendar
// always shows activity around "now" regardless of when the app is run.
// ─────────────────────────────────────────────────────────────────────────────

import dayjs from "dayjs";

const d = (offset) => dayjs().add(offset, "day").format("YYYY-MM-DD");

export const appointmentsByDate = {
  [d(-3)]: [
    {
      id: 1,
      time: "09:00",
      patient: "Pooja Iyer",
      doctor: "Dr. Sunita Rao",
      type: "OPD",
      status: "Completed",
    },
    {
      id: 2,
      time: "10:30",
      patient: "Harish Menon",
      doctor: "Dr. Neha Singh",
      type: "IPD",
      status: "Completed",
    },
    {
      id: 3,
      time: "14:00",
      patient: "Lakshmi Pillai",
      doctor: "Dr. Priya Mehta",
      type: "Follow-up",
      status: "Completed",
    },
  ],
  [d(-2)]: [
    {
      id: 4,
      time: "08:30",
      patient: "Vikram Singh",
      doctor: "Dr. Neha Singh",
      type: "Emergency",
      status: "Completed",
    },
    {
      id: 5,
      time: "11:00",
      patient: "Meena Krishnan",
      doctor: "Dr. Ravi Gupta",
      type: "OPD",
      status: "Completed",
    },
    {
      id: 6,
      time: "15:30",
      patient: "Nisha Kapoor",
      doctor: "Dr. Sunita Rao",
      type: "OPD",
      status: "Completed",
    },
    {
      id: 7,
      time: "16:00",
      patient: "Santosh Kumar",
      doctor: "Dr. Mohammed Ali",
      type: "Follow-up",
      status: "Cancelled",
    },
  ],
  [d(-1)]: [
    {
      id: 8,
      time: "09:30",
      patient: "Anjali Desai",
      doctor: "Dr. Anil Kumar",
      type: "IPD",
      status: "Completed",
    },
    {
      id: 9,
      time: "11:30",
      patient: "Deepak Nair",
      doctor: "Dr. Ravi Gupta",
      type: "OPD",
      status: "Completed",
    },
    {
      id: 10,
      time: "14:30",
      patient: "Divya Nambiar",
      doctor: "Dr. Priya Mehta",
      type: "OPD",
      status: "Cancelled",
    },
  ],
  [d(0)]: [
    {
      id: 11,
      time: "09:00",
      patient: "Ramesh Sharma",
      doctor: "Dr. Priya Mehta",
      type: "OPD",
      status: "Completed",
    },
    {
      id: 12,
      time: "09:45",
      patient: "Kavya Reddy",
      doctor: "Dr. Priya Mehta",
      type: "OPD",
      status: "Waiting",
    },
    {
      id: 13,
      time: "10:30",
      patient: "Sunita Verma",
      doctor: "Dr. Anil Kumar",
      type: "IPD",
      status: "Admitted",
    },
    {
      id: 14,
      time: "11:00",
      patient: "Mohammed Iqbal",
      doctor: "Dr. Ravi Gupta",
      type: "Follow-up",
      status: "Waiting",
    },
    {
      id: 15,
      time: "14:00",
      patient: "Geeta Sharma",
      doctor: "Dr. Neha Singh",
      type: "OPD",
      status: "Waiting",
    },
    {
      id: 16,
      time: "15:30",
      patient: "Rahul Joshi",
      doctor: "Dr. Mohammed Ali",
      type: "OPD",
      status: "Waiting",
    },
  ],
  [d(1)]: [
    {
      id: 17,
      time: "09:00",
      patient: "Priya Nair",
      doctor: "Dr. Sunita Rao",
      type: "Follow-up",
      status: "Scheduled",
    },
    {
      id: 18,
      time: "10:00",
      patient: "Suresh Babu",
      doctor: "Dr. Anil Kumar",
      type: "IPD",
      status: "Scheduled",
    },
    {
      id: 19,
      time: "11:30",
      patient: "Anita Bose",
      doctor: "Dr. Priya Mehta",
      type: "OPD",
      status: "Scheduled",
    },
    {
      id: 20,
      time: "14:00",
      patient: "Karthik Rajan",
      doctor: "Dr. Neha Singh",
      type: "Emergency",
      status: "Scheduled",
    },
    {
      id: 21,
      time: "16:00",
      patient: "Sudha Pillai",
      doctor: "Dr. Ravi Gupta",
      type: "Follow-up",
      status: "Scheduled",
    },
  ],
  [d(2)]: [
    {
      id: 22,
      time: "09:30",
      patient: "Manoj Gupta",
      doctor: "Dr. Mohammed Ali",
      type: "OPD",
      status: "Scheduled",
    },
    {
      id: 23,
      time: "11:00",
      patient: "Rekha Singh",
      doctor: "Dr. Sunita Rao",
      type: "IPD",
      status: "Scheduled",
    },
    {
      id: 24,
      time: "15:00",
      patient: "Venkat Rao",
      doctor: "Dr. Priya Mehta",
      type: "OPD",
      status: "Scheduled",
    },
  ],
  [d(4)]: [
    {
      id: 25,
      time: "10:00",
      patient: "Chitra Menon",
      doctor: "Dr. Neha Singh",
      type: "Emergency",
      status: "Scheduled",
    },
    {
      id: 26,
      time: "13:00",
      patient: "Ashok Pandey",
      doctor: "Dr. Ravi Gupta",
      type: "Follow-up",
      status: "Scheduled",
    },
  ],
  [d(7)]: [
    {
      id: 27,
      time: "09:00",
      patient: "Geeta Sharma",
      doctor: "Dr. Neha Singh",
      type: "Follow-up",
      status: "Scheduled",
    },
    {
      id: 28,
      time: "11:00",
      patient: "Harish Menon",
      doctor: "Dr. Anil Kumar",
      type: "IPD",
      status: "Scheduled",
    },
    {
      id: 29,
      time: "14:30",
      patient: "Kavya Reddy",
      doctor: "Dr. Priya Mehta",
      type: "OPD",
      status: "Scheduled",
    },
    {
      id: 30,
      time: "16:00",
      patient: "Priya Nair",
      doctor: "Dr. Sunita Rao",
      type: "OPD",
      status: "Scheduled",
    },
  ],
};

// Colour coding used by both the calendar dots and the appointment list.
export const APPOINTMENT_TYPE_COLORS = {
  OPD: "#2563eb",
  IPD: "#7c3aed",
  Emergency: "#ef4444",
  "Follow-up": "#059669",
};

export const APPOINTMENT_STATUS_CONFIG = {
  Completed: { color: "#059669", bg: "#ecfdf5" },
  Admitted: { color: "#2563eb", bg: "#eff6ff" },
  Waiting: { color: "#d97706", bg: "#fffbeb" },
  Critical: { color: "#ef4444", bg: "#fef2f2" },
  Cancelled: { color: "#94a3b8", bg: "#f8fafc" },
  Scheduled: { color: "#7c3aed", bg: "#f5f3ff" },
};
