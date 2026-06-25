/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// TablePaginationContext.jsx
//
// Remembers which page each list table was on, keyed by a unique string
// per table (e.g. "opd-patient-list"). Exists specifically to survive
// React unmounting a table component — which happens every time the user
// clicks a row's ⋮ action and navigates to another route (Consultation,
// Treatment Records, Billing, etc.). TanStack Table's own pagination
// state lives only inside DataTable.jsx and is lost the instant it
// unmounts; this context sits above the routed pages in MainLayout.jsx,
// so it's never unmounted by navigation within the app.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";

const TablePaginationContext = createContext(null);

export const TablePaginationProvider = ({ children }) => {
  const [pages, setPages] = useState({});

  const getPageIndex = useCallback((key) => pages[key] ?? 0, [pages]);

  const setPageIndex = useCallback((key, index) => {
    setPages((prev) =>
      prev[key] === index ? prev : { ...prev, [key]: index },
    );
  }, []);

  return (
    <TablePaginationContext.Provider value={{ getPageIndex, setPageIndex }}>
      {children}
    </TablePaginationContext.Provider>
  );
};

export const useTablePagination = () => {
  const ctx = useContext(TablePaginationContext);
  if (!ctx)
    throw new Error(
      "useTablePagination must be used inside TablePaginationProvider",
    );
  return ctx;
};
