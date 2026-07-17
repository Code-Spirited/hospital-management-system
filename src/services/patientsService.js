// ─────────────────────────────────────────────────────────────────────────────
// patientsService.js
//
// SCOPE NOTE: only the read/list side is wired through here today.
// PatientsContext's addPatient/updatePatient/deletePatient/restorePatient
// remain synchronous, local-state-only mutations, exactly as before.
// Routing those through this service too is real follow-up work,
// deliberately deferred — it would require confirming and touching every
// form that calls them (PatientRegistration, PatientList's Edit drawer),
// none of which are part of today's confirmed file set.
// ─────────────────────────────────────────────────────────────────────────────

import { mockDelay, shouldSimulateError } from "./mockDelay";
import { initialPatients } from "../pages/opd/opdData";

export const patientsService = {
  getAll: async () => {
    await mockDelay();
    if (shouldSimulateError("patients")) {
      throw new Error("Failed to load patients. Please try again.");
    }
    return initialPatients;
    // Real implementation, once a backend exists:
    //   import apiClient from "./apiClient";
    //   const { data } = await apiClient.get("/patients");
    //   return data;
  },
};
