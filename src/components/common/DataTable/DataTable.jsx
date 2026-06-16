// ─────────────────────────────────────────────────────────────────────────────
// DataTable.jsx — Powered by @tanstack/react-table v8
//
// A headless-UI table component. TanStack Table handles all data logic
// (sorting, filtering, pagination) but renders nothing itself — we control
// every pixel of the JSX. This gives us full design freedom while avoiding
// hundreds of lines of manual sort/filter/pagination code.
//
// PROPS:
//   columns    (ColumnDef[]) — TanStack column definitions. Defined by the
//              parent so this component is reusable across all modules.
//   data       (object[])   — Array of row objects matching the column keys.
//   loading    (boolean)    — Shows skeleton rows when true.
//   title      (string)     — Optional table heading.
//   subtitle   (string)     — Optional description below the heading.
//   pageSize   (number)     — Rows per page. Defaults to 10.
//
// USAGE PATTERN:
//   const columns = [
//     { accessorKey: 'id',   header: 'ID'   },
//     { accessorKey: 'name', header: 'Name' },
//   ];
//   <DataTable columns={columns} data={patients} title="Recent Patients" />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from "lucide-react";

// Number of skeleton rows shown while data is loading
const SKELETON_ROW_COUNT = 8;

// ── Sort direction icon ───────────────────────────────────────────────────────
// Renders the appropriate sort indicator next to a column header.
// 'asc' / 'desc' = column is actively sorted. false = sortable but inactive.
const SortIcon = ({ sorted }) => {
  if (sorted === "asc")
    return <ChevronUp size={13} style={{ color: "#2563eb" }} />;
  if (sorted === "desc")
    return <ChevronDown size={13} style={{ color: "#2563eb" }} />;
  return <ChevronsUpDown size={13} style={{ color: "#cbd5e1" }} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DataTable = ({
  columns,
  data = [],
  loading = false,
  title,
  subtitle,
  pageSize = 10,
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  // useMemo prevents the table instance from being recreated on every render.
  // The table only re-initialises when columns or data actually change.
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Tells TanStack how many rows exist — needed when pagination is server-side.
    // For client-side (our case now), this is calculated automatically.
  });

  const { pageIndex } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const firstRow = pageIndex * pagination.pageSize + 1;
  const lastRow = Math.min((pageIndex + 1) * pagination.pageSize, totalRows);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid var(--hms-border)",
        boxShadow: "var(--shadow-xs)",
        fontFamily: "var(--font-body)",
        overflow: "hidden",
      }}
    >
      {/* ── Table header: title + search + export ── */}
      <div
        style={{
          padding: "1.125rem 1.375rem",
          borderBottom: "1px solid var(--hms-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {/* Title block */}
        <div>
          {title && (
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: "3px 0 0",
                fontWeight: 500,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Search + Export */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {/* Global search — filters across ALL columns simultaneously */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                // Reset to first page whenever the search query changes
                // so users don't end up on page 5 with 0 results visible
                table.setPageIndex(0);
              }}
              placeholder="Search patients..."
              style={{
                padding: "0.45rem 0.75rem 0.45rem 2rem",
                background: "var(--hms-surface)",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 9,
                fontSize: "0.8rem",
                fontFamily: "var(--font-body)",
                color: "var(--hms-navy)",
                outline: "none",
                width: 200,
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--hms-blue)";
                e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--hms-border)";
                e.target.style.boxShadow = "none";
                e.target.style.background = "var(--hms-surface)";
              }}
            />
          </div>

          {/* Export button — UI only; real export logic added in Week 7 */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0.45rem 0.875rem",
              background: "var(--hms-surface)",
              border: "1.5px solid var(--hms-border)",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#64748b",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--hms-blue)";
              e.currentTarget.style.color = "var(--hms-blue)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--hms-border)";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* ── Table body ── */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}
        >
          {/* Column headers */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{
                  borderBottom: "1.5px solid var(--hms-border)",
                  background: "#fafbfd",
                }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: "0.65rem 1rem",
                      textAlign: "left",
                      fontSize: "0.67rem",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      whiteSpace: "nowrap",
                      // Pointer cursor only on sortable columns
                      cursor: header.column.getCanSort()
                        ? "pointer"
                        : "default",
                      userSelect: "none",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() && (
                        <SortIcon sorted={header.column.getIsSorted()} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Rows */}
          <tbody>
            {loading ? (
              // Skeleton rows — shown while data is being fetched from API
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                  {columns.map((_, ci) => (
                    <td key={ci} style={{ padding: "0.875rem 1rem" }}>
                      <Skeleton height={12} borderRadius={6} />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              // Empty state — shown when search returns no results
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: "3rem", textAlign: "center" }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    No patients found matching your search
                  </p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid #f8fafc",
                    transition: "background 0.12s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fbff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ padding: "0.825rem 1rem", whiteSpace: "nowrap" }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination controls ── */}
      <div
        style={{
          padding: "0.875rem 1.375rem",
          borderTop: "1px solid var(--hms-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.625rem",
        }}
      >
        {/* Row count info */}
        <p
          style={{
            fontSize: "0.78rem",
            color: "#64748b",
            margin: 0,
            fontWeight: 500,
          }}
        >
          {totalRows === 0
            ? "No results"
            : `Showing ${firstRow}–${lastRow} of ${totalRows} patients`}
        </p>

        {/* Page navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {/* Page size selector */}
          <select
            value={pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
              table.setPageIndex(0);
            }}
            style={{
              padding: "0.35rem 0.625rem",
              border: "1.5px solid var(--hms-border)",
              borderRadius: 8,
              fontSize: "0.75rem",
              fontFamily: "var(--font-body)",
              color: "#64748b",
              background: "#fff",
              outline: "none",
              cursor: "pointer",
              marginRight: "0.5rem",
            }}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>

          {/* Navigation buttons */}
          {[
            {
              icon: ChevronsLeft,
              onClick: () => table.setPageIndex(0),
              disabled: !table.getCanPreviousPage(),
              title: "First page",
            },
            {
              icon: ChevronLeft,
              onClick: () => table.previousPage(),
              disabled: !table.getCanPreviousPage(),
              title: "Previous page",
            },
            {
              icon: ChevronRight,
              onClick: () => table.nextPage(),
              disabled: !table.getCanNextPage(),
              title: "Next page",
            },
            {
              icon: ChevronsRight,
              onClick: () => table.setPageIndex(table.getPageCount() - 1),
              disabled: !table.getCanNextPage(),
              title: "Last page",
            },
          ].map(({ icon: Icon, onClick, disabled, title: btnTitle }) => (
            <button
              key={btnTitle}
              onClick={onClick}
              disabled={disabled}
              title={btnTitle}
              style={{
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 8,
                background: disabled ? "var(--hms-surface)" : "#fff",
                color: disabled ? "#cbd5e1" : "#64748b",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.borderColor = "var(--hms-blue)";
                  e.currentTarget.style.color = "var(--hms-blue)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--hms-border)";
                e.currentTarget.style.color = disabled ? "#cbd5e1" : "#64748b";
              }}
            >
              <Icon size={14} />
            </button>
          ))}

          {/* Current page indicator */}
          <span
            style={{
              padding: "0.2rem 0.625rem",
              background: "var(--hms-blue)",
              color: "#fff",
              borderRadius: 8,
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              minWidth: 28,
              textAlign: "center",
            }}
          >
            {pageIndex + 1}
          </span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            of {table.getPageCount()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
