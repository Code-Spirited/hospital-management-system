// ─────────────────────────────────────────────────────────────────────────────
// OPD.jsx
//
// OPD module container. Renders child routes via <Outlet />.
// Week 3 Mon  → /opd/register (PatientRegistration)
// Week 3 Tue  → /opd          (PatientList — built tomorrow)
// Week 3 Wed  → /opd/appointments
// ─────────────────────────────────────────────────────────────────────────────

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { UserPlus, Users, ClipboardList } from "lucide-react";

const OPD = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { label: "Patient List", path: "/opd", Icon: Users },
    { label: "Register Patient", path: "/opd/register", Icon: UserPlus },
    { label: "Appointments", path: "/opd/appointments", Icon: ClipboardList },
  ];

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* Module-level tab navigation — stays visible across all OPD subroutes */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: "1.5rem",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid var(--hms-border)",
          padding: "0.375rem",
          boxShadow: "var(--shadow-xs)",
          overflowX: "auto",
        }}
      >
        {tabs.map(({ label, path, Icon }) => {
          const active =
            pathname === path || (path !== "/opd" && pathname.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0.5rem 1rem",
                borderRadius: 10,
                border: "none",
                background: active ? "var(--hms-blue)" : "transparent",
                color: active ? "#fff" : "#64748b",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.825rem",
                fontWeight: active ? 700 : 600,
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                boxShadow: active ? "0 4px 10px rgba(37,99,235,0.25)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.background = "var(--hms-surface)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Current subroute renders here */}
      <Outlet />
    </div>
  );
};

export default OPD;
