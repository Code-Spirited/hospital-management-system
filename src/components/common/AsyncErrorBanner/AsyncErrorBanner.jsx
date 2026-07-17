// ─────────────────────────────────────────────────────────────────────────────
// AsyncErrorBanner.jsx
//
// Shown above a page's content when that page's Context reports a fetch
// error. Deliberately non-blocking — useAsyncData never clears `data` on
// a failed fetch, so a page still shows its last-known-good data (the
// seed array, or the last successful load) underneath this banner,
// rather than the whole page disappearing.
// ─────────────────────────────────────────────────────────────────────────────

import { AlertTriangle, RotateCcw } from "lucide-react";

const AsyncErrorBanner = ({ error, onRetry, label = "data" }) => {
  if (!error) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0.875rem 1.125rem",
        borderRadius: 12,
        background: "#fef2f2",
        border: "1.5px solid rgba(220,38,38,0.25)",
        marginBottom: "1.25rem",
      }}
    >
      <AlertTriangle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#991b1b",
          }}
        >
          Couldn't refresh {label}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#b91c1c" }}>
          {error.message ||
            "Something went wrong. Showing the last known data."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0.45rem 0.875rem",
            border: "1.5px solid rgba(220,38,38,0.3)",
            borderRadius: 9,
            background: "#fff",
            color: "#dc2626",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          <RotateCcw size={13} /> Retry
        </button>
      )}
    </div>
  );
};

export default AsyncErrorBanner;
