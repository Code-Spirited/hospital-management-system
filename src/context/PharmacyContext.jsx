/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// PharmacyContext.jsx
//
// Single source of truth for the pharmacy inventory, mirroring
// IPDContext/AppointmentsContext's pattern. addMedicine/updateMedicine/
// deleteMedicine/adjustStock are all included now even though only
// "read" is used today — Tuesday's Add Medicine Form, Wednesday's
// Purchase Entry (stock increases), and Thursday's Sales Billing (stock
// decreases) will all call into this same context without it needing to
// change shape, the same forward-looking approach used for
// dischargeAdmission ahead of IPD's Friday task.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { initialMedicines } from "../pages/pharmacy/pharmacyData";

const PharmacyContext = createContext(null);

export const PharmacyProvider = ({ children }) => {
  const [medicines, setMedicines] = useState(initialMedicines);

  const addMedicine = useCallback((medicine) => {
    setMedicines((prev) => [medicine, ...prev]);
  }, []);

  const updateMedicine = useCallback((updated) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m)),
    );
  }, []);

  const deleteMedicine = useCallback((id) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Positive delta = stock received (Purchase Entry); negative = stock
  // dispensed (Sales Billing). Clamped at 0 — stock can never go negative.
  const adjustStock = useCallback((id, delta) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, quantity: Math.max(0, m.quantity + delta) } : m,
      ),
    );
  }, []);

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        adjustStock,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const ctx = useContext(PharmacyContext);
  if (!ctx) throw new Error("usePharmacy must be used inside PharmacyProvider");
  return ctx;
};
