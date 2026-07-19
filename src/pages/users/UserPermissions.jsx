// ─────────────────────────────────────────────────────────────────────────────
// UserPermissions.jsx — Week 6, Thursday (fixed)
//
// Distinct from Wednesday's RolesPermissions.jsx: that page configures
// what a ROLE can do by default; this page manages EXCEPTIONS for one
// specific PERSON on top of that default. Search a user → see their
// role's inherited access per module → optionally override individual
// modules for them alone. Administrator-role users are excluded from
// editing here too, for the identical reason as Wednesday: their role
// default is already Full Access everywhere, so an override would be a
// meaningless no-op — shown as locked, not hidden, matching that same
// established visual convention.
//
// The editing panel is its own component, remounted via `key={user.id}`
// whenever the selected user changes — this is what correctly resets
// localOverrides to the newly-selected user's committed state, with no
// useEffect involved. An Effect that calls setState purely to derive one
// piece of React state from another (here: "reset local edit buffer
// whenever selectedUserId changes") causes an extra, avoidable render
// pass and a brief flicker of the PREVIOUS user's data against the NEW
// user's name — remounting via key sidesteps this by construction: a
// fresh mount's initial useState value is correct from its very first
// render, since it's computed from props already available at mount
// time, not synchronized in afterward.
//
// Week 8, Thursday — responsive fix: the permission editor grid below
// (1fr repeat(3, minmax(120px, 1fr))) had no breakpoint AND no
// overflow-x fallback — unlike its sibling page RolesPermissions.jsx,
// which already wraps its own matrix in overflowX: auto. Since body has
// overflow-x: hidden set globally, that gap meant the Override/Effective
// columns could be genuinely clipped and unreachable on a narrow phone,
// not just cramped. Now wrapped the same way RolesPermissions.jsx
// already does it, with a matching minWidth so the scroll region has a
// stable floor.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ShieldCheck,
  Info,
  Save,
  Undo2,
  RotateCcw,
  Lock,
  Eye,
} from "lucide-react";
import { FormField as Field, FormSelect } from "../../components/common";
import Abbr from "../../components/common/Abbr/Abbr";
import { useUsers } from "../../context/UsersContext";
import {
  MODULES,
  PERMISSION_LEVELS,
  PERMISSION_LEVEL_CONFIG,
} from "./userData";

const getInitials = (name) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// "Inherit" is a UI-only concept — it's never actually stored as a value.
// Choosing it locally deletes that module's key from the staged override
// object, which is exactly what "use the role default" means.
const OVERRIDE_ORDER = ["Inherit", ...PERMISSION_LEVELS];

const overrideCellVisual = (label) => {
  if (label === "Inherit") return { bg: "#f8fafc", color: "#94a3b8" };
  const cfg = PERMISSION_LEVEL_CONFIG[label];
  return { bg: cfg.bg, color: cfg.color };
};

// Everything below was previously inline in the parent, with a useEffect
// resetting its local state on user change. Extracted so `key={user.id}`
// on this component (see UserPermissions below) can do that reset
// correctly via a remount instead.
const UserPermissionEditor = ({
  user,
  permissions,
  committedOverrides,
  onSave,
}) => {
  const [localOverrides, setLocalOverrides] = useState(committedOverrides);
  const isDirty =
    JSON.stringify(localOverrides) !== JSON.stringify(committedOverrides);
  const isAdmin = user.role === "Administrator";

  const cycleOverride = (moduleName) => {
    if (isAdmin) return;
    setLocalOverrides((prev) => {
      const current = prev[moduleName] ?? "Inherit";
      const idx = OVERRIDE_ORDER.indexOf(current);
      const next = OVERRIDE_ORDER[(idx + 1) % OVERRIDE_ORDER.length];
      const updated = { ...prev };
      if (next === "Inherit") delete updated[moduleName];
      else updated[moduleName] = next;
      return updated;
    });
  };

  const handleSave = () => {
    onSave(user.id, localOverrides);
    toast.success("Permissions updated", {
      description: `${user.fullName}'s overrides have been saved.`,
    });
  };
  const handleDiscard = () => setLocalOverrides(committedOverrides);
  const handleClearAll = () => setLocalOverrides({});

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid var(--hms-border)",
        boxShadow: "var(--shadow-xs)",
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: "1.25rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--hms-border)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff" }}>
            {getInitials(user.fullName)}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
            }}
          >
            {user.fullName}
          </p>
          <p
            style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}
          >
            {user.role} · {user.department}
          </p>
        </div>
        {isAdmin && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 11px",
              borderRadius: 20,
              background: "var(--hms-success-bg)",
              color: "var(--hms-success)",
              fontSize: "0.72rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <Lock size={11} /> Always Full Access
          </span>
        )}
      </div>

      {isAdmin && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "#94a3b8",
            margin: "0 0 1rem",
            fontStyle: "italic",
          }}
        >
          Administrators have Full Access everywhere by role default — overrides
          would have no effect and are disabled below.
        </p>
      )}

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr repeat(3, minmax(120px, 1fr))",
            minWidth: 520,
            gap: 8,
            marginBottom: "1rem",
          }}
        >
          <div />
          {["Role Default", "Override", "Effective"].map((h) => (
            <div
              key={h}
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                textAlign: "center",
              }}
            >
              {h}
            </div>
          ))}

          {MODULES.map((m) => {
            const roleDefault = permissions[user.role]?.[m] ?? "No Access";
            const overrideLabel = localOverrides[m] ?? "Inherit";
            const effective = localOverrides[m] ?? roleDefault;
            const roleDefaultCfg = PERMISSION_LEVEL_CONFIG[roleDefault];
            const effectiveCfg = PERMISSION_LEVEL_CONFIG[effective];
            const overrideVisual = overrideCellVisual(overrideLabel);

            return (
              <div key={m} style={{ display: "contents" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.6rem 0",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--hms-navy)",
                    }}
                  >
                    <Abbr underline={false}>{m}</Abbr>
                  </span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "0.6rem",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: roleDefaultCfg.bg,
                      color: roleDefaultCfg.color,
                    }}
                  >
                    {roleDefault}
                  </span>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "0.6rem",
                  }}
                >
                  {isAdmin ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        padding: "0.35rem",
                        borderRadius: 8,
                        background: "#f8fafc",
                        color: "#cbd5e1",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                      }}
                    >
                      <Lock size={10} /> Locked
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => cycleOverride(m)}
                      style={{
                        width: "100%",
                        padding: "0.4rem 0.4rem",
                        borderRadius: 8,
                        border: `1.5px dashed ${overrideLabel === "Inherit" ? "#cbd5e1" : "transparent"}`,
                        background: overrideVisual.bg,
                        color: overrideVisual.color,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {overrideLabel}
                    </button>
                  )}
                </div>
                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "0.6rem",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      background: effectiveCfg.bg,
                      color: effectiveCfg.color,
                    }}
                  >
                    {effective}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isAdmin && (
        <button
          type="button"
          disabled={Object.keys(localOverrides).length === 0}
          onClick={handleClearAll}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0.45rem 0.8rem",
            border: "1.5px solid var(--hms-border)",
            borderRadius: 9,
            background: "#fff",
            color:
              Object.keys(localOverrides).length === 0 ? "#cbd5e1" : "#64748b",
            cursor:
              Object.keys(localOverrides).length === 0
                ? "not-allowed"
                : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          <RotateCcw size={13} /> Clear All Overrides
        </button>
      )}

      {isDirty && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginTop: "1rem",
            padding: "0.875rem 1.125rem",
            borderRadius: 11,
            background: "#fffbeb",
            border: "1.5px solid rgba(217,119,6,0.25)",
          }}
        >
          <span
            style={{ fontSize: "0.82rem", color: "#92400e", fontWeight: 600 }}
          >
            Unsaved changes to {user.fullName}'s permissions.
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
  );
};

const UserPermissions = () => {
  const { users, permissions, permissionOverrides, setUserOverrides } =
    useUsers();
  const { control, setValue } = useForm({ defaultValues: { userId: "" } });
  const selectedUserId = useWatch({ control, name: "userId" });
  const selectedUser = users.find((u) => u.id === selectedUserId) || null;

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.fullName} — ${u.role} · ${u.department}`,
  }));

  const usersWithOverrides = Object.entries(permissionOverrides)
    .map(([userId, overrides]) => ({
      user: users.find((u) => u.id === userId),
      overrides,
    }))
    .filter((entry) => entry.user);

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
          User Permissions
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
          This page manages <strong>exceptions for one specific person</strong>,
          layered on top of their role's default access. To change what an
          entire role can access by default, use{" "}
          <Link
            to="/users/roles"
            style={{ color: "var(--hms-blue)", fontWeight: 700 }}
          >
            Roles & Permissions
          </Link>
          .
        </p>
      </div>

      {/* ── User picker ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <Field label="Select User" hint="Search by name, role, or department">
          <FormSelect
            name="userId"
            control={control}
            options={userOptions}
            placeholder="Search users..."
            isSearchable
          />
        </Field>
      </div>

      {!selectedUser ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            padding: "2.5rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Search and select a user above to view or override their
            permissions.
          </p>
        </div>
      ) : (
        // key={selectedUser.id} forces a fresh mount of the editor
        // whenever the selected user changes — this is what correctly
        // resets its internal localOverrides state to the newly-picked
        // user's committed overrides, with zero useEffect and zero
        // extra render pass.
        <UserPermissionEditor
          key={selectedUser.id}
          user={selectedUser}
          permissions={permissions}
          committedOverrides={permissionOverrides[selectedUser.id] ?? {}}
          onSave={setUserOverrides}
        />
      )}

      {/* ── Users With Active Overrides ── */}
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          fontWeight: 800,
          color: "var(--hms-navy)",
          margin: "0 0 0.875rem",
        }}
      >
        Users With Active Overrides
      </h2>
      {usersWithOverrides.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              margin: 0,
              fontWeight: 500,
            }}
          >
            No users currently have permission overrides.
          </p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
        >
          {usersWithOverrides.map(({ user, overrides }) => (
            <div
              key={user.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid var(--hms-border)",
                padding: "0.875rem 1.125rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--hms-navy)",
                  }}
                >
                  {user.fullName}{" "}
                  <span style={{ fontWeight: 500, color: "#94a3b8" }}>
                    · {user.role}
                  </span>
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 5,
                  }}
                >
                  {Object.entries(overrides).map(([m, level]) => {
                    const cfg = PERMISSION_LEVEL_CONFIG[level];
                    return (
                      <span
                        key={m}
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: cfg.bg,
                          color: cfg.color,
                        }}
                      >
                        {m}: {level}
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValue("userId", user.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0.4rem 0.75rem",
                  border: "1.5px solid var(--hms-border)",
                  borderRadius: 8,
                  background: "#fff",
                  color: "#64748b",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <Eye size={13} /> View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPermissions;
