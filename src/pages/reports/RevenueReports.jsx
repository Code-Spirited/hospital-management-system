// ─────────────────────────────────────────────────────────────────────────────
// RevenueReports.jsx — updated to draw on shared chart.js infrastructure
// (reportUtils/ReportComponents), now extracted since the same pattern
// repeats across OPD/IPD/Pharmacy Reports too. Business logic unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  IndianRupee,
  Stethoscope,
  BedDouble,
  Pill,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Receipt,
  FileBarChart,
} from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { useIPD } from "../../context/IPDContext";
import { usePharmacy } from "../../context/PharmacyContext";
import DateRangeFilter from "./DateRangeFilter";
import Abbr from "../../components/common/Abbr/Abbr";
import {
  getPresetRange,
  isWithinRange,
  getPreviousRange,
  fmtCurrency,
  gradientFill,
  CHART_TOOLTIP_BASE,
  CHART_TICK_BASE,
} from "./reportUtils";
import { DoughnutWithCenter, ChartLegendRow } from "./ReportComponents";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  ChartTooltip,
  ChartLegend,
);

const MODULE_COLORS = { OPD: "#2563eb", IPD: "#7c3aed", Pharmacy: "#0d9488" };
const fmtPercent = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

const RevenueReports = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  const { admissions } = useIPD();
  const { sales } = usePharmacy();

  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getPresetRange(preset, customStart, customEnd);
  const { prevStart, prevEnd } = getPreviousRange(start, end);

  const opdBilled = useMemo(
    () =>
      appointments.filter(
        (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
      ),
    [appointments, start, end],
  );
  const ipdBilled = useMemo(
    () =>
      admissions.filter(
        (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
      ),
    [admissions, start, end],
  );
  const pharmSold = useMemo(
    () => sales.filter((s) => isWithinRange(s.soldOn, start, end)),
    [sales, start, end],
  );

  const opdRevenue = useMemo(
    () => opdBilled.reduce((s, a) => s + a.billing.total, 0),
    [opdBilled],
  );
  const ipdRevenue = useMemo(
    () => ipdBilled.reduce((s, a) => s + a.billing.total, 0),
    [ipdBilled],
  );
  const pharmacyRevenue = useMemo(
    () => pharmSold.reduce((s, sale) => s + sale.total, 0),
    [pharmSold],
  );
  const totalRevenue = opdRevenue + ipdRevenue + pharmacyRevenue;

  const prevTotal = useMemo(() => {
    if (!prevStart || !prevEnd) return null;
    const o = appointments
      .filter(
        (a) =>
          a.billing && isWithinRange(a.billing.billedOn, prevStart, prevEnd),
      )
      .reduce((s, a) => s + a.billing.total, 0);
    const i = admissions
      .filter(
        (a) =>
          a.billing && isWithinRange(a.billing.billedOn, prevStart, prevEnd),
      )
      .reduce((s, a) => s + a.billing.total, 0);
    const p = sales
      .filter((s) => isWithinRange(s.soldOn, prevStart, prevEnd))
      .reduce((s, sale) => s + sale.total, 0);
    return o + i + p;
  }, [appointments, admissions, sales, prevStart, prevEnd]);

  const delta = useMemo(() => {
    if (prevTotal === null) return null;
    if (prevTotal === 0)
      return totalRevenue > 0
        ? { text: "New revenue vs last period", up: true }
        : null;
    const pct = ((totalRevenue - prevTotal) / prevTotal) * 100;
    return { text: `${fmtPercent(pct)} vs last period`, up: pct >= 0 };
  }, [prevTotal, totalRevenue]);

  const modules = [
    {
      name: "OPD",
      value: opdRevenue,
      count: opdBilled.length,
      color: MODULE_COLORS.OPD,
      Icon: Stethoscope,
      path: "/reports",
    },
    {
      name: "IPD",
      value: ipdRevenue,
      count: ipdBilled.length,
      color: MODULE_COLORS.IPD,
      Icon: BedDouble,
      path: "/reports/ipd",
    },
    {
      name: "Pharmacy",
      value: pharmacyRevenue,
      count: pharmSold.length,
      color: MODULE_COLORS.Pharmacy,
      Icon: Pill,
      path: "/reports/pharmacy",
    },
  ];

  const combinedTrend = useMemo(() => {
    const allDates = [
      ...opdBilled.map((a) => a.billing.billedOn),
      ...ipdBilled.map((a) => a.billing.billedOn),
      ...pharmSold.map((s) => s.soldOn),
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
    const addTo = (dateStr, field, amount) => {
      const key = bucketKey(dateStr);
      if (!buckets.has(key))
        buckets.set(key, {
          key,
          label: bucketLabel(dateStr),
          OPD: 0,
          IPD: 0,
          Pharmacy: 0,
        });
      buckets.get(key)[field] += amount;
    };
    opdBilled.forEach((a) => addTo(a.billing.billedOn, "OPD", a.billing.total));
    ipdBilled.forEach((a) => addTo(a.billing.billedOn, "IPD", a.billing.total));
    pharmSold.forEach((s) => addTo(s.soldOn, "Pharmacy", s.total));

    return [...buckets.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
  }, [opdBilled, ipdBilled, pharmSold, start, end]);

  const trendChartData = {
    labels: combinedTrend.map((d) => d.label),
    datasets: modules.map((m) => ({
      label: m.name,
      data: combinedTrend.map((d) => d[m.name]),
      borderColor: m.color,
      backgroundColor: gradientFill(m.color),
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: m.color,
      pointBorderColor: "#fff",
      pointBorderWidth: 1.5,
      borderWidth: 2.5,
    })),
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...CHART_TOOLTIP_BASE,
        displayColors: true,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${fmtCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: CHART_TICK_BASE },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { ...CHART_TICK_BASE, callback: (v) => fmtCurrency(v) },
      },
    },
  };

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
            <FileBarChart size={14} style={{ color: "var(--hms-blue)" }} />
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
          Revenue Reports
        </h1>
        <p
          style={{
            fontSize: "0.82rem",
            color: "#64748b",
            margin: "0.35rem 0 0",
          }}
        >
          Consolidated revenue across <Abbr underline={false}>OPD</Abbr>,{" "}
          <Abbr underline={false}>IPD</Abbr>, and Pharmacy — the one
          hospital-wide view none of the individual module reports can show
          alone.
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
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 20,
          padding: "2rem",
          marginBottom: "1.25rem",
          color: "#fff",
        }}
      >
        {totalRevenue === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <IndianRupee
              size={28}
              style={{ color: "rgba(255,255,255,0.35)", marginBottom: 10 }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 600,
                opacity: 0.75,
              }}
            >
              No revenue recorded in this range yet.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14,
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    opacity: 0.6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Total Hospital-Wide Revenue
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {fmtCurrency(totalRevenue)}
                </p>
              </div>
              {delta && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 13px",
                    borderRadius: 20,
                    background: delta.up
                      ? "rgba(34,197,94,0.16)"
                      : "rgba(239,68,68,0.16)",
                    color: delta.up ? "#4ade80" : "#f87171",
                  }}
                >
                  {delta.up ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                    {delta.text}
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                width: "100%",
                height: 12,
                borderRadius: 99,
                overflow: "hidden",
                background: "rgba(255,255,255,0.08)",
                marginBottom: 12,
              }}
            >
              {modules
                .filter((m) => m.value > 0)
                .map((m) => (
                  <div
                    key={m.name}
                    title={`${m.name}: ${fmtCurrency(m.value)} (${((m.value / totalRevenue) * 100).toFixed(1)}%)`}
                    style={{
                      width: `${(m.value / totalRevenue) * 100}%`,
                      background: m.color,
                      transition: "width 0.6s ease",
                    }}
                  />
                ))}
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {modules.map((m) => (
                <div
                  key={m.name}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: m.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      opacity: 0.85,
                    }}
                  >
                    {m.name}{" "}
                    <span style={{ opacity: 0.6 }}>
                      · {fmtCurrency(m.value)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: "1rem",
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
                margin: "3px 0 0",
                fontWeight: 500,
              }}
            >
              By module, over the selected range
            </p>
          </div>
          <ChartLegendRow
            items={modules.map((m) => ({
              label: m.name,
              color: m.color,
              square: true,
            }))}
            justify="flex-end"
          />
        </div>
        {combinedTrend.length === 0 ? (
          <div
            style={{
              height: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.82rem",
                color: "#94a3b8",
                fontWeight: 500,
                margin: 0,
              }}
            >
              No billed revenue in this range.
            </p>
          </div>
        ) : (
          <div style={{ height: 260 }}>
            <Line data={trendChartData} options={trendChartOptions} />
          </div>
        )}
      </div>

      <div
        className="revenue-module-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}
      >
        <style>{`
          @media (min-width: 760px) { .revenue-module-grid { grid-template-columns: repeat(3, 1fr); } }
        `}</style>
        {modules.map((m, i) => {
          const pct = totalRevenue > 0 ? (m.value / totalRevenue) * 100 : null;
          const ringData = {
            datasets: [
              {
                data: [m.value, Math.max(totalRevenue - m.value, 0)],
                backgroundColor: [m.color, "#f1f5f9"],
                borderWidth: 0,
              },
            ],
          };
          const ringOptions = {
            cutout: "74%",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
          };
          return (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1 + i * 0.08,
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
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${m.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <m.Icon size={17} style={{ color: m.color }} />
                </div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: "var(--hms-navy)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {m.name}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: "1rem",
                }}
              >
                <div style={{ width: 56, height: 56, flexShrink: 0 }}>
                  {pct !== null ? (
                    <DoughnutWithCenter
                      data={ringData}
                      options={ringOptions}
                      centerValue={`${pct.toFixed(0)}%`}
                      centerColor={m.color}
                      height={56}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        border: "6px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#cbd5e1",
                          fontWeight: 700,
                        }}
                      >
                        —
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "var(--hms-navy)",
                    }}
                  >
                    {fmtCurrency(m.value)}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.74rem",
                      color: "#94a3b8",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Receipt size={11} /> {m.count}{" "}
                    {m.count === 1 ? "transaction" : "transactions"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(m.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "0.55rem 0.8rem",
                  border: `1.5px solid ${m.color}30`,
                  borderRadius: 10,
                  background: `${m.color}0d`,
                  color: m.color,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                View {m.name} Report <ArrowRight size={13} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueReports;
