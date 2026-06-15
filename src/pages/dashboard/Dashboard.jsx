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
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  Sparkles,
  Target,
} from "lucide-react";
import {
  FaUserInjured,
  FaCalendarCheck,
  FaRupeeSign,
  FaBed,
} from "react-icons/fa";
import { FaStethoscope, FaPills, FaFlask, FaProcedures } from "react-icons/fa";
import { Sparkline } from "../../components/common";
import {
  kpiData,
  departmentStats,
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

// Icon maps
const kpiIcons = {
  patients: FaUserInjured,
  appointments: FaCalendarCheck,
  revenue: FaRupeeSign,
  beds: FaBed,
};
const quickIcons = [FaProcedures, FaStethoscope, FaPills, FaFlask];

// Status badge
const StatusBadge = ({ status }) => {
  const map = {
    Completed: { bg: "#ecfdf5", color: "#059669", dot: "#22c55e" },
    Admitted: { bg: "#eff6ff", color: "#2563eb", dot: "#3b82f6" },
    Waiting: { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
    Critical: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
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

// Type badge
const TypeBadge = ({ type }) => {
  const map = {
    OPD: { bg: "#eff6ff", color: "#1d4ed8" },
    IPD: { bg: "#f5f3ff", color: "#6d28d9" },
    Emergency: { bg: "#fef2f2", color: "#b91c1c" },
    "Follow-up": { bg: "#ecfdf5", color: "#065f46" },
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

// Department Service Card
const DeptServiceCard = ({ dept }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid var(--hms-border)",
      padding: "1.25rem",
      boxShadow: "var(--shadow-xs)",
      transition: "box-shadow 0.2s, transform 0.2s",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "var(--shadow-md)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "var(--shadow-xs)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {/* Top row: icon + sparkline */}
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "0.875rem",
      }}
    >
      <div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: dept.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
            marginBottom: "0.5rem",
          }}
        >
          {dept.icon}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {dept.fullLabel}
        </p>
      </div>

      {/* Patient volume sparkline — rising means more people helped */}
      <Sparkline
        data={dept.trend7d}
        color={dept.color}
        width={72}
        height={32}
      />
    </div>

    {/* Patients today */}
    <div style={{ marginBottom: "0.875rem" }}>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "var(--hms-navy)",
          margin: "0 0 2px",
          letterSpacing: "-0.025em",
          lineHeight: 1,
        }}
      >
        {dept.patientsToday}
      </p>
      <p
        style={{
          fontSize: "0.72rem",
          color: "#64748b",
          margin: 0,
          fontWeight: 600,
        }}
      >
        patients served today
      </p>
      <p
        style={{
          fontSize: "0.7rem",
          color: "#94a3b8",
          margin: "2px 0 0",
          fontWeight: 500,
        }}
      >
        {dept.patientsMonth.toLocaleString("en-IN")} this month
      </p>
    </div>

    {/* Divider */}
    <div
      style={{
        height: 1,
        background: "var(--hms-border)",
        margin: "0.75rem 0",
      }}
    />

    {/* Service quality metrics */}
    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}
        >
          {dept.serviceMetric}
        </span>
        <span
          style={{ fontSize: "0.78rem", fontWeight: 700, color: dept.color }}
        >
          {dept.serviceValue}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}
        >
          {dept.secondaryMetric}
        </span>
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "var(--hms-navy)",
          }}
        >
          {dept.secondaryValue}
        </span>
      </div>
    </div>

    {/* Bottom note */}
    <p
      style={{
        margin: "0.75rem 0 0",
        fontSize: "0.68rem",
        fontWeight: 600,
        color: dept.color,
        background: dept.bg,
        padding: "4px 10px",
        borderRadius: 20,
        display: "inline-block",
      }}
    >
      {dept.note}
    </p>
  </div>
);

// MAIN DASHBOARD COMPONENT
const Dashboard = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("1y");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Shared card style
  const card = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid var(--hms-border)",
    boxShadow: "var(--shadow-xs)",
  };

  // Chart options
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
        grid: { color: "#f1f5f9" },
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
    cutout: "74%",
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

  // JSX
  return (
    <div style={{ fontFamily: "var(--font-body)", maxWidth: 1400 }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .db-au  { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.15) both; }
        .db-d1  { animation-delay: .04s; }
        .db-d2  { animation-delay: .08s; }
        .db-d3  { animation-delay: .12s; }
        .db-d4  { animation-delay: .16s; }
        .db-d5  { animation-delay: .20s; }
        .db-d6  { animation-delay: .24s; }
        .db-d7  { animation-delay: .28s; }
        .db-d8  { animation-delay: .32s; }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .rev-dept-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .charts-row {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .patient-row:hover { background: var(--hms-sky) !important; cursor: pointer; }

        @media (max-width: 767px) {
          .kpi-grid     { grid-template-columns: repeat(2, 1fr); }
          .rev-dept-grid{ grid-template-columns: repeat(2, 1fr); }
          .charts-row   { grid-template-columns: 1fr; }
        }
        @media (max-width: 479px) {
          .kpi-grid     { grid-template-columns: 1fr; }
          .rev-dept-grid{ grid-template-columns: 1fr; }
        }

        @keyframes ripple {
          0%   { box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
          70%  { box-shadow: 0 0 0 8px rgba(5,150,105,0); }
          100% { box-shadow: 0 0 0 0 rgba(5,150,105,0);   }
        }
      `}</style>

      {/* 1. PAGE HEADER */}
      <div
        className="db-au"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: "0.2rem",
            }}
          >
            <Sparkles size={14} style={{ color: "var(--hms-blue)" }} />
            <span
              style={{
                fontSize: "0.72rem",
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
              border: "1px solid rgba(5,150,105,0.2)",
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

      {/* 2. KPI CARDS (with sparklines)*/}
      <div className="kpi-grid">
        {kpiData.map((kpi, i) => {
          const Icon = kpiIcons[kpi.icon];
          return (
            <div
              key={kpi.id}
              className={`db-au db-d${i + 1}`}
              style={{
                ...card,
                padding: "1.25rem 1.375rem",
                cursor: "default",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Row 1: Title + Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "0.875rem",
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
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: kpi.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: kpi.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} />
                </div>
              </div>

              {/* Row 2: Value + Sparkline */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginBottom: "0.625rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.65rem",
                    fontWeight: 800,
                    color: "var(--hms-navy)",
                    margin: 0,
                    letterSpacing: "-0.025em",
                    lineHeight: 1,
                  }}
                >
                  {kpi.value}
                </p>
                {/* Sparkline — shows 7-day trend */}
                <Sparkline
                  data={kpi.trend7d}
                  color={kpi.color}
                  width={72}
                  height={32}
                />
              </div>

              {/* Row 3: Trend */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {kpi.trend === "up" ? (
                  <TrendingUp size={13} style={{ color: "#059669" }} />
                ) : (
                  <TrendingDown size={13} style={{ color: "#dc2626" }} />
                )}
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: kpi.trend === "up" ? "#059669" : "#dc2626",
                  }}
                >
                  {kpi.change}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
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

      {/* 3. QUICK STATS BAR */}
      <div className="quick-grid db-au db-d5">
        {quickStats.map((stat, i) => {
          const Icon = quickIcons[i];
          return (
            <div
              key={stat.label}
              style={{
                ...card,
                padding: "0.875rem 1.125rem",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: "var(--hms-blue-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--hms-blue)",
                  flexShrink: 0,
                }}
              >
                <Icon size={15} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.15rem",
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
                    fontSize: "0.7rem",
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

      {/* 4. REVENUE BREAKDOWN SECTION */}
      <div className="db-au db-d5" style={{ marginBottom: "1rem" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: "0.875rem",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--hms-blue-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Target size={14} style={{ color: "var(--hms-blue)" }} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              Department Service Summary
            </h2>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Patients served today · Updated live
            </p>
          </div>
        </div>

        <div className="rev-dept-grid">
          {departmentStats.map((dept, i) => (
            <div key={dept.id} className={`db-au db-d${i + 1}`}>
              <DeptServiceCard dept={dept} />
            </div>
          ))}
        </div>
      </div>

      {/* 5. CHARTS ROW */}
      <div className="charts-row db-au db-d6">
        {/* Revenue Line Chart */}
        <div style={{ ...card, padding: "1.375rem" }}>
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
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "var(--hms-navy)",
                  margin: 0,
                }}
              >
                Revenue Trend
              </h3>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  marginTop: 3,
                  fontWeight: 500,
                }}
              >
                OPD & IPD monthly comparison
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

        {/* Appointment Doughnut */}
        <div style={{ ...card, padding: "1.375rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
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
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              128
            </p>
            <p
              style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}
            >
              Total today
            </p>
          </div>
        </div>
      </div>

      {/* 6. RECENT PATIENTS TABLE */}
      <div className="db-au db-d7" style={{ ...card, padding: "1.375rem" }}>
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
                fontSize: "0.95rem",
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
              border: "1px solid rgba(37,99,235,0.2)",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--hms-blue)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#bfdbfe")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--hms-sky)")
            }
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
                      fontSize: "0.67rem",
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
                      fontWeight: 500,
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
                      fontWeight: 500,
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
    </div>
  );
};

export default Dashboard;
