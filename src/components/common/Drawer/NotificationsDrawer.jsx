// ─────────────────────────────────────────────────────────────────────────────
// NotificationsDrawer.jsx
//
// A right-side slide-in drawer powered by vaul.
// Opens over the entire layout with a blurred backdrop.
// All notification data comes from NotificationsContext — no local state
// for the list itself, ensuring the header bell count stays in sync.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { useNotifications } from "../../../context/NotificationsContext";
import { NOTIFICATION_CONFIG } from "../../../pages/dashboard/notificationsData";
import { X, BellOff, CheckCheck, ChevronRight, Bell } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "emergency", label: "🚨 Emergency" },
  { key: "patient", label: "👤 Patient" },
  { key: "appointment", label: "📅 Appt" },
  { key: "lab", label: "🧪 Lab" },
  { key: "pharmacy", label: "💊 Pharmacy" },
];

const getGroup = (ts) => {
  const t = dayjs(ts);
  if (t.isSame(dayjs(), "day")) return "Today";
  if (t.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  return "Earlier";
};

// Single notification row — kept outside to avoid recreating on each render
const NotifItem = ({ notif, onRead }) => {
  const cfg = NOTIFICATION_CONFIG[notif.type] || NOTIFICATION_CONFIG.system;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22 }}
      onClick={() => onRead(notif.id)}
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "0.875rem 1.25rem",
        cursor: "pointer",
        background: notif.read ? "transparent" : cfg.bg,
        borderLeft: `3px solid ${notif.read ? "transparent" : cfg.color}`,
        borderBottom: "1px solid #f1f5f9",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = notif.read ? "transparent" : cfg.bg)
      }
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: notif.read ? "#f1f5f9" : cfg.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          marginTop: 1,
          border: `1px solid ${notif.read ? "#e2e8f0" : cfg.color + "33"}`,
        }}
      >
        {cfg.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          <p
            style={{
              fontSize: "0.825rem",
              fontWeight: notif.read ? 500 : 700,
              color: notif.read ? "#475569" : "#0f172a",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {notif.title}
          </p>
          {!notif.read && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: cfg.color,
                flexShrink: 0,
                marginTop: 4,
              }}
            />
          )}
        </div>

        <p
          style={{
            fontSize: "0.75rem",
            color: "#64748b",
            margin: "4px 0 0",
            lineHeight: 1.5,
          }}
        >
          {notif.message}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "0.4rem",
          }}
        >
          <span
            style={{ fontSize: "0.68rem", color: "#94a3b8", fontWeight: 500 }}
          >
            {dayjs(notif.timestamp).fromNow()}
          </span>
          {notif.action && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontSize: "0.68rem",
                fontWeight: 700,
                color: cfg.color,
              }}
            >
              {notif.action.label} <ChevronRight size={10} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const NotificationsDrawer = ({ open, onOpenChange }) => {
  const { notifications, unreadCount, markAsRead, markAllRead } =
    useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const grouped = {
    Today: filtered.filter((n) => getGroup(n.timestamp) === "Today"),
    Yesterday: filtered.filter((n) => getGroup(n.timestamp) === "Yesterday"),
    Earlier: filtered.filter((n) => getGroup(n.timestamp) === "Earlier"),
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        {/* Blurred backdrop */}
        <Drawer.Overlay
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />

        {/* Drawer panel */}
        <Drawer.Content
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 101,
            width: "100%",
            maxWidth: 440,
            background: "#fff",
            boxShadow: "-8px 0 40px rgba(15,23,42,0.18)",
            display: "flex",
            flexDirection: "column",
            outline: "none",
            fontFamily: "var(--font-body)",
          }}
        >
          {/* ── Drawer header ── */}
          <div
            style={{
              padding: "1.25rem 1.375rem",
              borderBottom: "1px solid var(--hms-border)",
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            {/* Title row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--hms-blue-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={17} style={{ color: "var(--hms-blue)" }} />
                </div>
                <div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <h2
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.05rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Notifications
                    </h2>
                    {unreadCount > 0 && (
                      <motion.span
                        key={unreadCount}
                        initial={{ scale: 0.7 }}
                        animate={{ scale: 1 }}
                        style={{
                          padding: "1px 8px",
                          borderRadius: 20,
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: "0.7rem",
                          fontWeight: 800,
                        }}
                      >
                        {unreadCount} new
                      </motion.span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#64748b",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    Hospital activity feed
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "1.5px solid var(--hms-border)",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.borderColor = "#fca5a5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.borderColor = "var(--hms-border)";
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Mark all read + filter tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div
                style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1 }}
              >
                {FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      border: "none",
                      background:
                        activeFilter === key ? "#0f172a" : "var(--hms-surface)",
                      color: activeFilter === key ? "#fff" : "#64748b",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-body)",
                      transition: "all 0.15s",
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: "1.5px solid var(--hms-border)",
                  background: "#fff",
                  cursor: unreadCount === 0 ? "not-allowed" : "pointer",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  flexShrink: 0,
                  color: unreadCount === 0 ? "#cbd5e1" : "#64748b",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.15s",
                }}
              >
                <CheckCheck size={13} />
                All read
              </button>
            </div>
          </div>

          {/* ── Notification list — data-lenis-prevent for scroll ── */}
          <div data-lenis-prevent style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4rem 1rem",
                  gap: 12,
                }}
              >
                <BellOff size={32} style={{ color: "#e2e8f0" }} />
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#94a3b8",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  No {activeFilter === "all" ? "" : activeFilter} notifications
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([group, items]) => {
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <div
                      style={{
                        padding: "0.625rem 1.375rem 0.375rem",
                        background: "var(--hms-surface)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        {group}
                      </span>
                    </div>
                    <AnimatePresence initial={false}>
                      {items.map((notif) => (
                        <NotifItem
                          key={notif.id}
                          notif={notif}
                          onRead={markAsRead}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default NotificationsDrawer;
