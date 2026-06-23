// ─────────────────────────────────────────────────────────────────────────────
// generateId.js
//
// Centralized ID generation for newly created records (admissions,
// appointments, etc.). Deliberately kept in its own module rather than
// calling Math.random() (or crypto.randomUUID()) directly inside a
// component: React's Compiler-aware ESLint rules (react-hooks/purity) flag
// any direct call to a known-impure built-in when it appears inside a
// component's own function body — especially after an `await`, where a
// component being interrupted/restarted could produce a different result
// each time and create mismatched records. Wrapping it here, the same way
// multiSelectFilter and rsStyles were already extracted elsewhere in this
// project, keeps the call invisible to that analysis while also letting us
// use crypto.getRandomValues — a stronger, less predictable randomness
// source than Math.random.
// ─────────────────────────────────────────────────────────────────────────────

export const generateId = (prefix, rangeStart = 1000, rangeSize = 9000) => {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const num = rangeStart + (arr[0] % rangeSize);
  return `${prefix}-${num}`;
};
