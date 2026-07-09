// ─────────────────────────────────────────────────────────────────────────────
// ReportComponents.jsx
//
// Shared chart-wrapper COMPONENTS only — ChartCard, EmptyChartNote,
// DoughnutWithCenter, ChartLegendRow. Kept components-only (no plain
// constants) so Vite's react-refresh/only-export-components rule stays
// satisfied. Plain constants/helpers live in reportUtils.js instead.
// ─────────────────────────────────────────────────────────────────────────────

import { Doughnut } from "react-chartjs-2";

export const ChartCard = ({ title, subtitle, children }) => (
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

export const EmptyChartNote = ({ label }) => (
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

// A chart.js Doughnut with a value + optional label absolutely
// positioned in its center hole — used across Revenue/OPD/IPD/Pharmacy
// Reports wherever a category breakdown needs a grand total visible at
// a glance, not just floating, unlabeled ring segments. height <= 90
// switches to smaller default type sizes, for the compact per-card mini
// rings used on Revenue Reports' module cards.
export const DoughnutWithCenter = ({
  data,
  options,
  centerValue,
  centerLabel,
  centerColor = "var(--hms-navy)",
  height = 220,
}) => {
  const isCompact = height <= 90;
  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <Doughnut data={data} options={options} />
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
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: isCompact ? "0.68rem" : "1.5rem",
            fontWeight: 800,
            color: centerColor,
            lineHeight: 1,
          }}
        >
          {centerValue}
        </span>
        {centerLabel && (
          <span
            style={{
              fontSize: isCompact ? "0.55rem" : "0.68rem",
              color: "#94a3b8",
              fontWeight: 600,
              marginTop: isCompact ? 2 : 4,
            }}
          >
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
};

// A row of colored-dot + label(+value) legend items — the same custom
// legend style used throughout the Reports redesign instead of chart.js's
// own default legend rendering, keeping visual language identical across
// every chart.
export const ChartLegendRow = ({ items, justify = "center" }) => (
  <div
    style={{
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      justifyContent: justify,
      marginTop: 10,
    }}
  >
    {items.map((item) => (
      <div
        key={item.label}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: item.square ? 3 : "50%",
            background: item.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{ fontSize: "0.76rem", fontWeight: 600, color: "#475569" }}
        >
          {item.label}
          {item.value !== undefined && (
            <span style={{ color: "#94a3b8", fontWeight: 500 }}>
              {" "}
              · {item.value}
            </span>
          )}
        </span>
      </div>
    ))}
  </div>
);
