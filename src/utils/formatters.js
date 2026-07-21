// ─────────────────────────────────────────────────────────────────────────────
// formatters.js
//
// getInitials was independently redefined in 7 files (OPDReports.jsx,
// IPDReports.jsx, UserDirectory.jsx, UserPermissions.jsx, Profile.jsx,
// PatientList.jsx, BedAllocation.jsx). Consolidated here, Week 8, Friday.
// ─────────────────────────────────────────────────────────────────────────────

// Turns a name into 1-2 uppercase initials for an avatar circle. Strips a
// leading "Dr." first, so a doctor's initials come from their actual
// name (e.g. "Dr. Priya Mehta" → "PM", not "DP"). Harmless no-op on
// patient names, which never start with "Dr." — safe to use everywhere.
export const getInitials = (name) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
