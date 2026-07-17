/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// IPDContext.jsx
//
// Week 8 update: read side routes through ipdService via useAsyncData.
// isLoading/error are new, additive fields. All mutation functions
// (add/update/discharge/addTreatmentRecord) are unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useCallback } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { ipdService } from "../services/ipdService";
import { initialAdmissions } from "../pages/ipd/ipdData";

const IPDContext = createContext(null);

export const IPDProvider = ({ children }) => {
  const {
    data: admissions,
    setData: setAdmissions,
    isLoading,
    error,
    refetch,
  } = useAsyncData(ipdService.getAll, initialAdmissions);

  const addAdmission = useCallback(
    (admission) => {
      setAdmissions((prev) => [admission, ...prev]);
    },
    [setAdmissions],
  );

  const updateAdmission = useCallback(
    (updated) => {
      setAdmissions((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a)),
      );
    },
    [setAdmissions],
  );

  const dischargeAdmission = useCallback(
    (id, dischargeDetails = {}) => {
      setAdmissions((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "Discharged", ...dischargeDetails } : a,
        ),
      );
    },
    [setAdmissions],
  );

  const addTreatmentRecord = useCallback(
    (admissionId, record) => {
      setAdmissions((prev) =>
        prev.map((a) =>
          a.id === admissionId
            ? {
                ...a,
                treatmentRecords: [...(a.treatmentRecords || []), record],
              }
            : a,
        ),
      );
    },
    [setAdmissions],
  );

  return (
    <IPDContext.Provider
      value={{
        admissions,
        isLoading,
        error,
        refetch,
        addAdmission,
        updateAdmission,
        dischargeAdmission,
        addTreatmentRecord,
      }}
    >
      {children}
    </IPDContext.Provider>
  );
};

export const useIPD = () => {
  const ctx = useContext(IPDContext);
  if (!ctx) throw new Error("useIPD must be used inside IPDProvider");
  return ctx;
};
