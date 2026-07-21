// ─────────────────────────────────────────────────────────────────────────────
// mockDelay.js
//
// Week 8, Friday: mockDelay used to add a real ~400ms wait to every mock
// service call, to make it feel like a real network request. Removed —
// the app should behave normally instead of pretending to be slower
// than it actually is. The function itself, and every service file that
// calls it, are left in place — so the moment real API calls replace
// these mock functions, bringing back a genuine delay (or removing this
// call) is a one-line change in exactly one place, not something to
// hunt down across 7 files.
//
// shouldSimulateError has nothing to do with the wait above and is
// unchanged. It only ever runs if someone deliberately adds
// ?simulateError=<name> to the web address — it never fires on its own.
// ─────────────────────────────────────────────────────────────────────────────

export const mockDelay = () => Promise.resolve();

export const shouldSimulateError = (serviceName) => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("simulateError") === serviceName;
};
