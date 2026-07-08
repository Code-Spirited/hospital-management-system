// ─────────────────────────────────────────────────────────────────────────────
// ReportComponents.jsx
//
// Shared chart-wrapper COMPONENTS only — ChartCard and EmptyChartNote.
// The four style-constant objects previously exported alongside these
// have moved to reportUtils.js: mixing component exports with plain-
// object exports in the same file breaks Vite's
// react-refresh/only-export-components rule, since Fast Refresh can
// only preserve state across a hot-reload when a file exports
// exclusively components. Plain constants belong in a utils file;
// components belong here.
// ─────────────────────────────────────────────────────────────────────────────

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
