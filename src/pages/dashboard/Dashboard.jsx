// ─────────────────────────────────────────────────────────────────────────────
// Dashboard.jsx
//
// PURPOSE:
//   The main overview screen of the HMS admin panel.
//   Gives hospital staff a bird's-eye view of all key metrics at a glance.
//
// SECTIONS:
//   1. Page header (title + date)
//   2. KPI cards (4 key metrics)
//   3. Quick stats bar
//   4. Revenue Line Chart + Appointment Doughnut Chart
//   5. Recent Patients Table
//
// DATA:
//   All numbers come from dashboardData.js (mock data).
//   In Week 8, each dataset will be replaced with an Axios API call.
//
// CHARTS:
//   Uses Chart.js via react-chartjs-2.
//   Each chart type must be registered before use — see registerCharts below.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";

// Chart.js requires you to register every component you use.
// This is tree-shaking — only the pieces you register get bundled.
import {
  Chart as ChartJS,
  CategoryScale, // X-axis for category labels (Jan, Feb...)
  LinearScale, // Y-axis for numbers
  PointElement, // The dots on line charts
  LineElement, // The lines connecting dots
  ArcElement, // The slices of doughnut/pie charts
  Title,
  Tooltip, // The popup that shows on hover
  Legend, // The color key below charts
  Filler, // The filled area under a line chart
} from "chart.js";

import {
  Users,
  Calendar,
  IndianRupee,
  BedDouble,
  TrendingUp,
  TrendingDown,
  Activity,
  Stethoscope,
  FlaskConical,
  ShoppingBag,
  ArrowRight,
  Clock,
} from "lucide-react";

import {
  kpiData,
  revenueChartData,
  appointmentChartData,
  recentPatients,
  quickStats,
} from "./dashboardData";

// Register all Chart.js components we're using
// Must be done ONCE before any chart renders
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ── Icon map for KPI cards ─────────────────────────────────────────────────────
// We store icon names as strings in data, then map to components here.
// This way data files don't need to import React components.
const kpiIcons = {
  patients: <Users size={22} />,
  appointments: <Calendar size={22} />,
  revenue: <IndianRupee size={22} />,
  beds: <BedDouble size={22} />,
};

// ── Status badge component ────────────────────────────────────────────────────
// Displays a colored pill badge for patient status
// Defined outside Dashboard so it doesn't re-create on every render
const StatusBadge = ({ status }) => {
  const styles = {
    Completed: { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
    Admitted: { bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
    Waiting: { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
    Critical: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  };

  const s = styles[status] || {
    bg: "#f8fafc",
    color: "#64748b",
    dot: "#94a3b8",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
};

// ── Type badge ────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const colors = {
    OPD: { bg: "#f0f9ff", color: "#0369a1" },
    IPD: { bg: "#f5f3ff", color: "#6d28d9" },
    Emergency: { bg: "#fef2f2", color: "#b91c1c" },
    "Follow-up": { bg: "#f0fdf4", color: "#15803d" },
  };
  const c = colors[type] || { bg: "#f8fafc", color: "#475569" };

  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 600,
        background: c.bg,
        color: c.color,
      }}
    >
      {type}
    </span>
  );
};

// ── Quick stat icon map ───────────────────────────────────────────────────────
const quickIcons = [
  <Stethoscope size={16} />,
  <Activity size={16} />,
  <ShoppingBag size={16} />,
  <FlaskConical size={16} />,
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  // Controls which time period is selected on the revenue chart
  // "6m" = last 6 months, "1y" = full year
  const [revenuePeriod, setRevenuePeriod] = useState("1y");

  // Today's date formatted nicely for the page header
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Chart options ───────────────────────────────────────────────────────────
  // options control appearance and behavior of charts

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false, // lets us control height via CSS
    interaction: {
      mode: "index", // tooltip shows ALL datasets at that X point
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 5,
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "'Inter', sans-serif", size: 11 },
          color: "#64748b",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { family: "'Inter', sans-serif", size: 12 },
        bodyFont: { family: "'Inter', sans-serif", size: 11 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          // Format tooltip values as Indian Rupees
          label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false }, // hide vertical grid lines
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: "#94a3b8",
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: "#f1f5f9", // very subtle horizontal lines
          drawBorder: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          color: "#94a3b8",
          // Format Y-axis labels as ₹ lakhs
          callback: (val) => `₹${(val / 100000).toFixed(1)}L`,
        },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%", // controls the hole size — higher = thinner ring
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "'Inter', sans-serif", size: 11 },
          color: "#64748b",
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { family: "'Inter', sans-serif", size: 12 },
        bodyFont: { family: "'Inter', sans-serif", size: 11 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  // Filter revenue data based on selected period
  const filteredRevenueData =
    revenuePeriod === "6m"
      ? {
          ...revenueChartData,
          labels: revenueChartData.labels.slice(-6),
          datasets: revenueChartData.datasets.map((d) => ({
            ...d,
            data: d.data.slice(-6),
          })),
        }
      : revenueChartData;

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Inject Inter font if not already loaded */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .db-au  { animation: fadeUp 0.5s cubic-bezier(.22,.68,0,1.15) both; }
        .db-d1  { animation-delay: .05s; }
        .db-d2  { animation-delay: .10s; }
        .db-d3  { animation-delay: .15s; }
        .db-d4  { animation-delay: .20s; }
        .db-d5  { animation-delay: .25s; }
        .db-d6  { animation-delay: .30s; }

        .kpi-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          border: 1px solid #f1f5f9;
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.07);
        }

        .chart-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid #f1f5f9;
        }

        .period-btn {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background .15s, color .15s;
        }
        .period-btn.active {
          background: #0f172a;
          color: #fff;
        }
        .period-btn.inactive {
          background: #f1f5f9;
          color: #64748b;
        }
        .period-btn.inactive:hover {
          background: #e2e8f0;
        }
      `}</style>

      {/* ── 1. PAGE HEADER ── */}
      <div className="db-au flex items-start justify-between mb-6">
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-.02em",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#94a3b8",
              marginTop: "0.25rem",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Clock size={13} />
            {today}
          </p>
        </div>

        {/* Live indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 20,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{ fontSize: "0.72rem", fontWeight: 600, color: "#16a34a" }}
          >
            Live
          </span>
        </div>
      </div>

      {/* ── 2. KPI CARDS ── */}
      {/* grid with 4 equal columns — responsive: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {kpiData.map((kpi, i) => (
          <div key={kpi.id} className={`kpi-card db-au db-d${i + 1}`}>
            {/* Top row: title + icon */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#64748b",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {kpi.title}
              </p>
              {/* Colored icon circle */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: kpi.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: kpi.color,
                  flexShrink: 0,
                }}
              >
                {kpiIcons[kpi.icon]}
              </div>
            </div>

            {/* Value */}
            <p
              style={{
                fontSize: "1.65rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 0.5rem 0",
                letterSpacing: "-.02em",
              }}
            >
              {kpi.value}
            </p>

            {/* Trend */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {kpi.trend === "up" ? (
                <TrendingUp size={14} style={{ color: "#10b981" }} />
              ) : (
                <TrendingDown size={14} style={{ color: "#ef4444" }} />
              )}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: kpi.trend === "up" ? "#10b981" : "#ef4444",
                }}
              >
                {kpi.change}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                {kpi.period}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. QUICK STATS BAR ── */}
      <div className="db-au db-d5 grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {quickStats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              border: "1px solid #f1f5f9",
              borderRadius: 12,
              padding: "0.75rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ color: "#0ea5e9" }}>{quickIcons[i]}</div>
            <div>
              <p
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: 0 }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 4. CHARTS ROW ── */}
      <div className="db-au db-d5 grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
        {/* Revenue Line Chart — takes 2/3 width on large screens */}
        <div className="chart-card xl:col-span-2">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Revenue Overview
              </h3>
              <p
                style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}
              >
                OPD & IPD revenue trends
              </p>
            </div>

            {/* Period toggle buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              {["6m", "1y"].map((p) => (
                <button
                  key={p}
                  onClick={() => setRevenuePeriod(p)}
                  className={`period-btn ${revenuePeriod === p ? "active" : "inactive"}`}
                >
                  {p === "6m" ? "6 Months" : "1 Year"}
                </button>
              ))}
            </div>
          </div>

          {/* Chart container — height must be set explicitly */}
          <div style={{ height: 260 }}>
            <Line data={filteredRevenueData} options={lineOptions} />
          </div>
        </div>

        {/* Appointment Doughnut Chart — takes 1/3 width */}
        <div className="chart-card">
          <div style={{ marginBottom: "1.25rem" }}>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Appointments
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
              By category today
            </p>
          </div>

          <div style={{ height: 200 }}>
            <Doughnut data={appointmentChartData} options={doughnutOptions} />
          </div>

          {/* Total count in the center is hard with Chart.js, so we show it below */}
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <p
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              128
            </p>
            <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Total Today</p>
          </div>
        </div>
      </div>

      {/* ── 5. RECENT PATIENTS TABLE ── */}
      <div className="db-au db-d6 chart-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Recent Patients
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
              Latest patient activity today
            </p>
          </div>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#0ea5e9",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        {/* Table — horizontally scrollable on small screens */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #f1f5f9" }}>
                {[
                  "Patient ID",
                  "Name",
                  "Age",
                  "Type",
                  "Doctor",
                  "Status",
                  "Time",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.6rem 1rem",
                      textAlign: "left",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((p, i) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom:
                      i < recentPatients.length - 1
                        ? "1px solid #f8fafc"
                        : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#0ea5e9",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.id}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#0f172a",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.875rem",
                      color: "#64748b",
                    }}
                  >
                    {p.age}
                  </td>
                  <td
                    style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}
                  >
                    <TypeBadge type={p.type} />
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.82rem",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.doctor}
                  </td>
                  <td
                    style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}
                  >
                    <StatusBadge status={p.status} />
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { opacity: 0.7; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
