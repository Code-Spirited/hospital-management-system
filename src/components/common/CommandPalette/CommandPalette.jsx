// ─────────────────────────────────────────────────────────────────────────────
// CommandPalette.jsx
//
// The searchable content shown inside the header's search popover (see
// Header.jsx, which wraps this in a Radix Popover anchored to the search
// bar). This file only renders the Command/Input/List tree — positioning,
// the anchored-dropdown behavior, and outside-click dismissal are handled
// by that surrounding Popover, not here.
//
// Built on `cmdk` — the command-menu engine behind Linear, Vercel, and
// Raycast's web app — for fuzzy filtering, keyboard navigation, and focus
// management.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Users,
  BedDouble,
  Pill,
  UserCog,
  BarChart3,
  User2,
  ArrowRight,
  Bell,
  CalendarDays,
} from "lucide-react";
import { allPatients } from "../../../pages/dashboard/dashboardData";

const PAGES = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "OPD", path: "/opd", Icon: Users },
  { label: "IPD", path: "/ipd", Icon: BedDouble },
  { label: "Pharmacy", path: "/pharmacy", Icon: Pill },
  { label: "Users", path: "/users", Icon: UserCog },
  { label: "Reports", path: "/reports", Icon: BarChart3 },
];

const itemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0.625rem 0.75rem",
  borderRadius: 10,
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--hms-navy)",
  cursor: "pointer",
};

const CommandPalette = ({
  onOpenChange,
  onOpenNotifications,
  onOpenCalendar,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const go = (path) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <>
      <style>{`
        [cmdk-group-heading] {
          font-size: 0.66rem; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 0.625rem 0.75rem 0.3rem;
        }
        [cmdk-item] { transition: background 0.1s; }
        [cmdk-item][data-selected="true"] { background: var(--hms-sky); }
      `}</style>

      <Command
        shouldFilter
        loop
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0.875rem 1.125rem",
            borderBottom: "1px solid var(--hms-border)",
          }}
        >
          <Search size={17} style={{ color: "#94a3b8", flexShrink: 0 }} />
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Search patients, pages, or actions..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.925rem",
              fontFamily: "var(--font-body)",
              color: "var(--hms-navy)",
              background: "transparent",
            }}
          />
          <kbd
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#94a3b8",
              border: "1px solid var(--hms-border)",
              borderRadius: 6,
              padding: "2px 6px",
            }}
          >
            Esc
          </kbd>
        </div>

        <Command.List
          data-lenis-prevent
          style={{ maxHeight: "56vh", overflowY: "auto", padding: "0.5rem" }}
        >
          <Command.Empty
            style={{
              padding: "2rem 1rem",
              textAlign: "center",
              fontSize: "0.85rem",
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            No results found
          </Command.Empty>

          <Command.Group heading="Pages">
            {PAGES.map(({ label, path, Icon }) => (
              <Command.Item
                key={path}
                value={label}
                onSelect={() => go(path)}
                style={itemStyle}
              >
                <Icon size={16} style={{ color: "#64748b", flexShrink: 0 }} />
                {label}
                <ArrowRight
                  size={13}
                  style={{ marginLeft: "auto", color: "#cbd5e1" }}
                />
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Quick Actions">
            <Command.Item
              value="View notifications"
              onSelect={() => {
                onOpenChange(false);
                onOpenNotifications?.();
              }}
              style={itemStyle}
            >
              <Bell size={16} style={{ color: "#64748b" }} /> View notifications
            </Command.Item>
            <Command.Item
              value="Open appointment calendar"
              onSelect={() => {
                onOpenChange(false);
                onOpenCalendar?.();
              }}
              style={itemStyle}
            >
              <CalendarDays size={16} style={{ color: "#64748b" }} /> Open
              appointment calendar
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Patients">
            {allPatients.slice(0, 8).map((p) => (
              <Command.Item
                key={p.id}
                value={`${p.name} ${p.id}`}
                onSelect={() => go("/dashboard")}
                style={itemStyle}
              >
                <User2 size={16} style={{ color: "#64748b", flexShrink: 0 }} />
                <span>{p.name}</span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  {p.id}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </>
  );
};

export default CommandPalette;
