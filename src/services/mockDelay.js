// ─────────────────────────────────────────────────────────────────────────────
// mockDelay.js
//
// mockDelay simulates real network latency for every mock service
// function. shouldSimulateError is a NEW, deterministic, opt-in way to
// prove the error-handling UI actually works: none of the mock service
// functions ever reject on their own, so testing a real error path
// otherwise requires faking one — and doing that with randomness would
// be non-deterministic and could embarrass a demo. This is triggered
// only via an explicit URL query param (e.g. ?simulateError=patients),
// never fires on its own, and is fully documented here.
// ─────────────────────────────────────────────────────────────────────────────

export const mockDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const shouldSimulateError = (serviceName) => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("simulateError") === serviceName;
};
