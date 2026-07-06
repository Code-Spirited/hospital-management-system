// ─────────────────────────────────────────────────────────────────────────────
// userUtils.js
//
// getEffectivePermission resolves what a specific USER can actually do in
// a module — their individual override if one exists, otherwise their
// role's default from Wednesday's matrix. Kept as its own small utility
// file rather than a function inside userData.js, matching the project's
// established pattern (pharmacyUtils.js) of separating pure computed
// logic from static reference data.
// ─────────────────────────────────────────────────────────────────────────────

export const getEffectivePermission = (
  user,
  permissions,
  overrides,
  moduleName,
) => {
  const override = overrides[user.id]?.[moduleName];
  if (override) return override;
  return permissions[user.role]?.[moduleName] ?? "No Access";
};
