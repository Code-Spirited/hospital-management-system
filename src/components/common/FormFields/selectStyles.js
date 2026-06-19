// Plain style-factory function — not a component — kept in its own file so
// Vite's Fast Refresh can treat FormFields.jsx as a component-only file.
export const rsStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderRadius: 10,
    borderColor: hasError
      ? "#dc2626"
      : state.isFocused
        ? "var(--hms-blue)"
        : "var(--hms-border)",
    boxShadow: state.isFocused
      ? hasError
        ? "0 0 0 3px rgba(220,38,38,0.1)"
        : "0 0 0 3px rgba(37,99,235,0.1)"
      : "none",
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    background: "#fff",
    "&:hover": { borderColor: hasError ? "#dc2626" : "var(--hms-blue)" },
  }),
  placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "0.875rem" }),
  option: (base, state) => ({
    ...base,
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    borderRadius: 7,
    background: state.isSelected
      ? "var(--hms-blue)"
      : state.isFocused
        ? "var(--hms-blue-light)"
        : "transparent",
    color: state.isSelected ? "#fff" : "var(--hms-navy)",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 12,
    border: "1px solid var(--hms-border)",
    boxShadow: "var(--shadow-lg)",
    overflow: "hidden",
    fontFamily: "var(--font-body)",
  }),
  menuList: (base) => ({ ...base, padding: "0.375rem", maxHeight: 220 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  singleValue: (base) => ({
    ...base,
    color: "var(--hms-navy)",
    fontFamily: "var(--font-body)",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
  clearIndicator: (base) => ({ ...base, color: "#94a3b8" }),
});
