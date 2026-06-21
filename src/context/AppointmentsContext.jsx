/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// AppointmentsContext.jsx
//
// Single source of truth for OPD appointments, mirroring PatientsContext's
// pattern exactly. The OPD Appointment Module performs full CRUD against
// this. In Week 8 the seed array is replaced by a real API fetch.
//
// Note: the Calendar drawer (header icon) currently still reads from its
// own separate calendarData.js mock — that hasn't been unified with this
// context yet. Flagged deliberately, not an oversight.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { initialAppointments } from "../pages/opd/appointmentsData";

const AppointmentsContext = createContext(null);

export const AppointmentsProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(initialAppointments);

  const addAppointment = useCallback((appt) => {
    setAppointments((prev) => [appt, ...prev]);
  }, []);

  const updateAppointment = useCallback((updated) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
  }, []);

  // Cancelling sets status rather than deleting — appointment history
  // (including cancellations) is something a real hospital system keeps.
  const cancelAppointment = useCallback((id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a)),
    );
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
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
