// Custom TanStack Table filter functions, kept in their own file separate
// from DataTable.jsx purely so Vite's Fast Refresh can treat DataTable.jsx
// as a component-only file and keep hot-reloading working smoothly on it.
//
// TanStack's built-in arrIncludes* filters assume the CELL value itself is
// an array. Ours is a single string (e.g. row.type === "OPD"), and we want
// the opposite check: "is this single value present in the selected filter
// list?" — so a small custom function is the correct tool, not a built-in
// string name.
export const multiSelectFilter = (row, columnId, filterValue) => {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId));
};
