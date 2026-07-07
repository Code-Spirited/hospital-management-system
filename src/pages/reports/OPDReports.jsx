// ─────────────────────────────────────────────────────────────────────────────
// OPDReports.jsx — Week 7, Monday
//
// Distinct from Dashboard's Appointment Analytics (Week 2): that section
// is an ambient, always-visible operational snapshot on fixed windows
// (this week / 30 days / today). This is a genuine, standalone REPORT —
// a real user-selectable date range (including Custom From/To), scoped
// only to OPD, shaped for Saturday's planned Export task.
//
// DOMAIN NOTE: appointment counts/status figures are filtered by
// appt.date (the visit itself). Revenue figures are filtered by
// billing.billedOn (when the bill was actually raised) — these are
// legitimately different facts, not the same field filtered twice. A
// visit near a period boundary can be billed slightly after it happened,
// so "visits in June" and "revenue billed in June" aren't always the
// identical set of appointments.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
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
  ClipboardList,
  CalendarCheck,
  XCircle,
  Users,
  IndianRupee,
  FileBarChart,
} from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { STATUS_CONFIG, VISIT_TYPE_CONFIG } from "../opd/appointmentsData";
import DateRangeFilter from "./DateRangeFilter";
import Abbr from "../../components/common/Abbr/Abbr";
import {
  getPresetRange,
  isWithinRange,
  buildTrend,
  fmtCurrency,
} from "./reportUtils";

const TICK_STYLE = {
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fill: "#94a3b8",
};
const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
};
const TOOLTIP_LABEL_STYLE = {
  color: "#e2e8f0",
  fontFamily: "var(--font-body)",
  fontSize: "0.75rem",
  fontWeight: 600,
  marginBottom: 4,
};
const TOOLTIP_ITEM_STYLE = {
  color: "#94a3b8",
  fontFamily: "var(--font-body)",
  fontSize: "0.72rem",
};

const ChartCard = ({ title, subtitle, children }) => (
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
        margin: 0,
      }}
    >
      {title}
    </h3>
    {subtitle && (
      <p
        style={{
          fontSize: "0.75rem",
          color: "#64748b",
          margin: "3px 0 0",
          fontWeight: 500,
        }}
      >
        {subtitle}
      </p>
    )}
    <div style={{ marginTop: "1.125rem" }}>{children}</div>
  </div>
);

const EmptyChartNote = ({ label }) => (
  <div
    style={{
      height: 220,
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
      {label}
    </p>
  </div>
);

const OPDReports = () => {
  const { appointments } = useAppointments();
  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getPresetRange(preset, customStart, customEnd);

  // Appointment-facts set — filtered by appt.date (the visit itself).
  const appointmentsInRange = useMemo(
    () => appointments.filter((a) => isWithinRange(a.date, start, end)),
    [appointments, start, end],
  );
  // Revenue-facts set — filtered by billing.billedOn (when actually
  // invoiced), a genuinely different field from the visit date above.
  const billedInRange = useMemo(
    () =>
      appointments.filter(
        (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
      ),
    [appointments, start, end],
  );

  const totalAppointments = appointmentsInRange.length;
  const completedCount = appointmentsInRange.filter(
    (a) => a.status === "Completed",
  ).length;
  const cancelledNoShowCount = appointmentsInRange.filter(
    (a) => a.status === "Cancelled" || a.status === "No-Show",
  ).length;
  const uniquePatients = new Set(
    appointmentsInRange.map((a) => a.patientId).filter(Boolean),
  ).size;
  const totalRevenue = billedInRange.reduce(
    (sum, a) => sum + (a.billing?.total || 0),
    0,
  );

  const trendData = useMemo(
    () => buildTrend(appointmentsInRange, "date"),
    [appointmentsInRange],
  );

  const statusData = useMemo(
    () =>
      Object.keys(STATUS_CONFIG)
        .map((s) => ({
          name: s,
          value: appointmentsInRange.filter((a) => a.status === s).length,
          color: STATUS_CONFIG[s].color,
        }))
        .filter((d) => d.value > 0),
    [appointmentsInRange],
  );

  const visitTypeData = useMemo(
    () =>
      Object.keys(VISIT_TYPE_CONFIG)
        .map((t) => ({
          name: t,
          value: appointmentsInRange.filter((a) => a.visitType === t).length,
          color: VISIT_TYPE_CONFIG[t].color,
        }))
        .filter((d) => d.value > 0),
    [appointmentsInRange],
  );

  // Doctor-wise: "Appointments"/"Completed" come from the appt.date-
  // filtered set above; "Revenue" sums the SAME appointments' own
  // billing regardless of exact billedOn boundary — a per-doctor
  // breakdown is attributing revenue to already-identified visits, not
  // independently re-deriving "what was billed in this period" the way
  // the top-level summary card above must.
  const doctorStats = useMemo(() => {
    const map = new Map();
    appointmentsInRange.forEach((a) => {
      if (!map.has(a.doctor))
        map.set(a.doctor, {
          doctor: a.doctor,
          appointments: 0,
          completed: 0,
          revenue: 0,
        });
      const entry = map.get(a.doctor);
      entry.appointments += 1;
      if (a.status === "Completed") entry.completed += 1;
      if (a.billing) entry.revenue += a.billing.total;
    });
    return [...map.values()].sort((a, b) => b.appointments - a.appointments);
  }, [appointmentsInRange]);

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
          <Abbr underline={false}>OPD</Abbr> Reports
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

      {/* ── Summary stat cards ── */}
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
            label: "Total Appointments",
            value: totalAppointments,
            Icon: ClipboardList,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "Completed",
            value: completedCount,
            Icon: CalendarCheck,
            color: "var(--hms-success)",
            bg: "var(--hms-success-bg)",
          },
          {
            label: "Cancelled / No-Show",
            value: cancelledNoShowCount,
            Icon: XCircle,
            color: "#dc2626",
            bg: "#fef2f2",
          },
          {
            label: "Unique Patients Seen",
            value: uniquePatients,
            Icon: Users,
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Revenue Billed",
            value: fmtCurrency(totalRevenue),
            Icon: IndianRupee,
            color: "#d97706",
            bg: "#fffbeb",
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
        Appointment counts reflect visit dates within the selected range;
        Revenue Billed reflects bills actually raised within it — a visit near
        the range boundary may be billed slightly after it happened, so these
        can reference slightly different sets of appointments.
      </p>

      {/* ── Charts ── */}
      <div style={{ marginBottom: "1rem" }}>
        <ChartCard
          title="Appointment Trend"
          subtitle={`${totalAppointments} visits in the selected range`}
        >
          {trendData.length === 0 ? (
            <EmptyChartNote label="No appointments in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={trendData}
                margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="opdTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                  formatter={(v) => [`${v} appointments`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#opdTrendGrad)"
                  dot={{ r: 3, fill: "#2563eb" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div
        className="opd-reports-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <style>{`
          @media (min-width: 760px) { .opd-reports-grid-2 { grid-template-columns: 1fr 1fr; } }
        `}</style>
        <ChartCard
          title="Status Breakdown"
          subtitle="Appointments by workflow stage"
        >
          {statusData.length === 0 ? (
            <EmptyChartNote label="No data in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((d) => (
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

        <ChartCard
          title="Visit Type Breakdown"
          subtitle="OPD, Follow-up, Emergency"
        >
          {visitTypeData.length === 0 ? (
            <EmptyChartNote label="No data in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={visitTypeData}
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
                  {visitTypeData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Doctor-wise performance ── */}
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
            margin: "0 0 1rem",
          }}
        >
          Doctor-wise Performance
        </h3>
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
            No appointments in this range.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 520,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--hms-border)" }}>
                  {[
                    "Doctor",
                    "Appointments",
                    "Completed",
                    "Completion Rate",
                    "Revenue",
                  ].map((h) => (
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
                  ))}
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
                      {d.appointments}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {d.completed}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "var(--hms-success)",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      {d.appointments > 0
                        ? `${Math.round((d.completed / d.appointments) * 100)}%`
                        : "—"}
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

export default OPDReports;
