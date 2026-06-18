// ─────────────────────────────────────────────────────────────────────────────
// AppointmentAnalytics.jsx
//
// A self-contained analytics section rendered inside the Dashboard.
// Kept in its own file because it has its own data dependencies, chart
// configurations, and sub-components — merging it into Dashboard.jsx
// would make that file difficult to navigate and review.
//
// All four charts use Recharts with ResponsiveContainer so they adapt
// to any parent width automatically — the Dashboard grid handles layout.
// ─────────────────────────────────────────────────────────────────────────────

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  appointmentsByDay,
  appointmentTrend30d,
  doctorWorkload,
  peakHoursData,
  appointmentOutcomes,
  appointmentSummary,
} from "./dashboardData";

// ── Design constants ──────────────────────────────────────────────────────────
// Centralised here so changing a color updates all four charts at once.
const COLORS = {
  OPD: "#2563eb",
  IPD: "#7c3aed",
  Emergency: "#ef4444",
  FollowUp: "#059669",
  completed: "#059669",
  cancelled: "#ef4444",
  total: "#2563eb",
};

// Shared Recharts tooltip style — applied consistently across all charts
// so the UI feels cohesive rather than each chart having its own look.
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

// Shared XAxis / YAxis tick style
const TICK_STYLE = {
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fill: "#94a3b8",
};

// ── Heat colour for peak hours bars ──────────────────────────────────────────
// Maps a patient count to a blue shade. Higher volume → darker blue.
// This creates a visual heatmap effect without a dedicated heatmap library.
// Max expected value is ~75; anything above that saturates to full colour.
const getPeakColor = (value) => {
  const intensity = Math.min(value / 75, 1);
  const r = Math.round(37 + (14 - 37) * intensity);
  const g = Math.round(99 + (86 - 99) * intensity);
  const b = Math.round(235 + (220 - 235) * intensity);
  return `rgba(${r}, ${g}, ${b}, ${0.4 + intensity * 0.6})`;
};

// ── Shared card wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, style = {} }) => (
  <div
    className="hms-chart-card"
    style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid var(--hms-border)",
      boxShadow: "var(--shadow-xs)",
      ...style,
    }}
  >
    {(title || subtitle) && (
      <div style={{ marginBottom: "1.25rem" }}>
        {title && (
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
        )}
        {subtitle && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              marginTop: 3,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
);

// ── Custom tooltip for the 30-day trend chart ─────────────────────────────────
// Recharts' default tooltip shows raw numbers. This custom version adds
// labels and formats them in a way that's meaningful for hospital staff.
const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...TOOLTIP_STYLE }}>
      <p style={TOOLTIP_LABEL_STYLE}>{label}</p>
      {payload.map((p) => (
        <p
          key={p.dataKey}
          style={{ ...TOOLTIP_ITEM_STYLE, color: p.color, margin: "2px 0" }}
        >
          {p.name}: <strong style={{ color: "#fff" }}>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Custom label for the pie chart centre ────────────────────────────────────
// Recharts' PieChart does not natively support a centre label.
// We render it as a positioned div over the SVG using absolute positioning.
const PieCentreLabel = ({ total }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
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
      {total}
    </p>
    <p
      style={{
        fontSize: "0.68rem",
        color: "#64748b",
        fontWeight: 600,
        margin: 0,
      }}
    >
      this week
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AppointmentAnalytics = () => {
  const s = appointmentSummary;

  // Summary stat cards rendered in the section header row
  const summaryStats = [
    {
      label: "Total This Week",
      value: s.totalThisWeek.toLocaleString("en-IN"),
      change: s.vsLastWeek,
      icon: CalendarCheck,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      label: "Completion Rate",
      value: s.completionRate,
      change: "of appointments",
      icon: CheckCircle,
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      label: "Avg Wait Time",
      value: s.avgWaitTime,
      change: "per patient",
      icon: Clock,
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      label: "Cancellation Rate",
      value: s.cancellationRate,
      change: "this month",
      icon: XCircle,
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ];

  return (
    <div className="hms-appt-analytics" style={{ marginTop: "1.5rem" }}>
      <style>{`.hms-appt-analytics {
          container-type: inline-size;
          container-name: hms-appt-analytics;
        }

        .hms-chart-card { padding: 1rem; }
        @container hms-appt-analytics (min-width: 460px) {
          .hms-chart-card { padding: 1.375rem; }
        }

        .appt-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .appt-grid-2 > div {
          min-width: 0;
        }
        .appt-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
  margin-bottom: 1rem;
}
.appt-summary-grid > div {
  min-width: 0;
}

        
        @container hms-appt-analytics (min-width: 700px) {
          .appt-grid-2 { grid-template-columns: 1fr 1fr; }
        }
        @container hms-appt-analytics (min-width: 900px) {
          .appt-summary-grid { grid-template-columns: repeat(4, 1fr); }
        }`}</style>

      {/* ── Section heading ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: "1rem",
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
          <TrendingUp size={14} style={{ color: "var(--hms-blue)" }} />
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
            Appointment Analytics
          </h2>
          <p
            style={{
              fontSize: "0.72rem",
              color: "#64748b",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Weekly patterns · Doctor workload · Peak hours
          </p>
        </div>
      </div>

      {/* ── Summary stat cards ── */}
      <div className="appt-summary-grid">
        {summaryStats.map(({ label, value, change, icon: Icon, color, bg }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid var(--hms-border)",
              padding: "0.875rem 1.125rem",
              boxShadow: "var(--shadow-xs)",
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
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                flexShrink: 0,
              }}
            >
              <Icon size={16} strokeWidth={2} />
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
                {value}
              </p>
              <p
                style={{
                  fontSize: "0.68rem",
                  color: "#64748b",
                  margin: "2px 0 0",
                  fontWeight: 500,
                }}
              >
                {label}
              </p>
              {/* Context caption — e.g. "+8.2%", "per patient" — gives each
                  stat meaning at a glance, matching the Dashboard KPI cards */}
              <p
                style={{
                  fontSize: "0.64rem",
                  color,
                  margin: "1px 0 0",
                  fontWeight: 600,
                }}
              >
                {change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Day-wise bar chart + Outcome pie ── */}
      <div className="appt-grid-2" style={{ marginBottom: "1rem" }}>
        {/* Grouped bar chart — Mon to Sat, coloured by appointment type */}
        <ChartCard
          title="Appointments by Day"
          subtitle="Current week — grouped by type"
        >
          <ResponsiveContainer width="100%" height={220} debounce={150}>
            <BarChart
              data={appointmentsByDay}
              barSize={8}
              barGap={2}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                cursor={{ fill: "#f8fafc" }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  paddingTop: 12,
                }}
              />
              <Bar dataKey="OPD" fill={COLORS.OPD} radius={[4, 4, 0, 0]} />
              <Bar dataKey="IPD" fill={COLORS.IPD} radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="Emergency"
                fill={COLORS.Emergency}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="FollowUp"
                fill={COLORS.FollowUp}
                radius={[4, 4, 0, 0]}
                name="Follow-up"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Appointment outcome pie — what happened to appointments */}
        <ChartCard
          title="Appointment Outcomes"
          subtitle="This week — completion breakdown"
        >
          {/* relative+absolute positioning is used for the centre label overlay */}
          <div style={{ position: "relative", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={150}>
              <PieChart>
                <Pie
                  data={appointmentOutcomes}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {appointmentOutcomes.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  formatter={(value) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <PieCentreLabel total={s.totalThisWeek} />
          </div>

          {/* Custom legend — Recharts default legend doesn't show % values */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem 1rem",
              marginTop: "0.5rem",
              justifyContent: "center",
            }}
          >
            {appointmentOutcomes.map((o) => (
              <div
                key={o.name}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: o.color,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  {o.name} — {o.value}%
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Row 2: 30-day trend — full width ── */}
      <ChartCard
        title="30-Day Appointment Trend"
        subtitle="Daily total with completed vs cancelled overlay"
        style={{ marginBottom: "1rem" }}
      >
        <ResponsiveContainer width="100%" height={200} debounce={150}>
          <AreaChart
            data={appointmentTrend30d}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.total} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS.total} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-completed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={COLORS.completed}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS.completed}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            {/* Show every 5th date label to avoid crowding on small screens */}
            <XAxis
              dataKey="date"
              tick={TICK_STYLE}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={TICK_STYLE}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<TrendTooltip />} />
            <Legend
              wrapperStyle={{
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                paddingTop: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={COLORS.total}
              strokeWidth={2}
              fill="url(#grad-total)"
              dot={false}
              activeDot={{ r: 4, fill: COLORS.total }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke={COLORS.completed}
              strokeWidth={2}
              fill="url(#grad-completed)"
              dot={false}
              activeDot={{ r: 4, fill: COLORS.completed }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 3: Doctor workload + Peak hours ── */}
      <div className="appt-grid-2">
        {/* Horizontal bar chart — easier to read for named categories than vertical */}
        <ChartCard
          title="Doctor Workload"
          subtitle="Appointments handled this month"
        >
          <ResponsiveContainer width="100%" height={220} debounce={150}>
            <BarChart
              data={doctorWorkload}
              layout="vertical"
              barSize={10}
              margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
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
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ ...TICK_STYLE, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                cursor={{ fill: "#f8fafc" }}
                formatter={(value, name, props) => [
                  `${value} appointments`,
                  props.payload.specialty,
                ]}
              />
              <Bar
                dataKey="appointments"
                fill="#2563eb"
                radius={[0, 6, 6, 0]}
                background={{ fill: "#f8fafc", radius: [0, 6, 6, 0] }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peak hours — colour intensity encodes volume (heatmap effect) */}
        <ChartCard
          title="Peak Hours"
          subtitle="Outpatient volume by hour — 8 AM to 7 PM"
        >
          <ResponsiveContainer width="100%" height={220} debounce={150}>
            <BarChart
              data={peakHoursData}
              barSize={18}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ ...TICK_STYLE, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={TICK_STYLE}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                cursor={false}
                formatter={(value) => [`${value} patients`, "Volume"]}
              />
              <Bar dataKey="patients" radius={[5, 5, 0, 0]}>
                {peakHoursData.map((entry, index) => (
                  // Each bar gets a colour derived from its own value — darker = busier.
                  // This is more informative than a uniform colour because the chart
                  // communicates peak intensity without needing a separate legend.
                  <Cell key={index} fill={getPeakColor(entry.patients)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Manual colour scale legend — explains the heat encoding to the reader */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: "0.75rem",
              justifyContent: "center",
            }}
          >
            <span
              style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}
            >
              Low
            </span>
            <div
              style={{
                height: 6,
                width: 100,
                borderRadius: 99,
                background:
                  "linear-gradient(90deg, rgba(37,99,235,0.3), rgba(37,99,235,1))",
              }}
            />
            <span
              style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}
            >
              High
            </span>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AppointmentAnalytics;
