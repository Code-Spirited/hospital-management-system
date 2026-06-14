// ─────────────────────────────────────────────────────────────────────────────
// Header.jsx
//
// RESPONSIVE BEHAVIOR:
//   Desktop (≥1024px):
//     - .hms-hamburger → display: none (CSS in index.css)
//     - .hms-header left offset → controlled by data-sidebar in index.css
//     - Brand breadcrumb and search bar visible
//
//   Mobile/Tablet (<1024px):
//     - .hms-hamburger → display: flex (CSS in index.css)
//     - .hms-header left: 0 (CSS in index.css)
//     - Brand breadcrumb hidden, search collapses to icon
//
// NO inline `left` property on the header element.
// That is handled entirely by CSS.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  Settings,
} from "lucide-react";

const Header = ({ onMobileMenuClick }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      text: "New patient — Ramesh Sharma registered",
      time: "2 min ago",
      unread: true,
      color: "#2563eb",
    },
    {
      id: 2,
      text: "Appointment #1042 confirmed",
      time: "15 min ago",
      unread: true,
      color: "#7c3aed",
    },
    {
      id: 3,
      text: "Paracetamol stock critically low",
      time: "1 hr ago",
      unread: false,
      color: "#d97706",
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;
  const closeAll = () => {
    setShowProfile(false);
    setShowNotifications(false);
  };

  return (
    <>
      <style>{`
        @keyframes hdrSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hdr-drop { animation: hdrSlide 0.18s ease both; }

        /* Icon button base style */
        .hdr-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #4a5568;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .hdr-btn:hover { background: #eef2f8; color: #0f172a; }

        /* Search input */
        .hdr-search {
          width: 100%;
          padding: 0.5rem 0.875rem 0.5rem 2.25rem;
          background: var(--hms-surface);
          border: 1.5px solid var(--hms-border);
          border-radius: 10px;
          font-size: 0.825rem;
          font-family: var(--font-body);
          color: var(--hms-navy);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .hdr-search::placeholder { color: #94a3b8; }
        .hdr-search:focus {
          border-color: var(--hms-blue);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
          background: #fff;
        }

        /* Profile button */
        .hdr-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px 4px 4px;
          border-radius: 10px;
          border: 1.5px solid transparent;
          cursor: pointer;
          background: transparent;
          font-family: var(--font-body);
          transition: all 0.15s;
        }
        .hdr-profile:hover {
          background: #eef2f8;
          border-color: var(--hms-border);
        }
      `}</style>

      {/*
        .hms-header — CSS in index.css controls the `left` property.
        position: fixed, top: 0, right: 0 are stable and safe as inline.
        We do NOT set `left` here at all.
      */}
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
        {/*
          .hms-hamburger — index.css hides this on desktop (display:none !important)
          and shows it on mobile (display:flex !important).
          The inline style here sets the default; CSS overrides per breakpoint.
        */}
        <button
          className="hms-hamburger hdr-btn"
          onClick={onMobileMenuClick}
          style={{ display: "none" }} /* CSS shows this on mobile */
        >
          <Menu size={20} />
        </button>

        {/* Brand context — desktop only (Tailwind md:flex works fine for display here) */}
        <div
          className="hidden lg:flex items-center gap-2"
          style={{ flexShrink: 0 }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--hms-blue)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#94a3b8",
              fontFamily: "var(--font-body)",
            }}
          >
            Hospital Management System
          </span>
        </div>

        {/* Divider — desktop */}
        <div
          className="hidden lg:block"
          style={{
            width: 1,
            height: 20,
            background: "var(--hms-border)",
            flexShrink: 0,
          }}
        />

        {/* Search — visible on md and above */}
        <div
          className="hidden md:flex"
          style={{ flex: 1, maxWidth: 380, position: "relative" }}
        >
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="hdr-search"
            placeholder="Search patients, doctors, medicines..."
          />
        </div>

        {/* Mobile search toggle */}
        <button
          className="hdr-btn md:hidden"
          onClick={() => setShowMobileSearch((s) => !s)}
        >
          {showMobileSearch ? <X size={18} /> : <Search size={18} />}
        </button>

        {/* Push right items to the right edge */}
        <div style={{ flex: 1 }} />

        {/* ── Right actions ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              className="hdr-btn"
              style={{ position: "relative" }}
              onClick={() => {
                setShowNotifications((s) => !s);
                setShowProfile(false);
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ef4444",
                    border: "2px solid #fff",
                  }}
                />
              )}
            </button>

            {showNotifications && (
              <div
                className="hdr-drop"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: 320,
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid var(--hms-border)",
                  boxShadow: "var(--shadow-xl)",
                  overflow: "hidden",
                  zIndex: 999,
                }}
              >
                <div
                  style={{
                    padding: "0.875rem 1rem",
                    borderBottom: "1px solid var(--hms-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "var(--hms-navy)",
                    }}
                  >
                    Notifications
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--hms-blue)",
                      cursor: "pointer",
                    }}
                  >
                    Mark all read
                  </span>
                </div>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #f8fafc",
                      background: n.unread ? "#f0f6ff" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = n.unread
                        ? "#f0f6ff"
                        : "#fff")
                    }
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 5,
                        background: n.unread ? n.color : "#e2e8f0",
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: "0.825rem",
                          fontWeight: n.unread ? 600 : 400,
                          color: "var(--hms-navy)",
                          margin: 0,
                        }}
                      >
                        {n.text}
                      </p>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "#94a3b8",
                          margin: "3px 0 0",
                        }}
                      >
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "0.625rem 1rem", textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--hms-blue)",
                      cursor: "pointer",
                    }}
                  >
                    View all notifications
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button
              className="hdr-profile"
              onClick={() => {
                setShowProfile((s) => !s);
                setShowNotifications(false);
              }}
              style={{
                borderColor: showProfile ? "var(--hms-border)" : "transparent",
              }}
            >
              {/* Avatar initials */}
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

              {/* Name and role — hidden on very small screens */}
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
                    <Icon size={14} style={{ color: "#64748b" }} />
                    {label}
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
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile search bar — slides down below header */}
      {showMobileSearch && (
        <div
          className="md:hidden fixed"
          style={{
            top: 64,
            left: 0,
            right: 0,
            zIndex: 25,
            background: "#fff",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-sm)",
            animation: "hdrSlide 0.2s ease both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "var(--hms-surface)",
              borderRadius: 10,
              padding: "0.5rem 0.875rem",
              border: "1.5px solid var(--hms-border)",
            }}
          >
            <Search size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search patients, doctors..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
                color: "var(--hms-navy)",
                width: "100%",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
