// ─────────────────────────────────────────────────────────────────────────────
// IPD.jsx — Week 4, Monday
// Module container for IPD, mirroring OPD's shell: a persistent tab bar
// above an Outlet. Only "Admissions" and "New Admission" exist today;
// Ward, Bed, Treatment, Discharge, and Billing tabs are added as each is
// built (Week 4, Tuesday–Saturday), the same way OPD's tab bar grew
// across Week 3.
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, Outlet } from "react-router-dom";
import { BedDouble, ClipboardPlus, LayoutGrid } from "lucide-react";

const TABS = [
  { label: "Admissions", to: "/ipd", end: true, Icon: BedDouble },
  { label: "New Admission", to: "/ipd/admit", end: false, Icon: ClipboardPlus },
  { label: "Ward Management", to: "/ipd/wards", end: false, Icon: LayoutGrid },
];

const IPD = () => (
  <div style={{ fontFamily: "var(--font-body)" }}>
    <style>{`
      .ipd-tabs {
        display: flex; gap: 4px; margin-bottom: 1.25rem;
        border-bottom: 1px solid var(--hms-border); overflow-x: auto;
      }
      .ipd-tab {
        display: flex; align-items: center; gap: 7px;
        padding: 0.7rem 1rem; border: none; background: transparent;
        cursor: pointer; font-family: var(--font-body); font-size: 0.85rem;
        font-weight: 600; color: #64748b; white-space: nowrap;
        text-decoration: none;
        border-bottom: 2.5px solid transparent; margin-bottom: -1px;
        transition: color 0.15s, border-color 0.15s;
      }
      .ipd-tab:hover { color: var(--hms-blue); }
      .ipd-tab.active { color: var(--hms-blue); border-bottom-color: var(--hms-blue); font-weight: 700; }
    `}</style>

    <nav className="ipd-tabs">
      {TABS.map(({ label, to, end, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `ipd-tab${isActive ? " active" : ""}`}
        >
          <Icon size={15} /> {label}
        </NavLink>
      ))}
    </nav>

    <Outlet />
  </div>
);

export default IPD;
