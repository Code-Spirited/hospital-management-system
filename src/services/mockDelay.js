// ─────────────────────────────────────────────────────────────────────────────
// mockDelay.js
//
// Simulates real network latency for every mock service function below —
// each one awaits this before resolving, so switching a function from
// "resolve local seed data" to "call the real endpoint" doesn't change
// how any Context perceives it: both are already Promises resolving
// after a short delay.
// ─────────────────────────────────────────────────────────────────────────────

export const mockDelay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));
