// ─────────────────────────────────────────────────────────────────────────────
// dateValidators.js
//
// Shared DD-MM-YYYY date validation, used by every module's Zod schema
// (OPD's patient/appointment forms, IPD's admission form, and any future
// module). Previously this logic was duplicated inside opdSchema.js — kept
// here once now so every module validates dates identically and a future
// fix only needs to happen in one place.
// ─────────────────────────────────────────────────────────────────────────────

export const ddmmyyyyRegex = /^\d{2}-\d{2}-\d{4}$/;

// Confirms a DD-MM-YYYY string is a real calendar date (rejects things
// like "31-02-2026").
export const validDDMMYYYY = (val) => {
  if (!ddmmyyyyRegex.test(val)) return false;
  const [d, m, y] = val.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getDate() === d &&
    date.getMonth() === m - 1 &&
    date.getFullYear() === y
  );
};

export const parseDDMMYYYY = (val) => {
  const [d, m, y] = val.split("-").map(Number);
  return new Date(y, m - 1, d);
};
