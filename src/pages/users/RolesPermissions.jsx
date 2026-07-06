// ─────────────────────────────────────────────────────────────────────────────
// RolesPermissions.jsx — Week 6, Wednesday
//
// Roles Reference (what each role is, with a live count of Active users
// holding it) + an editable Role × Module permission matrix. Administrator
// is deliberately excluded from the editable grid — see file header
// discussion in userData.js's DEFAULT_PERMISSIONS comment for why.
//
// Changes are staged locally and require an explicit Save — clicking a
// cell never writes to context immediately. This mirrors the caution
// already applied to Stock Management's confirm-before-committing
// pattern: a permission change is consequential enough to deserve a
// deliberate commit step, with Discard always available beforehand.
//
// SCOPE NOTE, stated plainly: this matrix defines INTENDED access. It is
// not yet enforced anywhere else in the app — there's no real session
// system tying the Login screen to a specific logged-in user record, so
// no page currently restricts itself based on these settings. Real
// enforcement is future work once authentication exists.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Info,
  Save,
  Undo2,
  RotateCcw,
  Lock,
  Stethoscope,
  HeartPulse,
  Pill,
  Phone,
  FlaskConical,
} from "lucide-react";
import Abbr from "../../components/common/Abbr/Abbr";
import { useUsers } from "../../context/UsersContext";
import {
  ROLE_CONFIG,
  ROLE_DESCRIPTIONS,
  MODULES,
  PERMISSION_LEVELS,
  PERMISSION_LEVEL_CONFIG,
  DEFAULT_PERMISSIONS,
} from "./userData";

const ROLE_ICONS = {
  Doctor: Stethoscope,
  Nurse: HeartPulse,
  Pharmacist: Pill,
  Receptionist: Phone,
  "Lab Technician": FlaskConical,
  Administrator: ShieldCheck,
};

const EDITABLE_ROLES = Object.keys(ROLE_CONFIG).filter(
  (r) => r !== "Administrator",
);

const RolesPermissions = () => {
  const { users, permissions, updatePermissions } = useUsers();
  const [localPermissions, setLocalPermissions] = useState(permissions);

  const isDirty =
    JSON.stringify(localPermissions) !== JSON.stringify(permissions);

  const cycleLevel = (role, moduleName) => {
    if (role === "Administrator") return; // defensive — UI never calls this for Admin anyway
    setLocalPermissions((prev) => {
      const current = prev[role][moduleName];
      const idx = PERMISSION_LEVELS.indexOf(current);
      const next = PERMISSION_LEVELS[(idx + 1) % PERMISSION_LEVELS.length];
      return { ...prev, [role]: { ...prev[role], [moduleName]: next } };
    });
  };

  const handleSave = () => {
    updatePermissions(localPermissions);
    toast.success("Permissions updated", {
      description: "The role permission matrix has been saved.",
    });
  };
  const handleDiscard = () => setLocalPermissions(permissions);
  const handleResetDefaults = () => setLocalPermissions(DEFAULT_PERMISSIONS);

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 1000,
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
            <ShieldCheck size={14} style={{ color: "var(--hms-blue)" }} />
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
            Users · Access Control
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
          Roles & Permissions
        </h1>
      </div>

      {/* ── Scope disclaimer — stated plainly, matching every other deferred-scope flag in this project ── */}
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
          This matrix defines each role's <strong>intended</strong> access
          level. It isn't enforced elsewhere in the app yet — there's no session
          system linking the Login screen to a specific user record, so no page
          currently restricts itself based on these settings.
        </p>
      </div>

      {/* ── Roles Reference ── */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 800,
          color: "var(--hms-navy)",
          margin: "0 0 0.875rem",
        }}
      >
        Roles Reference
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "0.875rem",
          marginBottom: "2rem",
        }}
      >
        {Object.keys(ROLE_CONFIG).map((role) => {
          const cfg = ROLE_CONFIG[role];
          const Icon = ROLE_ICONS[role];
          const activeCount = users.filter(
            (u) => u.role === role && u.status === "Active",
          ).length;
          return (
            <div
              key={role}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid var(--hms-border)",
                boxShadow: "var(--shadow-xs)",
                padding: "1.125rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "0.625rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: cfg.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} style={{ color: cfg.color }} />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.92rem",
                    fontWeight: 800,
                    color: "var(--hms-navy)",
                  }}
                >
                  {role}
                </p>
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#64748b",
                  margin: "0 0 0.75rem",
                  lineHeight: 1.5,
                }}
              >
                {ROLE_DESCRIPTIONS[role]}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: cfg.color,
                }}
              >
                {activeCount} active {activeCount === 1 ? "user" : "users"}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Permission Matrix ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: "1.125rem",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: "0 0 0.5rem",
              }}
            >
              Permission Matrix
            </h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PERMISSION_LEVELS.map((level) => {
                const cfg = PERMISSION_LEVEL_CONFIG[level];
                return (
                  <span
                    key={level}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "#64748b",
                    }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 3,
                        background: cfg.color,
                        display: "inline-block",
                      }}
                    />{" "}
                    {level}
                  </span>
                );
              })}
              <span
                style={{
                  fontSize: "0.74rem",
                  color: "#94a3b8",
                  fontStyle: "italic",
                }}
              >
                · click a cell to cycle
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0.5rem 0.875rem",
              border: "1.5px solid var(--hms-border)",
              borderRadius: 9,
              background: "#fff",
              color: "#64748b",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <RotateCcw size={13} /> Reset to Defaults
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "170px repeat(6, minmax(100px, 1fr))",
              minWidth: 780,
              gap: 8,
            }}
          >
            {/* Header row */}
            <div />
            {MODULES.map((m) => (
              <div
                key={m}
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  textAlign: "center",
                  padding: "0 0.25rem",
                }}
              >
                <Abbr underline={false}>{m}</Abbr>
              </div>
            ))}

            {/* Fixed, locked Administrator row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0.5rem 0",
                borderTop: "1.5px solid var(--hms-border)",
              }}
            >
              <ShieldCheck
                size={14}
                style={{
                  color: ROLE_CONFIG.Administrator.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--hms-navy)",
                }}
              >
                Administrator
              </span>
            </div>
            {MODULES.map((m) => (
              <div
                key={m}
                title="Administrators always have full access and cannot be restricted here"
                style={{
                  padding: "0.4rem 0.4rem",
                  borderRadius: 8,
                  background: "var(--hms-success-bg)",
                  color: "var(--hms-success)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  borderTop: "1.5px solid var(--hms-border)",
                  marginTop: "0.5rem",
                  height: 32,
                }}
              >
                <Lock size={10} /> Full
              </div>
            ))}

            {/* Editable roles */}
            {EDITABLE_ROLES.map((role) => (
              <>
                <div
                  key={`${role}-label`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "0.5rem 0",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: ROLE_CONFIG[role].color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--hms-navy)",
                    }}
                  >
                    {role}
                  </span>
                </div>
                {MODULES.map((m) => {
                  const level = localPermissions[role][m];
                  const cfg = PERMISSION_LEVEL_CONFIG[level];
                  return (
                    <div
                      key={`${role}-${m}`}
                      style={{
                        borderTop: "1px solid #f1f5f9",
                        paddingTop: "0.5rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => cycleLevel(role, m)}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.3rem",
                          borderRadius: 8,
                          border: "1.5px solid transparent",
                          background: cfg.bg,
                          color: cfg.color,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          transition: "transform 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.04)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        {level}
                      </button>
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {isDirty && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginTop: "1.25rem",
              padding: "0.875rem 1.125rem",
              borderRadius: 11,
              background: "#fffbeb",
              border: "1.5px solid rgba(217,119,6,0.25)",
            }}
          >
            <span
              style={{ fontSize: "0.82rem", color: "#92400e", fontWeight: 600 }}
            >
              You have unsaved changes to the permission matrix.
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleDiscard}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0.5rem 0.875rem",
                  border: "1.5px solid var(--hms-border)",
                  borderRadius: 9,
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
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: 9,
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
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPermissions;
