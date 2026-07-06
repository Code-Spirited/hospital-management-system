// ─────────────────────────────────────────────────────────────────────────────
// Users.jsx — Week 6, Monday
// Module shell mirroring OPD.jsx/IPD.jsx/Pharmacy.jsx: a tab bar above an
// Outlet. Only "Directory" exists today — Add/Edit User arrives
// tomorrow, growing this tab bar the same way every other module's has.
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, Outlet } from "react-router-dom";
import { UserCog, UserPlus, ShieldCheck, KeyRound } from "lucide-react";

const TABS = [
  { label: "Directory", to: "/users", end: true, Icon: UserCog },
  { label: "Add User", to: "/users/add", end: false, Icon: UserPlus },
  {
    label: "Roles & Permissions",
    to: "/users/roles",
    end: false,
    Icon: ShieldCheck,
  },
  {
    label: "User Permissions",
    to: "/users/permissions",
    end: false,
    Icon: KeyRound,
  },
];

const Users = () => (
  <div style={{ fontFamily: "var(--font-body)" }}>
    <style>{`
      .users-tabs {
        display: flex; gap: 4px; margin-bottom: 1.25rem;
        border-bottom: 1px solid var(--hms-border); overflow-x: auto;
      }
      .users-tab {
        display: flex; align-items: center; gap: 7px;
        padding: 0.7rem 1rem; border: none; background: transparent;
        cursor: pointer; font-family: var(--font-body); font-size: 0.85rem;
        font-weight: 600; color: #64748b; white-space: nowrap;
        text-decoration: none;
        border-bottom: 2.5px solid transparent; margin-bottom: -1px;
        transition: color 0.15s, border-color 0.15s;
      }
      .users-tab:hover { color: var(--hms-blue); }
      .users-tab.active { color: var(--hms-blue); border-bottom-color: var(--hms-blue); font-weight: 700; }
    `}</style>

    <nav className="users-tabs">
      {TABS.map(({ label, to, end, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `users-tab${isActive ? " active" : ""}`}
        >
          <Icon size={15} /> {label}
        </NavLink>
      ))}
    </nav>

    <Outlet />
  </div>
);

export default Users;
