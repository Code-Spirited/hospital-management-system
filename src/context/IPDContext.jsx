/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// IPDContext.jsx
//
// Single source of truth for IPD admissions, mirroring the
// AppointmentsContext pattern. Today (Week 4 Monday) only Create/Read are
// needed for the Admission Form; updateAdmission and dischargeAdmission
// are included now so Tuesday–Saturday's Ward Management, Bed Allocation,
// Treatment Records, and Discharge Summary pages can build on this same
// context without it needing to change shape later.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { initialAdmissions } from "../pages/ipd/ipdData";

const IPDContext = createContext(null);

export const IPDProvider = ({ children }) => {
  const [admissions, setAdmissions] = useState(initialAdmissions);

  const addAdmission = useCallback((admission) => {
    setAdmissions((prev) => [admission, ...prev]);
  }, []);

  const updateAdmission = useCallback((updated) => {
    setAdmissions((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
  }, []);

  // Discharge logic (Week 4 Friday) will likely need more fields than this
  // (discharge summary, final billing, etc.) — this stub exists now so the
  // context's shape doesn't need to change when that page is built.
  const dischargeAdmission = useCallback((id, dischargeDetails = {}) => {
    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "Discharged", ...dischargeDetails } : a,
      ),
    );
  }, []);

  return (
    <IPDContext.Provider
      value={{ admissions, addAdmission, updateAdmission, dischargeAdmission }}
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
