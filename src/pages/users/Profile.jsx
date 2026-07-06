// ─────────────────────────────────────────────────────────────────────────────
// Profile.jsx — Week 6, Friday
//
// Self-service: the logged-in person viewing/editing THEIR OWN account —
// distinct in kind from Mon-Thu's admin-facing pages managing OTHER
// users. Editable fields deliberately exclude Role and Status — those
// are administrative decisions about a person, not decisions a person
// should make about themselves.
//
// STAND-IN NOTE: this project has no real authentication/session system
// yet (Login.jsx's submit is cosmetic — any input navigates straight to
// the dashboard), so there is no real "currently logged in user"
// anywhere in app state. This page treats the first Administrator in the
// seed list as a placeholder "current user" — flagged explicitly here,
// the same way every other scope boundary in this project has been,
// rather than silently faking a session or skipping the page entirely.
// Replacing this with a real session lookup is future work once
// authentication exists.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  UserCircle2,
  Building2,
  Calendar,
  Clock,
  KeyRound,
  Save,
  Info,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
} from "../../components/common";
import { useUsers } from "../../context/UsersContext";
import { ROLE_CONFIG, USER_STATUS_CONFIG } from "./userData";
import { profileSchema, changePasswordSchema } from "./userSchema";

const getInitials = (name) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Profile = () => {
  const { users, updateUser } = useUsers();
  // STAND-IN "current user" — see file header. Real session lookup once
  // authentication exists.
  const currentUser = users.find((u) => u.role === "Administrator") ?? users[0];

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    // Same duplicate-email guard already used in AddUser.jsx and
    // UserDirectory.jsx's EditDrawer — missing here until now, a real,
    // inconsistent gap: editing your own profile to an email already
    // used by someone else went completely unvalidated. Self-excluded
    // via `u.id !== currentUser.id`, or saving your OWN unchanged email
    // would falsely flag itself as "already taken."
    resolver: async (values, context, options) => {
      const result = await zodResolver(profileSchema)(values, context, options);
      if (Object.keys(result.errors).length === 0) {
        const emailTaken = users.some(
          (u) =>
            u.id !== currentUser.id &&
            u.email.trim().toLowerCase() === values.email.trim().toLowerCase(),
        );
        if (emailTaken) {
          return {
            values: {},
            errors: {
              email: {
                type: "manual",
                message: "This email is already registered to another user",
              },
            },
          };
        }
      }
      return result;
    },
    defaultValues: {
      fullName: currentUser.fullName,
      email: currentUser.email,
      phone: currentUser.phone,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const submitProfile = async (data) => {
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 500));
    updateUser({ ...currentUser, ...data });
    setSavingProfile(false);
    toast.success("Profile updated", {
      description: "Your details have been saved.",
    });
  };

  // No real backend/auth exists to actually verify or change a password
  // against — this simulates the flow's UX (validation, loading state,
  // success feedback) without pretending to persist a credential nowhere
  // else in the app can check.
  const submitPassword = async () => {
    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingPassword(false);
    resetPassword({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast.success("Password changed", {
      description: "Your password has been updated.",
    });
  };

  const roleCfg = ROLE_CONFIG[currentUser.role] || {};
  const statusCfg = USER_STATUS_CONFIG[currentUser.status] || {};

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
            <UserCircle2 size={14} style={{ color: "var(--hms-blue)" }} />
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
          My Profile
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
          This project doesn't yet have a real login session, so this page shows
          a placeholder account (<strong>{currentUser.fullName}</strong>)
          standing in for "whoever is currently logged in." This will connect to
          a real signed-in user once authentication is built.
        </p>
      </div>

      {/* ── Identity card ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>
            {getInitials(currentUser.fullName)}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
            }}
          >
            {currentUser.fullName}
          </p>
          <p
            style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#94a3b8" }}
          >
            {currentUser.id}
          </p>
          <div
            style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}
          >
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                background: roleCfg.bg,
                color: roleCfg.color,
              }}
            >
              {currentUser.role}
            </span>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
                background: statusCfg.bg,
                color: statusCfg.color,
              }}
            >
              {currentUser.status}
            </span>
          </div>
        </div>
      </div>

      {/* ── Editable profile ── */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
            }}
          >
            Personal Information
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Field
              label="Full Name"
              required
              error={profileErrors.fullName?.message}
            >
              <Input
                {...registerProfile("fullName")}
                error={profileErrors.fullName}
              />
            </Field>
            <Field label="Email" required error={profileErrors.email?.message}>
              <Input
                {...registerProfile("email")}
                type="email"
                error={profileErrors.email}
              />
            </Field>
            <Field label="Phone" required error={profileErrors.phone?.message}>
              <Input
                {...registerProfile("phone")}
                type="tel"
                maxLength={10}
                error={profileErrors.phone}
              />
            </Field>
          </div>

          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.125rem",
              borderTop: "1px solid var(--hms-border)",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Building2 size={15} style={{ color: "#94a3b8" }} />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                  }}
                >
                  Department
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--hms-navy)",
                  }}
                >
                  {currentUser.department}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Calendar size={15} style={{ color: "#94a3b8" }} />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                  }}
                >
                  Joined On
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--hms-navy)",
                  }}
                >
                  {dayjs(currentUser.joinedOn).format("D MMM YYYY")}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Clock size={15} style={{ color: "#94a3b8" }} />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                  }}
                >
                  Last Login
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--hms-navy)",
                  }}
                >
                  {currentUser.lastLogin
                    ? dayjs(currentUser.lastLogin).fromNow()
                    : "Never logged in"}
                </p>
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: "0.74rem",
              color: "#94a3b8",
              margin: "0.875rem 0 0",
              fontStyle: "italic",
            }}
          >
            Department, Role, and Status are managed by an administrator and
            can't be changed here.
          </p>

          <button
            type="button"
            disabled={savingProfile}
            onClick={handleProfileSubmit(submitProfile)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: "1.25rem",
              padding: "0.65rem 1.25rem",
              border: "none",
              borderRadius: 11,
              background: savingProfile ? "#94a3b8" : "var(--hms-blue)",
              color: "#fff",
              cursor: savingProfile ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 700,
              boxShadow: savingProfile
                ? "none"
                : "0 4px 12px rgba(37,99,235,0.3)",
            }}
          >
            <Save size={16} /> {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* ── Change password ── */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <KeyRound size={16} style={{ color: "var(--hms-blue)" }} /> Change
            Password
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Field
              label="Current Password"
              required
              error={passwordErrors.currentPassword?.message}
            >
              <Input
                {...registerPassword("currentPassword")}
                type="password"
                error={passwordErrors.currentPassword}
              />
            </Field>
            <Field
              label="New Password"
              required
              error={passwordErrors.newPassword?.message}
              hint="At least 8 characters"
            >
              <Input
                {...registerPassword("newPassword")}
                type="password"
                error={passwordErrors.newPassword}
              />
            </Field>
            <Field
              label="Confirm New Password"
              required
              error={passwordErrors.confirmPassword?.message}
            >
              <Input
                {...registerPassword("confirmPassword")}
                type="password"
                error={passwordErrors.confirmPassword}
              />
            </Field>
          </div>

          <button
            type="button"
            disabled={savingPassword}
            onClick={handlePasswordSubmit(submitPassword)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: "1.25rem",
              padding: "0.65rem 1.25rem",
              border: "1.5px solid var(--hms-border)",
              borderRadius: 11,
              background: "#fff",
              color: savingPassword ? "#94a3b8" : "var(--hms-navy)",
              cursor: savingPassword ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 700,
            }}
          >
            <KeyRound size={16} />{" "}
            {savingPassword ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
