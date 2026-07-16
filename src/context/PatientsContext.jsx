/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// PatientsContext.jsx
//
// Week 8 update: the READ side now routes through patientsService via
// the shared useAsyncData hook, rather than seeding state directly from
// the static import. isLoading/error are new, ADDITIVE fields on the
// context value — no existing consumer destructures them, so nothing
// anywhere in the app changes behavior; a future component can opt into
// showing a loading/error state simply by reading them.
//
// Every mutation function below (add/update/delete/restore) is
// UNCHANGED — still synchronous, local-state-only. See patientsService.js
// for why that's deliberately deferred, not an oversight.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { patientsService } from "../services/patientsService";
import { initialPatients } from "../pages/opd/opdData";

const PatientsContext = createContext(null);

export const PatientsProvider = ({ children }) => {
  const {
    data: patients,
    setData: setPatients,
    isLoading,
    error,
  } = useAsyncData(patientsService.getAll, initialPatients);

  const addPatient = useCallback(
    (patient) => {
      setPatients((prev) => [patient, ...prev]);
    },
    [setPatients],
  );

  const updatePatient = useCallback(
    (updated) => {
      setPatients((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    },
    [setPatients],
  );

  const deletePatient = useCallback(
    (id) => {
      setPatients((prev) => prev.filter((p) => p.id !== id));
    },
    [setPatients],
  );

  // Used by the "Undo" toast action after a delete
  const restorePatient = useCallback(
    (patient) => {
      setPatients((prev) =>
        [patient, ...prev].sort((a, b) => a.id.localeCompare(b.id)),
      );
    },
    [setPatients],
  );

  return (
    <PatientsContext.Provider
      value={{
        patients,
        isLoading,
        error,
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
