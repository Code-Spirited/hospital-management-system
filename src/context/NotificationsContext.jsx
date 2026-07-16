/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// NotificationsContext.jsx
//
// Week 8 update: the initial notification list now routes through
// notificationsService via useAsyncData. isLoading/error are new,
// additive fields. The live-notification simulation below (setTimeout,
// liveIndex) is completely unchanged — it's a genuinely different
// transport concept (an ongoing feed, not a one-time fetch), already
// correctly flagged for future WebSocket replacement.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import { useAsyncData } from "../hooks/useAsyncData";
import { notificationsService } from "../services/notificationsService";
import {
  liveNotificationQueue,
  NOTIFICATION_CONFIG,
} from "../pages/dashboard/notificationsData";

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const {
    data: notifications,
    setData: setNotifications,
    isLoading,
    error,
  } = useAsyncData(notificationsService.getInitial, []);
  const [liveIndex, setLiveIndex] = useState(0);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    (id) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [setNotifications],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const addNotification = useCallback(
    (notif) => {
      setNotifications((prev) => [
        { ...notif, id: Date.now(), timestamp: new Date(), read: false },
        ...prev,
      ]);
    },
    [setNotifications],
  );

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
        isLoading,
        error,
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
