// ─────────────────────────────────────────────────────────────────────────────
// AnalyticsDashboard.jsx — Week 7, Friday
//
// The capstone, cross-module executive overview for the Reports module —
// distinct from: main Dashboard (ambient, always "today," not date-
// rangeable); the four single-purpose Reports (each a deep dive into ONE
// domain or dimension). This page synthesizes ACROSS all four.
//
// "Hospital Activity Overview" intentionally counts ACTIVITY VOLUME
// (appointments/admissions/sales as raw counts, each keyed to its own
// natural date — visit date, admission date, sale date) — NOT revenue-
// by-billing-date, which is already Revenue Reports' job.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Users,
  IndianRupee,
  BedDouble,
  PackageX,
  UserCheck,
  Stethoscope,
  Pill,
  ArrowRight,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { useIPD } from "../../context/IPDContext";
import { usePharmacy } from "../../context/PharmacyContext";
import { useUsers } from "../../context/UsersContext";
import { WARD_CAPACITY } from "../ipd/ipdData";
import { getStockStatus, getExpiryStatus } from "../pharmacy/pharmacyUtils";
import DateRangeFilter from "./DateRangeFilter";
import Abbr from "../../components/common/Abbr/Abbr";
import {
  getPresetRange,
  isWithinRange,
  buildTrend,
  fmtCurrency,
  gradientFill,
  CHART_TOOLTIP_BASE,
  CHART_TICK_BASE,
} from "./reportUtils";
import { ChartCard, EmptyChartNote, ChartLegendRow } from "./ReportComponents";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip,
  ChartLegend,
);

const DOMAIN_COLORS = { OPD: "#2563eb", IPD: "#7c3aed", Pharmacy: "#0d9488" };

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  const { admissions } = useIPD();
  const { medicines, batches, sales } = usePharmacy();
  const { users } = useUsers();

  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const { start, end } = getPresetRange(preset, customStart, customEnd);

  const appointmentsInRange = useMemo(
    () => appointments.filter((a) => isWithinRange(a.date, start, end)),
    [appointments, start, end],
  );
  const admissionsInRange = useMemo(
    () => admissions.filter((a) => isWithinRange(a.admissionDate, start, end)),
    [admissions, start, end],
  );
  const salesInRange = useMemo(
    () => sales.filter((s) => isWithinRange(s.soldOn, start, end)),
    [sales, start, end],
  );
  const dischargesInRange = useMemo(
    () =>
      admissions.filter(
        (a) =>
          a.status === "Discharged" &&
          a.dischargeDate &&
          isWithinRange(a.dischargeDate, start, end),
      ),
    [admissions, start, end],
  );

  // Revenue (billing-date based) — restated ONCE here as the single
  // top-level synthesis figure. This page's whole purpose is being the
  // one place everything ties together, so this isn't the old
  // repeated-four-times problem.
  const opdRevenue = useMemo(
    () =>
      appointments
        .filter(
          (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
        )
        .reduce((s, a) => s + a.billing.total, 0),
    [appointments, start, end],
  );
  const ipdRevenue = useMemo(
    () =>
      admissions
        .filter(
          (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
        )
        .reduce((s, a) => s + a.billing.total, 0),
    [admissions, start, end],
  );
  const pharmacyRevenue = useMemo(
    () => salesInRange.reduce((s, sale) => s + sale.total, 0),
    [salesInRange],
  );
  const totalRevenue = opdRevenue + ipdRevenue + pharmacyRevenue;

  // The one genuine cross-module synthesis no single Report can do: a
  // patient with BOTH an OPD visit and an IPD admission in range counts
  // once, not twice.
  const uniquePatientsServed = useMemo(() => {
    const set = new Set();
    appointmentsInRange.forEach((a) => {
      if (a.patientId) set.add(a.patientId);
    });
    admissionsInRange.forEach((a) => {
      if (a.patientId) set.add(a.patientId);
    });
    return set.size;
  }, [appointmentsInRange, admissionsInRange]);

  // Live snapshots — deliberately NOT range-filtered, same "Currently
  // Admitted" treatment IPD Reports already established.
  const currentlyAdmitted = admissions.filter(
    (a) => a.status === "Admitted",
  ).length;
  const totalBedCapacity = Object.values(WARD_CAPACITY).reduce(
    (a, b) => a + b,
    0,
  );
  const occupancyPct =
    totalBedCapacity > 0 ? (currentlyAdmitted / totalBedCapacity) * 100 : 0;

  const lowStockCount = medicines.filter(
    (m) => getStockStatus(m, batches) === "Low Stock",
  ).length;
  const outOfStockCount = medicines.filter(
    (m) => getStockStatus(m, batches) === "Out of Stock",
  ).length;
  const expiringSoonCount = medicines.filter(
    (m) => getExpiryStatus(m, batches) === "Expiring Soon",
  ).length;
  const stockAlertsTotal = lowStockCount + outOfStockCount;

  const activeStaffCount = users.filter((u) => u.status === "Active").length;

  const opdCompletionRate =
    appointmentsInRange.length > 0
      ? Math.round(
          (appointmentsInRange.filter((a) => a.status === "Completed").length /
            appointmentsInRange.length) *
            100,
        )
      : null;
  const avgLOS = useMemo(() => {
    if (dischargesInRange.length === 0) return null;
    const totalDays = dischargesInRange.reduce(
      (sum, a) =>
        sum + dayjs(a.dischargeDate).diff(dayjs(a.admissionDate), "day"),
      0,
    );
    return totalDays / dischargesInRange.length;
  }, [dischargesInRange]);
  const grossProfit = useMemo(() => {
    return salesInRange.reduce((sum, s) => {
      const netRevenue = s.subtotal - s.discountAmount;
      const cogs = s.items.reduce((isum, item) => {
        const batch = batches.find((b) => b.id === item.batchId);
        return isum + item.quantity * (batch?.unitCost ?? 0);
      }, 0);
      return sum + (netRevenue - cogs);
    }, 0);
  }, [salesInRange, batches]);

  const domains = [
    {
      name: "OPD",
      Icon: Stethoscope,
      color: DOMAIN_COLORS.OPD,
      path: "/reports",
      metric1: { label: "Appointments", value: appointmentsInRange.length },
      metric2: {
        label: "Completion Rate",
        value: opdCompletionRate === null ? "—" : `${opdCompletionRate}%`,
      },
      trend: buildTrend(appointmentsInRange, "date"),
    },
    {
      name: "IPD",
      Icon: BedDouble,
      color: DOMAIN_COLORS.IPD,
      path: "/reports/ipd",
      metric1: { label: "Admissions", value: admissionsInRange.length },
      metric2: {
        label: "Avg. Stay",
        value: avgLOS === null ? "—" : `${avgLOS.toFixed(1)}d`,
      },
      trend: buildTrend(admissionsInRange, "admissionDate"),
    },
    {
      name: "Pharmacy",
      Icon: Pill,
      color: DOMAIN_COLORS.Pharmacy,
      path: "/reports/pharmacy",
      metric1: { label: "Sales", value: salesInRange.length },
      metric2: { label: "Gross Profit", value: fmtCurrency(grossProfit) },
      trend: buildTrend(salesInRange, "soldOn"),
    },
  ];

  const activityTrend = useMemo(() => {
    const allDates = [
      ...appointmentsInRange.map((a) => a.date),
      ...admissionsInRange.map((a) => a.admissionDate),
      ...salesInRange.map((s) => s.soldOn),
    ];
    if (allDates.length === 0) return [];

    const spanDays =
      start && end
        ? end.diff(start, "day")
        : (() => {
            const times = allDates.map((d) => new Date(d).getTime());
            return (Math.max(...times) - Math.min(...times)) / 86400000;
          })();
    const groupByMonth = spanDays > 60;
    const bucketKey = (d) => (groupByMonth ? d.slice(0, 7) : d.slice(0, 10));
    const bucketLabel = (d) => {
      const dt = new Date(d);
      return groupByMonth
        ? dt.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };
    const buckets = new Map();
    const addTo = (dateStr, field) => {
      const key = bucketKey(dateStr);
      if (!buckets.has(key))
        buckets.set(key, {
          key,
          label: bucketLabel(dateStr),
          OPD: 0,
          IPD: 0,
          Pharmacy: 0,
        });
      buckets.get(key)[field] += 1;
    };
    appointmentsInRange.forEach((a) => addTo(a.date, "OPD"));
    admissionsInRange.forEach((a) => addTo(a.admissionDate, "IPD"));
    salesInRange.forEach((s) => addTo(s.soldOn, "Pharmacy"));
    return [...buckets.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
  }, [appointmentsInRange, admissionsInRange, salesInRange, start, end]);

  const activityChartData = {
    labels: activityTrend.map((d) => d.label),
    datasets: Object.keys(DOMAIN_COLORS).map((name) => ({
      label: name,
      data: activityTrend.map((d) => d[name]),
      borderColor: DOMAIN_COLORS[name],
      backgroundColor: gradientFill(DOMAIN_COLORS[name]),
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: DOMAIN_COLORS[name],
      pointBorderColor: "#fff",
      pointBorderWidth: 1.5,
      borderWidth: 2.5,
    })),
  };
  const activityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...CHART_TOOLTIP_BASE,
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: CHART_TICK_BASE },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { ...CHART_TICK_BASE, precision: 0 },
      },
    },
  };

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 } },
  };

  const kpis = [
    {
      label: "Patients Served",
      note: "unique, OPD + IPD combined",
      value: uniquePatientsServed,
      Icon: Users,
      color: "var(--hms-blue)",
      bg: "var(--hms-blue-light)",
    },
    {
      label: "Total Revenue",
      value: fmtCurrency(totalRevenue),
      Icon: IndianRupee,
      color: "#0d9488",
      bg: "#f0fdfa",
      link: "/reports/revenue",
    },
    {
      label: "Bed Occupancy",
      note: "(live)",
      value: `${occupancyPct.toFixed(0)}%`,
      Icon: BedDouble,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      label: "Pharmacy Alerts",
      note: "(live, low + out of stock)",
      value: stockAlertsTotal,
      Icon: PackageX,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      label: "Active Staff",
      note: "(live)",
      value: activeStaffCount,
      Icon: UserCheck,
      color: "var(--hms-success)",
      bg: "var(--hms-success-bg)",
    },
  ];

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
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
            <LayoutDashboard size={14} style={{ color: "var(--hms-blue)" }} />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--hms-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Reports & Analytics
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Analytics Dashboard
        </h1>
        <p
          style={{
            fontSize: "0.82rem",
            color: "#64748b",
            margin: "0.35rem 0 0",
          }}
        >
          The one cross-module overview tying <Abbr underline={false}>OPD</Abbr>
          , <Abbr underline={false}>IPD</Abbr>, Pharmacy, and Revenue together —
          distinct from the main Dashboard (ambient, always "today") and each
          dedicated Report below (a single-domain deep dive).
        </p>
      </div>

      <DateRangeFilter
        preset={preset}
        onPresetChange={setPreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.875rem",
          marginBottom: "1.25rem",
        }}
      >
        {kpis.map((k) => (
          <motion.div
            key={k.label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
            }}
            onClick={k.link ? () => navigate(k.link) : undefined}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid var(--hms-border)",
              padding: "1rem 1.2rem",
              boxShadow: "var(--shadow-xs)",
              display: "flex",
              alignItems: "center",
              gap: 13,
              cursor: k.link ? "pointer" : "default",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: k.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <k.Icon size={19} style={{ color: k.color }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--hms-navy)",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {k.value}
              </p>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {k.label}
              </p>
              {k.note && (
                <p
                  style={{
                    fontSize: "0.65rem",
                    color: "#cbd5e1",
                    margin: "1px 0 0",
                    fontStyle: "italic",
                  }}
                >
                  {k.note}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ marginBottom: "1.25rem" }}>
        <ChartCard
          title="Hospital Activity Overview"
          subtitle="Visit / admission / sale volume by module — activity, not revenue"
        >
          {activityTrend.length === 0 ? (
            <EmptyChartNote label="No activity in this range." />
          ) : (
            <>
              <div style={{ height: 240 }}>
                <Line data={activityChartData} options={activityChartOptions} />
              </div>
              <ChartLegendRow
                items={Object.keys(DOMAIN_COLORS).map((name) => ({
                  label: name,
                  color: DOMAIN_COLORS[name],
                  square: true,
                }))}
              />
            </>
          )}
        </ChartCard>
      </div>

      <div
        className="analytics-domain-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <style>{`
          @media (min-width: 760px) { .analytics-domain-grid { grid-template-columns: repeat(3, 1fr); } }
        `}</style>
        {domains.map((d, i) => {
          const sparkData = {
            labels: d.trend.map((t) => t.label),
            datasets: [
              {
                data: d.trend.map((t) => t.count),
                borderColor: d.color,
                backgroundColor: gradientFill(d.color),
                fill: true,
                tension: 0.4,
                borderWidth: 2,
              },
            ],
          };
          return (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.15 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid var(--hms-border)",
                boxShadow: "var(--shadow-xs)",
                padding: "1.375rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "0.875rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${d.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <d.Icon size={17} style={{ color: d.color }} />
                </div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: "var(--hms-navy)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {d.name}
                </span>
              </div>

              <div
                style={{ display: "flex", gap: 18, marginBottom: "0.875rem" }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: "var(--hms-navy)",
                    }}
                  >
                    {d.metric1.value}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    {d.metric1.label}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: "var(--hms-navy)",
                    }}
                  >
                    {d.metric2.value}
                  </p>
                  <p
                    style={{
                      margin: "1px 0 0",
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    {d.metric2.label}
                  </p>
                </div>
              </div>

              <div style={{ height: 44, marginBottom: "0.875rem" }}>
                {d.trend.length > 0 ? (
                  <Line data={sparkData} options={sparklineOptions} />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", color: "#cbd5e1" }}>
                      No activity in this range
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate(d.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "0.5rem 0.8rem",
                  border: `1.5px solid ${d.color}30`,
                  borderRadius: 10,
                  background: `${d.color}0d`,
                  color: d.color,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}
              >
                View {d.name} Report <ArrowRight size={13} />
              </button>
            </motion.div>
          );
        })}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: "0.875rem",
          }}
        >
          <AlertTriangle size={15} style={{ color: "#d97706" }} />
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.9rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: 0,
            }}
          >
            System Health
          </h3>
          <span
            style={{
              fontSize: "0.7rem",
              color: "#cbd5e1",
              fontStyle: "italic",
            }}
          >
            (live, not affected by the date range above)
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            {
              label: "Low Stock",
              value: lowStockCount,
              color: "#d97706",
              bg: "#fffbeb",
            },
            {
              label: "Out of Stock",
              value: outOfStockCount,
              color: "#dc2626",
              bg: "#fef2f2",
            },
            {
              label: "Expiring Soon",
              value: expiringSoonCount,
              color: "#d97706",
              bg: "#fffbeb",
            },
          ].map((h) => (
            <button
              key={h.label}
              type="button"
              onClick={() => navigate("/pharmacy/expiry")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0.5rem 0.9rem",
                borderRadius: 20,
                background: h.bg,
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{ fontSize: "0.85rem", fontWeight: 800, color: h.color }}
              >
                {h.value}
              </span>
              <span
                style={{ fontSize: "0.76rem", fontWeight: 600, color: h.color }}
              >
                {h.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
