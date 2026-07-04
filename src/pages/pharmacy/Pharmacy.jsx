// ─────────────────────────────────────────────────────────────────────────────
// Pharmacy.jsx — Week 5, Monday
// Module shell mirroring OPD.jsx/IPD.jsx: a tab bar above an Outlet. Only
// "Inventory" exists today; Add Medicine, Purchase Entry, Sales Billing,
// Stock Management, and Expiry Alerts tabs are added incrementally across
// the week as each page is built, the exact same pattern IPD's tab bar
// grew through Week 4.
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, Outlet } from "react-router-dom";
import {
  Pill,
  PlusCircle,
  Truck,
  ShoppingCart,
  ClipboardEdit,
} from "lucide-react";

const TABS = [
  { label: "Inventory", to: "/pharmacy", end: true, Icon: Pill },
  { label: "Add Medicine", to: "/pharmacy/add", end: false, Icon: PlusCircle },
  {
    label: "Purchase Entry",
    to: "/pharmacy/purchase",
    end: false,
    Icon: Truck,
  },
  {
    label: "Sales Billing",
    to: "/pharmacy/sell",
    end: false,
    Icon: ShoppingCart,
  },
  {
    label: "Stock Management",
    to: "/pharmacy/stock",
    end: false,
    Icon: ClipboardEdit,
  },
];

const Pharmacy = () => (
  <div style={{ fontFamily: "var(--font-body)" }}>
    <style>{`
      .pharm-tabs {
        display: flex; gap: 4px; margin-bottom: 1.25rem;
        border-bottom: 1px solid var(--hms-border); overflow-x: auto;
      }
      .pharm-tab {
        display: flex; align-items: center; gap: 7px;
        padding: 0.7rem 1rem; border: none; background: transparent;
        cursor: pointer; font-family: var(--font-body); font-size: 0.85rem;
        font-weight: 600; color: #64748b; white-space: nowrap;
        text-decoration: none;
        border-bottom: 2.5px solid transparent; margin-bottom: -1px;
        transition: color 0.15s, border-color 0.15s;
      }
      .pharm-tab:hover { color: var(--hms-blue); }
      .pharm-tab.active { color: var(--hms-blue); border-bottom-color: var(--hms-blue); font-weight: 700; }
    `}</style>

    <nav className="pharm-tabs">
      {TABS.map(({ label, to, end, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `pharm-tab${isActive ? " active" : ""}`}
        >
          <Icon size={15} /> {label}
        </NavLink>
      ))}
    </nav>

    <Outlet />
  </div>
);

export default Pharmacy;
