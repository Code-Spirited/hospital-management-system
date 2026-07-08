// ─────────────────────────────────────────────────────────────────────────────
// reportUtils.js
//
// Shared across every Reports page this week — OPD today; IPD/Pharmacy/
// Revenue Reports later this week reuse these same functions rather than
// each reimplementing date-range filtering and trend-grouping logic.
// ─────────────────────────────────────────────────────────────────────────────

import dayjs from "dayjs";

export const DATE_RANGE_PRESETS = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "All Time",
  "Custom",
];

// Returns { start, end } as dayjs objects, or { start: null, end: null }
// for "All Time" (or an incomplete Custom range) — null bounds mean
// "unbounded," which isWithinRange treats as always-matching. This is a
// deliberate safe default: an incomplete custom range degrades to
// "show everything," never to "show nothing."
export const getPresetRange = (preset, customStart, customEnd) => {
  const now = dayjs();
  switch (preset) {
    case "Today":
      return { start: now.startOf("day"), end: now.endOf("day") };
    case "This Week":
      return { start: now.startOf("week"), end: now.endOf("week") };
    case "This Month":
      return { start: now.startOf("month"), end: now.endOf("month") };
    case "This Year":
      return { start: now.startOf("year"), end: now.endOf("year") };
    case "Custom": {
      if (!customStart || !customEnd) return { start: null, end: null };
      return {
        start: dayjs(customStart, "DD-MM-YYYY").startOf("day"),
        end: dayjs(customEnd, "DD-MM-YYYY").endOf("day"),
      };
    }
    case "All Time":
    default:
      return { start: null, end: null };
  }
};

// Bounds are inclusive.
export const isWithinRange = (dateValue, start, end) => {
  if (!dateValue) return false;
  if (!start || !end) return true;
  const t = dayjs(dateValue).valueOf();
  return t >= start.valueOf() && t <= end.valueOf();
};

// Groups records by day for short ranges, by month for ranges longer
// than 60 days — so selecting "This Year" doesn't try to render 365
// individual daily bars. Sorting happens on a lexicographically-sortable
// key (YYYY-MM or YYYY-MM-DD), never on the human-readable display
// label, since "Apr" < "Aug" < "Dec" < "Jan" alphabetically would
// silently scramble a real chronological trend.
export const buildTrend = (records, dateField, start, end) => {
  const filtered = records.filter((r) =>
    isWithinRange(r[dateField], start, end),
  );
  if (filtered.length === 0) return [];

  const spanDays =
    start && end
      ? end.diff(start, "day")
      : // Unbounded (All Time) — derive the span from how the data itself
        // actually spreads out, rather than from a range that doesn't exist.
        dayjs(
          Math.max(...records.map((r) => dayjs(r[dateField]).valueOf())),
        ).diff(
          dayjs(Math.min(...records.map((r) => dayjs(r[dateField]).valueOf()))),
          "day",
        );

  const groupByMonth = spanDays > 60;
  const buckets = new Map();

  records.forEach((r) => {
    const d = dayjs(r[dateField]);
    const key = groupByMonth ? d.format("YYYY-MM") : d.format("YYYY-MM-DD");
    const label = groupByMonth ? d.format("MMM YYYY") : d.format("D MMM");
    if (!buckets.has(key)) buckets.set(key, { key, label, count: 0 });
    buckets.get(key).count += 1;
  });

  return [...buckets.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
};

export const fmtCurrency = (n) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// ── Shared Recharts style constants ──────────────────────────────────────────
// Moved here from ReportComponents.jsx: that file exports two actual
// COMPONENTS (ChartCard, EmptyChartNote) plus these four plain style
// objects — mixing component and non-component exports in one file
// breaks Vite's react-refresh/only-export-components rule, since Fast
// Refresh can only preserve component state across a hot-reload when a
// module exports exclusively components. This is the correct home for
// plain constants regardless, not just a lint workaround.
export const TICK_STYLE = {
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fill: "#94a3b8",
};
export const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
};
export const TOOLTIP_LABEL_STYLE = {
  color: "#e2e8f0",
  fontFamily: "var(--font-body)",
  fontSize: "0.75rem",
  fontWeight: 600,
  marginBottom: 4,
};
export const TOOLTIP_ITEM_STYLE = {
  color: "#94a3b8",
  fontFamily: "var(--font-body)",
  fontSize: "0.72rem",
};
