import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Popover from "@radix-ui/react-popover";
import { useNotifications } from "../context/NotificationsContext";
import CommandPalette from "../components/common/CommandPalette/CommandPalette";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Menu,
  Settings,
  CalendarDays,
} from "lucide-react";

const Header = ({
  onMobileMenuClick,
  onOpenNotifications,
  onOpenCalendar,
  paletteOpen,
  onPaletteOpenChange,
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const closeAll = () => setShowProfile(false);

  return (
    <>
      <style>{`
        @keyframes hdrSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hdr-drop { animation: hdrSlide 0.18s ease both; }

        .hdr-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 9px;
          border: none; cursor: pointer; background: transparent;
          color: #4a5568; transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .hdr-btn:hover { background: #eef2f8; color: #0f172a; }

        /* Desktop search bar */
        .hdr-search-desktop {
          display: flex; align-items: center; gap: 10px;
          flex: 1;
          padding: 0.5rem 0.625rem 0.5rem 0.75rem;
          background: var(--hms-surface);
          border: 1.5px solid var(--hms-border);
          border-radius: 10px;
          font-size: 0.825rem; font-family: var(--font-body);
          color: #94a3b8; cursor: pointer; text-align: left;
          transition: border-color 0.2s, background 0.2s;
        }
        .hdr-search-desktop:hover { border-color: var(--hms-blue); background: #fff; }
        .hdr-search-label {
          flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
        }
        .hdr-kbd {
          font-size: 0.68rem; font-weight: 700; color: #94a3b8;
          border: 1px solid var(--hms-border); border-radius: 6px;
          padding: 2px 6px; background: #fff; flex-shrink: 0;
        }

        /* Mobile search */
        .hdr-search-mobile { display: none; }
        @media (max-width: 767px) {
          .hdr-search-desktop { display: none !important; }
          .hdr-search-mobile  { display: flex !important; }
        }

        /* Popover animation */
        .hms-popover-content[data-state="open"] { animation: hmsPopIn 0.15s ease-out; }
        @keyframes hmsPopIn {
          from { opacity: 0; transform: scale(0.97) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }

        .hdr-profile {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 8px 4px 4px;
          border-radius: 10px; border: 1.5px solid transparent;
          cursor: pointer; background: transparent;
          font-family: var(--font-body); transition: all 0.15s;
        }
        .hdr-profile:hover { background: #eef2f8; border-color: var(--hms-border); }
      `}</style>

      <header
        className="hms-header"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: 64,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          padding: "0 1.25rem",
          gap: "0.625rem",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--hms-border)",
          boxShadow: "0 1px 0 rgba(15,23,42,0.05)",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Hamburger — mobile only */}
        <button
          className="hms-hamburger hdr-btn"
          onClick={onMobileMenuClick}
          style={{ display: "none" }}
        >
          <Menu size={20} />
        </button>

        {/* Search with Popover */}
        <Popover.Root open={paletteOpen} onOpenChange={onPaletteOpenChange}>
          <Popover.Anchor asChild>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                minWidth: 0,
              }}
            >
              <button
                className="hdr-search-desktop"
                onClick={() => onPaletteOpenChange(true)}
                style={{ maxWidth: 380 }}
              >
                <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                <span className="hdr-search-label">
                  Search patients, doctors, medicines...
                </span>
                <kbd className="hdr-kbd">Ctrl K</kbd>
              </button>

              <button
                className="hdr-search-mobile hdr-btn"
                onClick={() => onPaletteOpenChange(true)}
              >
                <Search size={18} />
              </button>
            </div>
          </Popover.Anchor>

          <Popover.Portal>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={10}
              avoidCollisions={false}
              className="hms-popover-content"
              style={{
                width: "min(92vw, 480px)",
                background: "#fff",
                borderRadius: 16,
                border: "1px solid var(--hms-border)",
                boxShadow: "var(--shadow-xl)",
                overflow: "hidden",
                zIndex: 999,
              }}
            >
              <CommandPalette
                onOpenChange={onPaletteOpenChange}
                onOpenNotifications={onOpenNotifications}
                onOpenCalendar={onOpenCalendar}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <div style={{ flex: 1 }} />

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            className="hdr-btn"
            style={{ position: "relative" }}
            onClick={onOpenNotifications}
            title="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <motion.span
                key={unreadCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #fff",
                  display: "block",
                }}
              />
            )}
          </button>

          <button
            className="hdr-btn"
            onClick={onOpenCalendar}
            title="Appointment calendar"
          >
            <CalendarDays size={18} />
          </button>

          <div style={{ position: "relative" }}>
            {showProfile && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 998 }}
                onPointerDown={() => setShowProfile(false)}
                aria-hidden="true"
              />
            )}
            <button
              className="hdr-profile"
              onClick={() => setShowProfile((s) => !s)}
              style={{
                borderColor: showProfile ? "var(--hms-border)" : "transparent",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  flexShrink: 0,
                  background:
                    "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  AU
                </span>
              </div>

              <div className="hidden sm:block" style={{ textAlign: "left" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.825rem",
                    fontWeight: 700,
                    color: "var(--hms-navy)",
                    lineHeight: 1.2,
                  }}
                >
                  Admin User
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.67rem",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={13}
                className="hidden sm:block"
                style={{
                  color: "#94a3b8",
                  transition: "transform 0.2s",
                  transform: showProfile ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {showProfile && (
              <div
                className="hdr-drop"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: 200,
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid var(--hms-border)",
                  boxShadow: "var(--shadow-xl)",
                  padding: "0.375rem",
                  zIndex: 999,
                }}
              >
                {[
                  { Icon: User, label: "My Profile", to: "/users/profile" },
                  { Icon: Settings, label: "Settings", to: "/users/settings" },
                ].map(({ Icon, label, to }) => (
                  <button
                    key={label}
                    onClick={() => {
                      navigate(to);
                      closeAll();
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "0.575rem 0.75rem",
                      borderRadius: 9,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "var(--hms-navy)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--hms-surface)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Icon size={14} style={{ color: "#64748b" }} /> {label}
                  </button>
                ))}

                <div
                  style={{
                    height: 1,
                    background: "var(--hms-border)",
                    margin: "0.375rem 0",
                  }}
                />

                <button
                  onClick={() => {
                    navigate("/login");
                    closeAll();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "0.575rem 0.75rem",
                    borderRadius: 9,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: "var(--hms-danger)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--hms-danger-bg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
