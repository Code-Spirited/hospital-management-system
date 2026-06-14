import { useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Lucide icons for general UI
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";

// React Icons — Font Awesome — for medical/domain-specific card icons
// FaUserInjured = patient (person with injury sling — clearly medical)
// FaCalendarCheck = confirmed appointment
// FaRupeeSign = Indian rupee currency
// FaBed = hospital bed / bed occupancy
// FaStethoscope = doctor on duty
// FaPills = pharmacy orders
// FaFlask = lab tests
// FaProcedures = surgeries (patient on gurney with IV)
import {
  FaUserInjured,
  FaCalendarCheck,
  FaRupeeSign,
  FaBed,
} from "react-icons/fa";
import { FaStethoscope, FaPills, FaFlask, FaProcedures } from "react-icons/fa";

import {
  kpiData,
  revenueChartData,
  appointmentChartData,
  recentPatients,
  quickStats,
} from "./dashboardData";

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

const kpiIcons = {
  patients: FaUserInjured, // injured person = patient, clearly medical
  appointments: FaCalendarCheck, // calendar with checkmark = confirmed appointment
  revenue: FaRupeeSign, // rupee symbol = Indian revenue
  beds: FaBed, // bed icon = hospital bed occupancy
};

const StatusBadge = ({ status }) => {
  const map = {
    Completed: {
      bg: "var(--hms-success-bg)",
      color: "var(--hms-success)",
      dot: "#22c55e",
    },
    Admitted: { bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
    Waiting: {
      bg: "var(--hms-warning-bg)",
      color: "var(--hms-warning)",
      dot: "#f59e0b",
    },
    Critical: {
      bg: "var(--hms-danger-bg)",
      color: "var(--hms-danger)",
      dot: "#ef4444",
    },
  };
  const s = map[status] || { bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" };
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
        style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }}
      />
      {status}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const map = {
    OPD: { bg: "var(--hms-sky)", color: "#1d6fa4" },
    IPD: { bg: "var(--hms-purple-bg)", color: "#7c3aed" },
    Emergency: { bg: "var(--hms-danger-bg)", color: "#b91c1c" },
    "Follow-up": { bg: "var(--hms-success-bg)", color: "#15803d" },
  };
  const c = map[type] || { bg: "#f8fafc", color: "#475569" };
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

const quickIcons = [FaProcedures, FaStethoscope, FaPills, FaFlask];

const Dashboard = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("1y");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cardStyle = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid var(--hms-border)",
    boxShadow: "var(--shadow-xs)",
    transition: "box-shadow 0.2s, transform 0.2s",
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          borderRadius: 4,
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "var(--font-body)", size: 11 },
          color: "#64748b",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "var(--hms-navy)",
        titleFont: { family: "var(--font-body)", size: 12, weight: "600" },
        bodyFont: { family: "var(--font-body)", size: 11 },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "var(--font-body)", size: 11 },
          color: "#94a3b8",
        },
        border: { display: false },
      },
      y: {
        grid: { color: "#f1f5f9", drawBorder: false },
        ticks: {
          font: { family: "var(--font-body)", size: 11 },
          color: "#94a3b8",
          callback: (v) => `₹${(v / 100000).toFixed(0)}L`,
        },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "var(--font-body)", size: 11 },
          color: "#64748b",
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "var(--hms-navy)",
        titleFont: { family: "var(--font-body)", size: 12 },
        bodyFont: { family: "var(--font-body)", size: 11 },
        padding: 12,
        cornerRadius: 10,
        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` },
      },
    },
  };

  const filteredRevenue =
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

  return (
    <div style={{ fontFamily: "var(--font-body)", maxWidth: 1400 }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .db-card { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.15) both; }
        .db-d1   { animation-delay: .04s; }
        .db-d2   { animation-delay: .08s; }
        .db-d3   { animation-delay: .12s; }
        .db-d4   { animation-delay: .16s; }
        .db-d5   { animation-delay: .20s; }
        .db-d6   { animation-delay: .24s; }
        .db-d7   { animation-delay: .28s; }

        .kpi-hover:hover {
          box-shadow: var(--shadow-md) !important;
          transform: translateY(-2px);
        }
        .patient-row:hover { background: var(--hms-sky) !important; }
        /* ── Mobile responsive fixes ── */
@media (max-width: 767px) {
  .charts-row {
    grid-template-columns: 1fr !important;
  }
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 479px) {
  .kpi-grid {
    grid-template-columns: 1fr !important;
  }
}
      `}</style>

      {/* ── Page Header ── */}
      <div
        className="db-card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.2rem",
            }}
          >
            <Sparkles size={16} style={{ color: "var(--hms-blue)" }} />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--hms-blue)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Overview
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.65rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: 0,
              letterSpacing: "-0.025em",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontSize: "0.8rem",
              color: "#64748b",
              margin: "0.2rem 0 0",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 500,
            }}
          >
            <Clock size={13} style={{ color: "#94a3b8" }} />
            {today}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 14px",
              background: "var(--hms-success-bg)",
              border: "1px solid rgba(13,158,110,0.2)",
              borderRadius: 20,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--hms-success)",
                display: "inline-block",
                animation: "ripple 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--hms-success)",
              }}
            >
              Live
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {kpiData.map((kpi, i) => {
          const Icon = kpiIcons[kpi.icon];
          return (
            <div
              key={kpi.id}
              className={`db-card kpi-hover db-d${i + 1}`}
              style={{
                ...cardStyle,
                padding: "1.25rem 1.375rem",
                cursor: "default",
              }}
            >
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
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#64748b",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {kpi.title}
                </p>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: kpi.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: kpi.color,
                    flexShrink: 0,
                  }}
                >
                  {/* react-icons uses size prop but no strokeWidth */}
                  <Icon size={18} />
                </div>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.7rem",
                  fontWeight: 800,
                  color: "var(--hms-navy)",
                  margin: "0 0 0.5rem",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.1,
                }}
              >
                {kpi.value}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {kpi.trend === "up" ? (
                  <TrendingUp
                    size={13}
                    style={{ color: "var(--hms-success)" }}
                  />
                ) : (
                  <TrendingDown
                    size={13}
                    style={{ color: "var(--hms-danger)" }}
                  />
                )}
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color:
                      kpi.trend === "up"
                        ? "var(--hms-success)"
                        : "var(--hms-danger)",
                  }}
                >
                  {kpi.change}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  {kpi.period}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {quickStats.map((stat, i) => {
          const Icon = quickIcons[i];
          return (
            <div
              key={stat.label}
              className={`db-card db-d5`}
              style={{
                ...cardStyle,
                padding: "0.875rem 1.125rem",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--hms-sky)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--hms-blue)",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--hms-navy)",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#64748b",
                    margin: "2px 0 0",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          className="charts-row"
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)",
          }}
        >
          {/* Revenue chart */}
          <div
            className="db-card db-d5"
            style={{ ...cardStyle, padding: "1.375rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "var(--hms-navy)",
                    margin: 0,
                  }}
                >
                  Revenue Overview
                </h3>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: 3,
                    fontWeight: 500,
                  }}
                >
                  OPD & IPD revenue trends
                </p>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {["6m", "1y"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setRevenuePeriod(p)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background:
                        revenuePeriod === p
                          ? "var(--hms-navy)"
                          : "var(--hms-surface)",
                      color: revenuePeriod === p ? "#fff" : "#64748b",
                      transition: "all 0.15s",
                    }}
                  >
                    {p === "6m" ? "6 Months" : "1 Year"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: 240 }}>
              <Line data={filteredRevenue} options={lineOptions} />
            </div>
          </div>

          {/* Doughnut chart */}
          <div
            className="db-card db-d6"
            style={{ ...cardStyle, padding: "1.375rem" }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: "0 0 3px",
              }}
            >
              Appointments
            </h3>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginBottom: "1.25rem",
                fontWeight: 500,
              }}
            >
              By category today
            </p>
            <div style={{ height: 185 }}>
              <Doughnut data={appointmentChartData} options={doughnutOptions} />
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: "1rem",
                paddingTop: "0.875rem",
                borderTop: "1px solid var(--hms-border)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--hms-navy)",
                  margin: 0,
                }}
              >
                128
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Total appointments today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Patients Table ── */}
      <div
        className="db-card db-d7"
        style={{ ...cardStyle, padding: "1.375rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              Recent Patients
            </h3>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginTop: 3,
                fontWeight: 500,
              }}
            >
              Latest activity — updated live
            </p>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              background: "var(--hms-sky)",
              border: "1px solid rgba(29,111,164,0.2)",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--hms-blue)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d0e9f8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--hms-sky)";
            }}
          >
            View All <ArrowUpRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--hms-border)" }}>
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
                      padding: "0.625rem 1rem",
                      textAlign: "left",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
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
                  className="patient-row"
                  style={{
                    borderBottom:
                      i < recentPatients.length - 1
                        ? "1px solid #f8fafc"
                        : "none",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--hms-blue)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.id}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--hms-navy)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </td>
                  <td
                    style={{
                      padding: "0.875rem 1rem",
                      fontSize: "0.85rem",
                      color: "#64748b",
                      fontWeight: 500,
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
                      color: "#475569",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
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
                      fontWeight: 500,
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
        @keyframes ripple {
          0%   { box-shadow: 0 0 0 0 rgba(13,158,110,0.4); }
          70%  { box-shadow: 0 0 0 8px rgba(13,158,110,0); }
          100% { box-shadow: 0 0 0 0 rgba(13,158,110,0); }
        }
        @media (max-width: 1024px) {
          .charts-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
