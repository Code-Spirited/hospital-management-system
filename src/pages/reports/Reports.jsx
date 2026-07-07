// ─────────────────────────────────────────────────────────────────────────────
// Reports.jsx — Week 7, Monday
// Module shell mirroring OPD.jsx/IPD.jsx/Pharmacy.jsx/Users.jsx: a tab bar
// above an Outlet. Only "OPD Reports" exists today — IPD/Pharmacy/Revenue
// Reports, Analytics Dashboard, and Export tabs are added incrementally
// across the week as each is built, the same pattern every other
// module's tab bar has grown by.
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, Outlet } from "react-router-dom";
import { FileBarChart } from "lucide-react";

const TABS = [
  { label: "OPD Reports", to: "/reports", end: true, Icon: FileBarChart },
];

const Reports = () => (
  <div style={{ fontFamily: "var(--font-body)" }}>
    <style>{`
      .reports-tabs {
        display: flex; gap: 4px; margin-bottom: 1.25rem;
        border-bottom: 1px solid var(--hms-border); overflow-x: auto;
      }
      .reports-tab {
        display: flex; align-items: center; gap: 7px;
        padding: 0.7rem 1rem; border: none; background: transparent;
        cursor: pointer; font-family: var(--font-body); font-size: 0.85rem;
        font-weight: 600; color: #64748b; white-space: nowrap;
        text-decoration: none;
        border-bottom: 2.5px solid transparent; margin-bottom: -1px;
        transition: color 0.15s, border-color 0.15s;
      }
      .reports-tab:hover { color: var(--hms-blue); }
      .reports-tab.active { color: var(--hms-blue); border-bottom-color: var(--hms-blue); font-weight: 700; }
    `}</style>

    <nav className="reports-tabs">
      {TABS.map(({ label, to, end, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `reports-tab${isActive ? " active" : ""}`
          }
        >
          <Icon size={15} /> {label}
        </NavLink>
      ))}
    </nav>

    <Outlet />
  </div>
);

export default Reports;
