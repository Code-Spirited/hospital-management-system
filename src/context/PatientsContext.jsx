/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// PatientsContext.jsx
//
// Single source of truth for the patient registry across the entire app.
// Before this, the Dashboard and OPD module each had their own separate
// mock dataset with different counts, field names, and status vocabularies —
// editing a patient in one had no effect on the other. This context
// replaces both with one shared list. OPD performs full CRUD against it;
// the Dashboard reads the same list for its "recent activity" preview and
// its total-patient KPI. In Week 8, the seed array below is replaced by a
// real API fetch — every consumer of this context stays unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { initialPatients } from "../pages/opd/opdData";

const PatientsContext = createContext(null);

export const PatientsProvider = ({ children }) => {
  const [patients, setPatients] = useState(initialPatients);

  const addPatient = useCallback((patient) => {
    setPatients((prev) => [patient, ...prev]);
  }, []);

  const updatePatient = useCallback((updated) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const deletePatient = useCallback((id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Used by the "Undo" toast action after a delete
  const restorePatient = useCallback((patient) => {
    setPatients((prev) =>
      [patient, ...prev].sort((a, b) => a.id.localeCompare(b.id)),
    );
  }, []);

  return (
    <PatientsContext.Provider
      value={{
        patients,
        addPatient,
        updatePatient,
        deletePatient,
        restorePatient,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
};

export const usePatients = () => {
  const ctx = useContext(PatientsContext);
  if (!ctx) throw new Error("usePatients must be used inside PatientsProvider");
  return ctx;
};
