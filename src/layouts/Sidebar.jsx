import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  Pill,
  UserCog,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  Activity,
} from "lucide-react";
import Abbr from "../components/common/Abbr/Abbr";

// Static menu data
const MENU = [
  { label: "Dashboard", Icon: LayoutDashboard, path: "/dashboard" },
  { label: "OPD", Icon: Users, path: "/opd" },
  { label: "IPD", Icon: BedDouble, path: "/ipd" },
  { label: "Pharmacy", Icon: Pill, path: "/pharmacy" },
  { label: "Users", Icon: UserCog, path: "/users" },
  { label: "Reports", Icon: BarChart3, path: "/reports" },
];

// Brand logo block
const Brand = ({ showLabel }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        flexShrink: 0,
        background: "linear-gradient(135deg, #2563eb, #3b82f6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(37,99,235,0.5)",
      }}
    >
      <Activity size={19} color="#fff" strokeWidth={2.5} />
    </div>
    {showLabel && (
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "0.95rem",
            color: "#ffffff",
            lineHeight: 1.15,
          }}
        >
          Auctech
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.58rem",
            fontWeight: 700,
            color: "#4a7a9b",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          HMS Platform
        </p>
      </div>
    )}
  </div>
);

// Navigation list
const NavList = ({ currentPath, onNavigate, showLabels, onItemClick }) => (
  <nav style={{ flex: 1, padding: "0.875rem 0.625rem", overflowY: "auto" }}>
    {showLabels && (
      <p
        style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--sidebar-label)",
          padding: "0 0.75rem",
          marginBottom: "0.375rem",
        }}
      >
        Main Menu
      </p>
    )}

    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {MENU.map(({ label, Icon, path }) => {
        const active =
          currentPath === path || currentPath.startsWith(path + "/");
        return (
          <li key={path}>
            <button
              onClick={() => {
                onNavigate(path);
                if (onItemClick) onItemClick();
              }}
              title={!showLabels ? label : undefined}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: showLabels ? "0.65rem 0.875rem" : "0.75rem",
                justifyContent: showLabels ? "flex-start" : "center",
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: active ? 700 : 500,
                letterSpacing: active ? "0.005em" : "0.01em",
                transition: "all 0.18s ease",
                background: active
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                  : "transparent",
                color: active
                  ? "var(--sidebar-text-active)"
                  : "var(--sidebar-text)",
                boxShadow: active
                  ? "0 4px 14px var(--sidebar-active-glow)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--sidebar-hover-bg)";
                  e.currentTarget.style.color = "var(--sidebar-text-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--sidebar-text)";
                }
              }}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.3 : 1.8}
                style={{
                  flexShrink: 0,
                  color: active ? "#ffffff" : "var(--sidebar-icon)",
                }}
              />
              {showLabels && (
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Abbr underline={false}>{label}</Abbr>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);

// Status footer
const SidebarFooter = ({ showLabel }) => (
  <div
    style={{
      padding: showLabel ? "0.75rem 1.25rem" : "0.75rem",
      borderTop: "1px solid var(--sidebar-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: showLabel ? "space-between" : "center",
      gap: 8,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          boxShadow: "0 0 8px rgba(34,197,94,0.7)",
          animation: "sb-pulse 2s ease infinite",
        }}
      />
      {showLabel && (
        <span style={{ fontSize: "0.7rem", color: "#3d6b8f", fontWeight: 600 }}>
          All systems live
        </span>
      )}
    </div>
    {showLabel && (
      <span
        style={{
          fontSize: "0.62rem",
          color: "#2d4f6b",
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        v1.0.0
      </span>
    )}
  </div>
);

// Shared sidebar panel background style
const PANEL = {
  background: "linear-gradient(180deg, #0b1526 0%, #0d1c32 50%, #0b1526 100%)",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  flexDirection: "column",
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
};

// MAIN COMPONENT
const Sidebar = ({ isOpen, onToggle, mobileOpen, onMobileClose }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes sb-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sb-pulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.3; }
        }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <aside
        className="hms-desktop-sidebar"
        style={{
          ...PANEL,
          display: "flex",
          width: isOpen ? 256 : 64,
          zIndex: 40,
          transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Header row */}
        {isOpen ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.875rem 0.875rem 0.875rem 1.125rem",
              borderBottom: "1px solid var(--sidebar-border)",
              minHeight: 64,
              gap: 8,
            }}
          >
            <Brand showLabel={true} />
            <button
              onClick={onToggle}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                flexShrink: 0,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                cursor: "pointer",
                color: "#4a7a9b",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "#4a7a9b";
              }}
            >
              <ChevronLeft size={15} />
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 0",
              gap: 6,
              borderBottom: "1px solid var(--sidebar-border)",
              minHeight: 64,
            }}
          >
            <Brand showLabel={false} />

            <button
              onClick={onToggle}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 7,
                cursor: "pointer",
                color: "#4a7a9b",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "#4a7a9b";
              }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        <NavList
          currentPath={pathname}
          onNavigate={navigate}
          showLabels={isOpen}
        />

        <SidebarFooter showLabel={isOpen} />
      </aside>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="hms-mobile-backdrop"
          onClick={onMobileClose}
          style={{
            display: "block",
            position: "fixed",
            inset: 0,
            background: "rgba(11,21,38,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 45,
            animation: "sb-fade 0.2s ease both",
          }}
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        className="hms-mobile-sidebar"
        style={{
          ...PANEL,
          display: "flex",
          width: 272,
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Mobile header with close button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.875rem 0.875rem 0.875rem 1.125rem",
            borderBottom: "1px solid var(--sidebar-border)",
            minHeight: 64,
          }}
        >
          <Brand showLabel={true} />
          <button
            onClick={onMobileClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              cursor: "pointer",
              color: "#a8c4e0",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <NavList
          currentPath={pathname}
          onNavigate={navigate}
          showLabels={true}
          onItemClick={onMobileClose}
        />

        <SidebarFooter showLabel={true} />
      </aside>
    </>
  );
};

export default Sidebar;
