/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// AppointmentsContext.jsx
//
// Week 8 update: read side now routes through appointmentsService via
// useAsyncData — isLoading/error are new, additive fields. Mutation
// functions (add/update/cancel) are unchanged, same deferral reasoning
// as PatientsContext.
//
// Note: the Calendar drawer (header icon) currently still reads from its
// own separate calendarData.js mock — that hasn't been unified with this
// context yet. Flagged deliberately, not an oversight.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { appointmentsService } from "../services/appointmentsService";
import { initialAppointments } from "../pages/opd/appointmentsData";

const AppointmentsContext = createContext(null);

export const AppointmentsProvider = ({ children }) => {
  const {
    data: appointments,
    setData: setAppointments,
    isLoading,
    error,
    refetch,
  } = useAsyncData(appointmentsService.getAll, initialAppointments);

  const addAppointment = useCallback(
    (appt) => {
      setAppointments((prev) => [appt, ...prev]);
    },
    [setAppointments],
  );

  const updateAppointment = useCallback(
    (updated) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
    },
    [setAppointments],
  );

  // Cancelling sets status rather than deleting — appointment history
  // (including cancellations) is something a real hospital system keeps.
  const cancelAppointment = useCallback(
    (id) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a)),
      );
    },
    [setAppointments],
  );

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        isLoading,
        error,
        refetch,
        addAppointment,
        updateAppointment,
        cancelAppointment,
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const ctx = useContext(AppointmentsContext);
  if (!ctx)
    throw new Error("useAppointments must be used inside AppointmentsProvider");
  return ctx;
};
