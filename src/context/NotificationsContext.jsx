// ─────────────────────────────────────────────────────────────────────────────
// NotificationsContext.jsx
//
// Single source of truth for all notifications across the app.
// Both the header bell (count indicator) and the dashboard panel
// consume from this context — eliminating the previous redundancy
// where two separate hardcoded lists existed independently.
//
// In Week 8, the initialNotifications array and the live simulation
// will be replaced by a WebSocket connection that calls addNotification()
// as the server pushes events. The components consuming this context
// will not need to change.
// ─────────────────────────────────────────────────────────────────────────────
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import {
  initialNotifications,
  liveNotificationQueue,
  NOTIFICATION_CONFIG,
} from "../pages/dashboard/notificationsData";

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [liveIndex, setLiveIndex] = useState(0);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [
      { ...notif, id: Date.now(), timestamp: new Date(), read: false },
      ...prev,
    ]);
  }, []);

  // Live notification simulation — fires every 40 seconds.
  // Replaces the identical logic that previously lived inside NotificationsPanel,
  // so the timer now runs at the app level regardless of which page is open.
  useEffect(() => {
    if (liveIndex >= liveNotificationQueue.length) return;

    const timer = setTimeout(() => {
      const notif = liveNotificationQueue[liveIndex];
      addNotification(notif);
      setLiveIndex((i) => i + 1);

      const cfg = NOTIFICATION_CONFIG[notif.type] || NOTIFICATION_CONFIG.system;
      toast(notif.title, {
        description: notif.message,
        icon: cfg.emoji,
        style: { borderLeft: `4px solid ${cfg.color}` },
      });
    }, 40_000);

    return () => clearTimeout(timer);
  }, [liveIndex, addNotification]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  return ctx;
};
