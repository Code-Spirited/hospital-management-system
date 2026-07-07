// ─────────────────────────────────────────────────────────────────────────────
// DateRangeFilter.jsx
//
// Shared across every Reports page — the genuine differentiator between
// Dashboard's fixed-window analytics and a real Report: a user-selectable
// date range, including a custom From/To. Built once here so Tuesday's
// IPD Reports and Wednesday's Pharmacy Reports reuse it directly rather
// than each reimplementing the same preset/custom-range UI.
// ─────────────────────────────────────────────────────────────────────────────

import { Calendar } from "lucide-react";
import { DateInput } from "../../components/common";
import { DATE_RANGE_PRESETS } from "./reportUtils";

const DateRangeFilter = ({
  preset,
  onPresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid var(--hms-border)",
      boxShadow: "var(--shadow-xs)",
      padding: "1.25rem 1.5rem",
      marginBottom: "1.25rem",
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
      <Calendar size={15} style={{ color: "var(--hms-blue)" }} />
      <span
        style={{
          fontSize: "0.85rem",
          fontWeight: 800,
          color: "var(--hms-navy)",
          fontFamily: "var(--font-display)",
        }}
      >
        Date Range
      </span>
    </div>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "flex-end",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {DATE_RANGE_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPresetChange(p)}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: 9,
              border: `1.5px solid ${preset === p ? "var(--hms-blue)" : "var(--hms-border)"}`,
              background: preset === p ? "var(--hms-blue)" : "#fff",
              color: preset === p ? "#fff" : "#64748b",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 700,
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {preset === "Custom" && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            marginLeft: 4,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.66rem",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              From
            </label>
            <DateInput
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.66rem",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              To
            </label>
            <DateInput
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  </div>
);

export default DateRangeFilter;
