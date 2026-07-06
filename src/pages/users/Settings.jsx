// ─────────────────────────────────────────────────────────────────────────────
// Settings.jsx — Week 6, Saturday
//
// Preferences for the current (stand-in) user — distinct from Friday's
// Profile.jsx, which handles IDENTITY (name/email/phone/password).
// Settings handles PREFERENCES: which notifications to receive and
// through which channel, table/display defaults, and (simulated)
// security options. Same stand-in-current-user note as Profile.jsx.
//
// SCOPE NOTE: Notification Preferences are genuinely just that — a
// preference center in their own right. Storing "I want email alerts
// for X" is legitimate work on its own; actually SENDING an email when
// X happens would be separate backend/service work in any real system.
// Display Preferences and Security ARE explicitly flagged below as not
// yet wired into live app behavior — same honest treatment as
// Wed/Thu's permission matrices and Friday's simulated password change.
//
// No useEffect anywhere in this file — unlike yesterday's
// UserPermissions.jsx, there's no "selected sub-entity changes"
// scenario here at all (no picker; this page always concerns the one
// stand-in current user), so nothing here would ever need a
// reset-on-change pattern. useState's lazy initializer form is used
// instead so the settings lookup only runs once, on mount.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Bell,
  Monitor,
  ShieldAlert,
  Info,
  Save,
  Undo2,
  RotateCcw,
} from "lucide-react";
import { useUsers } from "../../context/UsersContext";
import {
  NOTIFICATION_CATEGORIES,
  SESSION_TIMEOUT_OPTIONS,
  DEFAULT_USER_SETTINGS,
} from "./userData";

// Same visual pattern as PatientRegistration's "has insurance" toggle,
// recreated as a small local component since this page has several.
const ToggleSwitch = ({ checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      width: 40,
      height: 22,
      borderRadius: 99,
      position: "relative",
      flexShrink: 0,
      background: checked ? "var(--hms-blue)" : "#e2e8f0",
      cursor: "pointer",
      transition: "background 0.2s",
    }}
  >
    <div
      style={{
        position: "absolute",
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "#fff",
        top: 3,
        left: checked ? 21 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}
    />
  </div>
);

const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid var(--hms-border)",
  boxShadow: "var(--shadow-xs)",
  padding: "1.75rem",
  marginBottom: "1.25rem",
};
const sectionHeadingStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "1rem",
  fontWeight: 800,
  color: "var(--hms-navy)",
  margin: "0 0 1.25rem",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const Settings = () => {
  const { users, getUserSettings, updateUserSettings } = useUsers();
  const currentUser = users.find((u) => u.role === "Administrator") ?? users[0];

  const [local, setLocal] = useState(() => getUserSettings(currentUser.id));
  const committed = getUserSettings(currentUser.id);
  const isDirty = JSON.stringify(local) !== JSON.stringify(committed);

  const updateNotificationChannel = (categoryKey, channel, value) => {
    setLocal((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [categoryKey]: { ...prev.notifications[categoryKey], [channel]: value },
      },
    }));
  };
  const updateDisplay = (key, value) =>
    setLocal((prev) => ({
      ...prev,
      display: { ...prev.display, [key]: value },
    }));
  const updateSecurity = (key, value) =>
    setLocal((prev) => ({
      ...prev,
      security: { ...prev.security, [key]: value },
    }));

  const handleSave = () => {
    updateUserSettings(currentUser.id, local);
    toast.success("Settings saved", {
      description: "Your preferences have been updated.",
    });
  };
  const handleDiscard = () => setLocal(committed);
  const handleResetDefaults = () => setLocal(DEFAULT_USER_SETTINGS);

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
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
            <SettingsIcon size={14} style={{ color: "var(--hms-blue)" }} />
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
            Users · Self-Service
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
          Settings
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "0.875rem 1.125rem",
          borderRadius: 12,
          background: "var(--hms-blue-light)",
          border: "1px solid rgba(37,99,235,0.2)",
          marginBottom: "1.5rem",
        }}
      >
        <Info
          size={16}
          style={{ color: "var(--hms-blue)", flexShrink: 0, marginTop: 2 }}
        />
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--hms-blue)",
            margin: 0,
            lineHeight: 1.55,
            fontWeight: 500,
          }}
        >
          Preferences for <strong>{currentUser.fullName}</strong> (stand-in
          current user — see Profile for the same note). Display and Security
          options below are stored but not yet wired into live app behavior;
          Notification Preferences are a genuine preference center on their own.
        </p>
      </div>

      {/* ── Notification Preferences ── */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          <Bell size={16} style={{ color: "var(--hms-blue)" }} /> Notification
          Preferences
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 80px",
            gap: "0.25rem 10px",
            alignItems: "center",
          }}
        >
          <div />
          <div
            style={{
              textAlign: "center",
              fontSize: "0.66rem",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            In-App
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: "0.66rem",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Email
          </div>

          {NOTIFICATION_CATEGORIES.map((cat) => (
            <div key={cat.key} style={{ display: "contents" }}>
              <div
                style={{ padding: "0.65rem 0", borderTop: "1px solid #f1f5f9" }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--hms-navy)",
                  }}
                >
                  {cat.label}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.72rem",
                    color: "#94a3b8",
                  }}
                >
                  {cat.description}
                </p>
              </div>
              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "0.65rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ToggleSwitch
                  checked={local.notifications[cat.key].inApp}
                  onChange={(v) =>
                    updateNotificationChannel(cat.key, "inApp", v)
                  }
                />
              </div>
              <div
                style={{
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: "0.65rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ToggleSwitch
                  checked={local.notifications[cat.key].email}
                  onChange={(v) =>
                    updateNotificationChannel(cat.key, "email", v)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Display Preferences ── */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          <Monitor size={16} style={{ color: "var(--hms-blue)" }} /> Display
          Preferences
        </h2>
        <p
          style={{
            fontSize: "0.76rem",
            color: "#94a3b8",
            margin: "-0.5rem 0 1.125rem",
            fontStyle: "italic",
          }}
        >
          Stored as your preference — not yet read by the tables/pages
          themselves.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--hms-navy)",
              }}
            >
              Default table page size
            </span>
            <select
              value={local.display.defaultPageSize}
              onChange={(e) =>
                updateDisplay("defaultPageSize", Number(e.target.value))
              }
              style={{
                padding: "0.4rem 0.7rem",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 8,
                fontSize: "0.82rem",
                fontFamily: "var(--font-body)",
                color: "#475569",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n} rows
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--hms-navy)",
              }}
            >
              Compact row density
            </span>
            <ToggleSwitch
              checked={local.display.compactDensity}
              onChange={(v) => updateDisplay("compactDensity", v)}
            />
          </div>
        </div>
      </div>

      {/* ── Account Security (simulated) ── */}
      <div style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          <ShieldAlert size={16} style={{ color: "var(--hms-blue)" }} /> Account
          Security
        </h2>
        <p
          style={{
            fontSize: "0.76rem",
            color: "#94a3b8",
            margin: "-0.5rem 0 1.125rem",
            fontStyle: "italic",
          }}
        >
          Simulated, same as Profile's Change Password — no real backend exists
          yet to actually enforce these.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--hms-navy)",
              }}
            >
              Require a verification code at sign-in (2FA)
            </span>
            <ToggleSwitch
              checked={local.security.twoFactorEnabled}
              onChange={(v) => updateSecurity("twoFactorEnabled", v)}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--hms-navy)",
              }}
            >
              Auto sign-out after inactivity
            </span>
            <select
              value={local.security.sessionTimeoutMinutes}
              onChange={(e) =>
                updateSecurity("sessionTimeoutMinutes", Number(e.target.value))
              }
              style={{
                padding: "0.4rem 0.7rem",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 8,
                fontSize: "0.82rem",
                fontFamily: "var(--font-body)",
                color: "#475569",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {SESSION_TIMEOUT_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handleResetDefaults}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0.55rem 0.9rem",
            border: "1.5px solid var(--hms-border)",
            borderRadius: 10,
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          <RotateCcw size={14} /> Reset to Defaults
        </button>

        {isDirty && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleDiscard}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0.55rem 0.9rem",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 10,
                background: "#fff",
                color: "#64748b",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              <Undo2 size={14} /> Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0.55rem 1.1rem",
                border: "none",
                borderRadius: 10,
                background: "var(--hms-blue)",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              }}
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
