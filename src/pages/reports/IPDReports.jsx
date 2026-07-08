// ─────────────────────────────────────────────────────────────────────────────
// IPDReports.jsx — Week 7, Tuesday
//
// IPD introduces a THIRD independent date dimension beyond OPD's two:
// New Admissions (admissionDate), Discharges (dischargeDate), and
// Revenue (billing.billedOn) are three separately-dated facts. A patient
// discharged this period may have been admitted well before it — so a
// doctor's Admissions/Discharges/Revenue in the table below are three
// independent tallies, never assumed to reference the same patients.
//
// SCOPE NOTE: no "average occupancy over the range" metric here — this
// app has only point-in-time admission/discharge records, not a
// continuous bed-day ledger, so a true occupancy-over-time figure can't
// be computed honestly. Live current occupancy already lives at
// IPD → Ward Management; today's ward metric is New Admissions by Ward
// instead — a real, correctly range-filtered fact, not a duplicate of
// that operational page.
//
// Avg Length of Stay only counts admissions actually DISCHARGED within
// the selected range — a currently-admitted patient has no final LOS
// yet, and including them would understate every ongoing long stay.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BedDouble,
  LogOut,
  Users,
  Clock,
  IndianRupee,
  FileBarChart,
} from "lucide-react";
import { useIPD } from "../../context/IPDContext";
import {
  WARD_TYPE_CONFIG,
  CONDITION_AT_DISCHARGE_CONFIG,
} from "../ipd/ipdData";
import DateRangeFilter from "./DateRangeFilter";
import Abbr from "../../components/common/Abbr/Abbr";
import {
  getPresetRange,
  isWithinRange,
  buildTrend,
  fmtCurrency,
  TICK_STYLE,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
} from "./reportUtils";
import { ChartCard, EmptyChartNote } from "./ReportComponents";

const IPDReports = () => {
  const { admissions } = useIPD();
  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getPresetRange(preset, customStart, customEnd);

  const admissionsInRange = useMemo(
    () => admissions.filter((a) => isWithinRange(a.admissionDate, start, end)),
    [admissions, start, end],
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
  const billedInRange = useMemo(
    () =>
      admissions.filter(
        (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
      ),
    [admissions, start, end],
  );

  const currentlyAdmitted = admissions.filter(
    (a) => a.status === "Admitted",
  ).length;

  const totalRevenue = billedInRange.reduce(
    (sum, a) => sum + (a.billing?.total || 0),
    0,
  );

  const avgLOS = useMemo(() => {
    if (dischargesInRange.length === 0) return null;
    const totalDays = dischargesInRange.reduce(
      (sum, a) =>
        sum + dayjs(a.dischargeDate).diff(dayjs(a.admissionDate), "day"),
      0,
    );
    return totalDays / dischargesInRange.length;
  }, [dischargesInRange]);

  const trendData = useMemo(
    () => buildTrend(admissionsInRange, "admissionDate"),
    [admissionsInRange],
  );

  const wardData = useMemo(
    () =>
      Object.keys(WARD_TYPE_CONFIG)
        .map((w) => ({
          name: w,
          value: admissionsInRange.filter((a) => a.wardType === w).length,
          color: WARD_TYPE_CONFIG[w].color,
        }))
        .filter((d) => d.value > 0),
    [admissionsInRange],
  );

  // Only counts discharges that actually recorded an outcome — reuses
  // CONDITION_AT_DISCHARGE_CONFIG exactly as-is, including its already-
  // neutral gray for Deceased. No re-coloring or extra emphasis added.
  const outcomeData = useMemo(() => {
    const counts = {};
    dischargesInRange.forEach((a) => {
      const condition = a.dischargeSummary?.conditionAtDischarge;
      if (!condition) return;
      counts[condition] = (counts[condition] || 0) + 1;
    });
    return Object.keys(CONDITION_AT_DISCHARGE_CONFIG)
      .map((c) => ({
        name: c,
        value: counts[c] || 0,
        color: CONDITION_AT_DISCHARGE_CONFIG[c].color,
      }))
      .filter((d) => d.value > 0);
  }, [dischargesInRange]);

  // Doctor-wise: THREE independently-built tallies, never assumed to
  // reference the same underlying admissions. Discharges are attributed
  // to dischargeSummary.dischargedBy when recorded (may differ from the
  // admitting doctor — a different physician can sign off a discharge).
  const doctorStats = useMemo(() => {
    const map = new Map();
    const ensure = (doc) => {
      if (!map.has(doc))
        map.set(doc, { doctor: doc, admissions: 0, discharges: 0, revenue: 0 });
      return map.get(doc);
    };
    admissionsInRange.forEach((a) => {
      ensure(a.admittingDoctor).admissions += 1;
    });
    dischargesInRange.forEach((a) => {
      ensure(
        a.dischargeSummary?.dischargedBy || a.admittingDoctor,
      ).discharges += 1;
    });
    billedInRange.forEach((a) => {
      ensure(a.admittingDoctor).revenue += a.billing.total;
    });
    return [...map.values()].sort(
      (a, b) => b.admissions + b.discharges - (a.admissions + a.discharges),
    );
  }, [admissionsInRange, dischargesInRange, billedInRange]);

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
          <Abbr underline={false}>IPD</Abbr> Reports
        </h1>
      </div>

      <DateRangeFilter
        preset={preset}
        onPresetChange={setPreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        {[
          {
            label: "Currently Admitted",
            note: "(live, not range-filtered)",
            value: currentlyAdmitted,
            Icon: BedDouble,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "New Admissions",
            value: admissionsInRange.length,
            Icon: Users,
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Discharges",
            value: dischargesInRange.length,
            Icon: LogOut,
            color: "var(--hms-success)",
            bg: "var(--hms-success-bg)",
          },
          {
            label: "Avg. Length of Stay",
            value: avgLOS === null ? "—" : `${avgLOS.toFixed(1)} days`,
            Icon: Clock,
            color: "#d97706",
            bg: "#fffbeb",
          },
          {
            label: "Revenue Billed",
            value: fmtCurrency(totalRevenue),
            Icon: IndianRupee,
            color: "#dc2626",
            bg: "#fef2f2",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid var(--hms-border)",
              padding: "1rem 1.2rem",
              boxShadow: "var(--shadow-xs)",
              display: "flex",
              alignItems: "center",
              gap: 13,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.Icon size={19} style={{ color: s.color }} />
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
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
              {s.note && (
                <p
                  style={{
                    fontSize: "0.66rem",
                    color: "#cbd5e1",
                    margin: "1px 0 0",
                    fontStyle: "italic",
                  }}
                >
                  {s.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: "#94a3b8",
          margin: "0 0 1.25rem",
          fontStyle: "italic",
        }}
      >
        New Admissions, Discharges, and Revenue Billed are three
        independently-dated facts (admission date, discharge date, and billing
        date respectively) — a patient discharged in this period may have been
        admitted well before it, so these don't necessarily describe the same
        set of people. Currently Admitted is today's live count and isn't
        affected by the date range above; see IPD → Ward Management for
        real-time occupancy detail.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <ChartCard
          title="New Admissions Trend"
          subtitle={`${admissionsInRange.length} admissions in the selected range`}
        >
          {trendData.length === 0 ? (
            <EmptyChartNote label="No admissions in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={trendData}
                margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ipdTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  formatter={(v) => [`${v} admissions`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fill="url(#ipdTrendGrad)"
                  dot={{ r: 3, fill: "#7c3aed" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div
        className="ipd-reports-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <style>{`
          @media (min-width: 760px) { .ipd-reports-grid-2 { grid-template-columns: 1fr 1fr; } }
        `}</style>
        <ChartCard
          title="New Admissions by Ward"
          subtitle="Where new admissions were assigned in this range"
        >
          {wardData.length === 0 ? (
            <EmptyChartNote label="No admissions in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={wardData}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {wardData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Discharge Outcomes"
          subtitle="Condition at discharge, this range"
        >
          {outcomeData.length === 0 ? (
            <EmptyChartNote label="No discharges recorded in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {outcomeData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.375rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: "0 0 0.375rem",
          }}
        >
          Doctor-wise Performance
        </h3>
        <p
          style={{ fontSize: "0.74rem", color: "#94a3b8", margin: "0 0 1rem" }}
        >
          Admissions, Discharges, and Revenue are independent tallies per doctor
          — not derived from one shared set of patients.
        </p>
        {doctorStats.length === 0 ? (
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              textAlign: "center",
              padding: "1.5rem 0",
              margin: 0,
            }}
          >
            No activity in this range.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 460,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--hms-border)" }}>
                  {["Doctor", "Admissions", "Discharges", "Revenue"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: h === "Doctor" ? "left" : "right",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((d) => (
                  <tr
                    key={d.doctor}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--hms-navy)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.doctor}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {d.admissions}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {d.discharges}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--hms-navy)",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtCurrency(d.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPDReports;
