// ─────────────────────────────────────────────────────────────────────────────
// useAsyncData.js
//
// The shared shape every Context's list state now follows: fetch on
// mount, expose { data, setData, isLoading, error, refetch }. `setData`
// is the raw useState setter, so every existing Context mutation
// (setPatients((prev) => ...), etc.) keeps working exactly as before —
// this hook only changes WHERE the initial value comes from, never how
// it's updated afterward.
//
// `data` initializes to `initialData` synchronously (via useState), so
// the seed data is visible on the very first render — the ~400ms mock
// network delay only affects when that same data gets silently
// re-confirmed from the service layer, never an empty/loading flash.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

export const useAsyncData = (fetcher, initialData) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only touches state inside the promise chain — no synchronous setState
  // call left for react-hooks/set-state-in-effect to catch when the mount
  // effect below calls this.
  const load = useCallback(() => {
    fetcher()
      .then((result) => setData(result))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  // Invoked from event handlers, not from inside an effect, so resetting
  // synchronously here doesn't trip the rule.
  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    load();
  }, [load]);

  return { data, setData, isLoading, error, refetch };
};
