/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// NotificationsContext.jsx
//
// Week 8 update: the initial notification list now routes through
// notificationsService via useAsyncData. isLoading/error are new,
// additive fields.
//
// Week 8, Friday — removed the background timer that used to push a
// fake, pre-written notification (with its own pop-up) onto the list
// every 40 seconds, with nothing real behind it. That's what was
// causing pop-ups to appear for no reason. addNotification itself is
// untouched and still works normally — a real feature (a new
// admission, a low-stock alert, and so on) can still call it any time
// to add a genuine notification. Only the fake, timer-based one is gone.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback, useMemo } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { notificationsService } from "../services/notificationsService";

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const {
    data: notifications,
    setData: setNotifications,
    isLoading,
    error,
    refetch,
  } = useAsyncData(notificationsService.getInitial, []);

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

  const value = useMemo(
    () => ({
      notifications,
      isLoading,
      error,
      refetch,
      unreadCount,
      markAsRead,
      markAllRead,
      addNotification,
    }),
    [
      notifications,
      isLoading,
      error,
      refetch,
      unreadCount,
      markAsRead,
      markAllRead,
      addNotification,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
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
