// ─────────────────────────────────────────────────────────────────────────────
// ErrorBoundary.jsx
//
// Must be a class component — componentDidCatch/getDerivedStateFromError
// have no hook equivalent in React. Wraps <AppRoutes /> in App.jsx (not
// the whole app): Toaster and the global toast <style> block stay
// siblings OUTSIDE this boundary, so they keep working even if something
// inside a page crashes.
// ─────────────────────────────────────────────────────────────────────────────

import { Component } from "react";
import { AlertOctagon, RotateCw, Home } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Real implementation, once error-tracking exists (e.g. Sentry):
    //   reportErrorToService(error, errorInfo);
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--hms-surface)",
          fontFamily: "var(--font-body)",
        }}
      >
        <div
          style={{
            maxWidth: 440,
            textAlign: "center",
            background: "#fff",
            borderRadius: 20,
            padding: "2.5rem",
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <AlertOctagon size={26} style={{ color: "#dc2626" }} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 0.5rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.88rem",
              color: "#64748b",
              margin: "0 0 1.5rem",
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred. This has been logged — try reloading
            the page, or head back to the Dashboard.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                textAlign: "left",
                fontSize: "0.72rem",
                color: "#991b1b",
                background: "#fef2f2",
                padding: "0.75rem",
                borderRadius: 10,
                marginBottom: "1.5rem",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message}
            </pre>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "0.7rem 1rem",
                border: "none",
                borderRadius: 11,
                background: "var(--hms-blue)",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              }}
            >
              <RotateCw size={15} /> Reload Page
            </button>
            <button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "0.7rem 1rem",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 11,
                background: "#fff",
                color: "#475569",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              <Home size={15} /> Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
