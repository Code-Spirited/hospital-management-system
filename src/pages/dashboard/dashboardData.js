// ─────────────────────────────────────────────────────────────────────────────
//
//
// PURPOSE:
//   All placeholder/mock data for the Dashboard page lives here.
//   When the backend is ready in Week 8, this file gets replaced
//   with real Axios API calls. The Dashboard component itself never changes.
//
// This separation is called the "data layer" pattern.
// ─────────────────────────────────────────────────────────────────────────────

// ── KPI Cards ────────────────────────────────────────────────────────────────
// Each card shows one key metric with a trend indicator
export const kpiData = [
  {
    id: 1,
    title: "Total Patients",
    value: "3,842",
    change: "+12.5%",
    trend: "up",
    period: "vs last month",
    color: "#0ea5e9", // sky blue
    bg: "#f0f9ff",
    icon: "patients",
  },
  {
    id: 2,
    title: "Today's Appointments",
    value: "128",
    change: "+4.3%",
    trend: "up",
    period: "vs yesterday",
    color: "#8b5cf6", // violet
    bg: "#f5f3ff",
    icon: "appointments",
  },
  {
    id: 3,
    title: "Monthly Revenue",
    value: "₹8,24,500",
    change: "+18.2%",
    trend: "up",
    period: "vs last month",
    color: "#10b981", // emerald
    bg: "#f0fdf4",
    icon: "revenue",
  },
  {
    id: 4,
    title: "Beds Occupied",
    value: "74 / 120",
    change: "-3.1%",
    trend: "down",
    period: "vs last week",
    color: "#f59e0b", // amber
    bg: "#fffbeb",
    icon: "beds",
  },
];

// ── Revenue Chart Data (Line Chart) ──────────────────────────────────────────
export const revenueChartData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "OPD Revenue",
      data: [
        320000, 410000, 380000, 520000, 490000, 610000, 580000, 720000, 680000,
        790000, 824500, 860000,
      ],
      borderColor: "#0ea5e9",
      backgroundColor: "rgba(14,165,233,0.08)",
      borderWidth: 2.5,
      pointBackgroundColor: "#0ea5e9",
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.4, // makes the line curved instead of sharp
    },
    {
      label: "IPD Revenue",
      data: [
        180000, 220000, 195000, 280000, 310000, 290000, 340000, 380000, 420000,
        390000, 445000, 510000,
      ],
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139,92,246,0.06)",
      borderWidth: 2.5,
      pointBackgroundColor: "#8b5cf6",
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.4,
    },
  ],
};

// ── Appointment Chart Data (Doughnut) ─────────────────────────────────────────
export const appointmentChartData = {
  labels: ["OPD", "IPD", "Emergency", "Follow-up"],
  datasets: [
    {
      data: [45, 25, 15, 15],
      backgroundColor: ["#0ea5e9", "#8b5cf6", "#ef4444", "#10b981"],
      hoverBackgroundColor: ["#0284c7", "#7c3aed", "#dc2626", "#059669"],
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
};

// ── Recent Patients ───────────────────────────────────────────────────────────
export const recentPatients = [
  {
    id: "P-1042",
    name: "Ramesh Sharma",
    age: 45,
    type: "OPD",
    doctor: "Dr. Priya Mehta",
    status: "Completed",
    time: "09:30 AM",
  },
  {
    id: "P-1041",
    name: "Sunita Verma",
    age: 32,
    type: "IPD",
    doctor: "Dr. Anil Kumar",
    status: "Admitted",
    time: "08:45 AM",
  },
  {
    id: "P-1040",
    name: "Arjun Patel",
    age: 58,
    type: "Emergency",
    doctor: "Dr. Neha Singh",
    status: "Critical",
    time: "08:10 AM",
  },
  {
    id: "P-1039",
    name: "Kavya Reddy",
    age: 27,
    type: "OPD",
    doctor: "Dr. Priya Mehta",
    status: "Waiting",
    time: "07:50 AM",
  },
  {
    id: "P-1038",
    name: "Mohammed Iqbal",
    age: 63,
    type: "Follow-up",
    doctor: "Dr. Ravi Gupta",
    status: "Completed",
    time: "07:20 AM",
  },
  {
    id: "P-1037",
    name: "Anjali Desai",
    age: 41,
    type: "IPD",
    doctor: "Dr. Anil Kumar",
    status: "Admitted",
    time: "Yesterday",
  },
  {
    id: "P-1036",
    name: "Deepak Nair",
    age: 36,
    type: "OPD",
    doctor: "Dr. Ravi Gupta",
    status: "Completed",
    time: "Yesterday",
  },
];

// ── Quick Stats (small summary numbers below KPI cards) ───────────────────────
export const quickStats = [
  { label: "Surgeries Today", value: "8" },
  { label: "Doctors On Duty", value: "24" },
  { label: "Pharmacy Orders", value: "156" },
  { label: "Lab Tests Pending", value: "43" },
];
