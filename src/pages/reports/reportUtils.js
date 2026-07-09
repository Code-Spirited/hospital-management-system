// ─────────────────────────────────────────────────────────────────────────────
// reportUtils.js
//
// Shared across every Reports page — date-range filtering/grouping,
// currency formatting, period-over-period comparison, and chart.js
// styling helpers used by every Reports chart.
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

export const isWithinRange = (dateValue, start, end) => {
  if (!dateValue) return false;
  if (!start || !end) return true;
  const t = dayjs(dateValue).valueOf();
  return t >= start.valueOf() && t <= end.valueOf();
};

export const buildTrend = (records, dateField, start, end) => {
  const filtered = records.filter((r) =>
    isWithinRange(r[dateField], start, end),
  );
  if (filtered.length === 0) return [];

  const spanDays =
    start && end
      ? end.diff(start, "day")
      : dayjs(
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

// Returns the immediately-preceding period of the SAME LENGTH as
// [start, end] — powers Revenue Reports' "+X% vs last period" delta.
// Returns nulls for an unbounded range (All Time, or an incomplete
// Custom range). Shifts by equal DURATION, not necessarily the same
// calendar unit — a standard, deliberate simplification most analytics
// dashboards make.
export const getPreviousRange = (start, end) => {
  if (!start || !end) return { prevStart: null, prevEnd: null };
  const durationMs = end.valueOf() - start.valueOf();
  const prevEnd = start.subtract(1, "millisecond");
  const prevStart = dayjs(prevEnd.valueOf() - durationMs);
  return { prevStart, prevEnd };
};

// ── Shared chart.js styling helpers ──────────────────────────────────────────
// Canvas text can't resolve CSS custom properties (var(--font-body)) —
// chart.js draws directly to a <canvas>, which needs a real, resolved
// font string, not a CSS variable. A safe generic sans-serif stack,
// rather than guessing this project's exact installed font name.
export const CHART_FONT = "'Segoe UI', system-ui, sans-serif";

export const hexToRgb = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

// Scriptable backgroundColor — chart.js calls this once the canvas/area
// is known, letting us paint a real top-to-bottom fade under a line
// rather than a flat translucent fill.
export const gradientFill = (hex) => (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return `rgba(${hexToRgb(hex)}, 0.12)`;
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.top,
    0,
    chartArea.bottom,
  );
  gradient.addColorStop(0, `rgba(${hexToRgb(hex)}, 0.28)`);
  gradient.addColorStop(1, `rgba(${hexToRgb(hex)}, 0)`);
  return gradient;
};

// Spreadable base for any chart's plugins.tooltip options — keeps the
// dark, rounded tooltip look consistent across every Reports chart.
export const CHART_TOOLTIP_BASE = {
  backgroundColor: "#0f172a",
  padding: 11,
  cornerRadius: 9,
  titleFont: { family: CHART_FONT, size: 12, weight: "600" },
  bodyFont: { family: CHART_FONT, size: 11.5 },
};

// Spreadable base for any chart's x/y scale ticks options.
export const CHART_TICK_BASE = {
  font: { family: CHART_FONT, size: 11 },
  color: "#94a3b8",
};
