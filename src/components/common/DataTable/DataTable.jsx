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

import { useState } from "react";
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
  Filter,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

// Number of skeleton rows shown while data is loading
const SKELETON_ROW_COUNT = 8;

// ── Consolidated filter menu — one icon, every filter group inside it ──────
// Built on Radix UI Popover. Replaces the earlier design of one visible
// button per filter (Type, Status, ...) with a single icon carrying a
// badge count; clicking it reveals all groups together in one dropdown.
const FilterMenu = ({ filters, table }) => {
  const totalActive = filters.reduce(
    (sum, f) =>
      sum + (table.getColumn(f.columnId)?.getFilterValue()?.length ?? 0),
    0,
  );

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          title="Filter"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: 36,
            padding: totalActive > 0 ? "0 0.75rem" : "0 0.625rem",
            border: `1.5px solid ${totalActive ? "var(--hms-blue)" : "var(--hms-border)"}`,
            borderRadius: 9,
            background: totalActive ? "var(--hms-blue-light)" : "#fff",
            color: totalActive ? "var(--hms-blue)" : "#64748b",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          <Filter size={15} />
          {totalActive > 0 && (
            <span
              style={{
                background: "var(--hms-blue)",
                color: "#fff",
                borderRadius: 20,
                fontSize: "0.65rem",
                fontWeight: 700,
                padding: "1px 6px",
                minWidth: 16,
                textAlign: "center",
              }}
            >
              {totalActive}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="hms-popover-content"
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-lg)",
            padding: "0.875rem",
            minWidth: 220,
            maxWidth: 280,
            zIndex: 50,
            fontFamily: "var(--font-body)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.625rem",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
              }}
            >
              Filters
            </span>
            {totalActive > 0 && (
              <button
                onClick={() =>
                  filters.forEach((f) =>
                    table.getColumn(f.columnId)?.setFilterValue(undefined),
                  )
                }
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#ef4444",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {filters.map((f, i) => {
            const selected =
              table.getColumn(f.columnId)?.getFilterValue() ?? [];
            return (
              <div
                key={f.columnId}
                style={{ marginBottom: i < filters.length - 1 ? "0.75rem" : 0 }}
              >
                <p
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "0 0 0.375rem",
                  }}
                >
                  {f.label}
                </p>
                {f.options.map((opt) => {
                  const checked = selected.includes(opt);
                  return (
                    <label
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "0.4rem 0.5rem",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: "var(--hms-navy)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--hms-surface)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? selected.filter((v) => v !== opt)
                            : [...selected, opt];
                          table
                            .getColumn(f.columnId)
                            ?.setFilterValue(next.length ? next : undefined);
                          table.setPageIndex(0);
                        }}
                        style={{
                          width: 14,
                          height: 14,
                          accentColor: "var(--hms-blue)",
                          cursor: "pointer",
                        }}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

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
  filters = [], // [{ columnId, label, options: string[] }]
  // Lets a parent pre-apply a filter the moment this table mounts — e.g.
  // Ward Management's "View All" button linking straight to one ward.
  // Shape matches TanStack's own columnFilters format:
  // [{ id: columnId, value: [...] }]. Only seeds the INITIAL state; the
  // table's own Filter menu still fully controls filtering afterward.
  initialColumnFilters = [],
  // Seeds which page this table opens on — e.g. a parent restoring the
  // page the user was viewing before clicking a row's ⋮ action and
  // navigating away. Like initialColumnFilters, this only sets the
  // INITIAL state; the table's own pagination controls drive it afterward.
  initialPageIndex = 0,
  // Notified on every page change — Prev/Next/First/Last, a page-size
  // change, or an automatic reset to page 0 from search/filtering — so a
  // parent can remember the current page across this component being
  // unmounted. TanStack's pagination state lives only here and is lost
  // the instant this unmounts, which happens on every route navigation.
  onPageIndexChange,
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState(initialColumnFilters);
  const [pagination, setPagination] = useState({
    pageIndex: initialPageIndex,
    pageSize,
  });

  // Wraps setPagination so every change — whether triggered from inside
  // this component (Prev/Next/page-size) or externally via
  // table.setPageIndex(0) (FilterMenu, global search reset) — also
  // reports the new page index upward to whichever parent is listening.
  const handlePaginationChange = (updater) => {
    setPagination((old) => {
      const next = typeof updater === "function" ? updater(old) : updater;
      onPageIndexChange?.(next.pageIndex);
      return next;
    });
  };

  // useMemo prevents the table instance from being recreated on every render.
  // The table only re-initialises when columns or data actually change.
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's useReactTable() returns functions the React Compiler can't safely auto-memoize. This is a known, harmless characteristic of the library; the table works correctly, it just won't receive automatic compiler optimization on this component.
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: handlePaginationChange,
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
      className="hms-datatable"
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid var(--hms-border)",
        boxShadow: "var(--shadow-xs)",
        fontFamily: "var(--font-body)",
        overflow: "hidden",
      }}
    >
      <style>{`
        .hms-datatable {
    container-type: inline-size;
    container-name: hms-datatable;
  }

  /* Header row (title + search/export/filter) — stacks vertically on
     narrow containers so the search input never gets squeezed into
     overflow by the fixed-size controls (Export, Filter) beside it. */
  .hms-datatable-header {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 1.125rem 1.375rem;
    border-bottom: 1px solid var(--hms-border);
  }
  .hms-datatable-controls {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
  }
  .hms-datatable-search-wrap {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
  }
  .hms-datatable-search-wrap input {
    width: 100%;
  }

  .dt-pagination-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .dt-pagination-row-info { text-align: center; }
        .dt-pagination-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          flex-wrap: wrap;
        }
        .dt-nav-edge { display: none; }

        @container hms-datatable (min-width: 480px) {
    .hms-datatable-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .hms-datatable-controls { width: auto; }
    .hms-datatable-search-wrap { flex: 0 1 200px; }

    .dt-pagination-footer { flex-direction: row; justify-content: space-between; }
          .dt-pagination-row-info { text-align: left; }
          .dt-pagination-controls { justify-content: flex-end; flex-wrap: nowrap; }
          .dt-nav-edge { display: flex; }
        }
      `}</style>
      {/* ── Table header: title + search + export ── */}
      <div className="hms-datatable-header">
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
        <div className="hms-datatable-controls">
          {/* Global search — filters across ALL columns simultaneously */}
          <div className="hms-datatable-search-wrap">
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
                width: "100%",
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
          {filters.length > 0 && <FilterMenu filters={filters} table={table} />}
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

      {/* ── Pagination controls ──
          Mobile (<480px container): stacked, centered, First/Last hidden
          Desktop (≥480px container): single row, First/Last shown */}
      <div
        className="dt-pagination-footer"
        style={{
          padding: "0.875rem 1.375rem",
          borderTop: "1px solid var(--hms-border)",
        }}
      >
        {/* Row count info */}
        <p
          className="dt-pagination-row-info"
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
        <div className="dt-pagination-controls">
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
              marginRight: "0.25rem",
            }}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>

          {/* Navigation buttons — First/Last carry "dt-nav-edge" so they
              hide on narrow containers; Prev/Next always stay visible
              since they're the controls people actually use most. */}
          {[
            {
              icon: ChevronsLeft,
              onClick: () => table.setPageIndex(0),
              disabled: !table.getCanPreviousPage(),
              title: "First page",
              edge: true,
            },
            {
              icon: ChevronLeft,
              onClick: () => table.previousPage(),
              disabled: !table.getCanPreviousPage(),
              title: "Previous page",
              edge: false,
            },
            {
              icon: ChevronRight,
              onClick: () => table.nextPage(),
              disabled: !table.getCanNextPage(),
              title: "Next page",
              edge: false,
            },
            {
              icon: ChevronsRight,
              onClick: () => table.setPageIndex(table.getPageCount() - 1),
              disabled: !table.getCanNextPage(),
              title: "Last page",
              edge: true,
            },
          ].map(({ icon: Icon, onClick, disabled, title: btnTitle, edge }) => (
            <button
              key={btnTitle}
              className={edge ? "dt-nav-edge" : undefined}
              onClick={onClick}
              disabled={disabled}
              title={btnTitle}
              style={{
                width: 30,
                height: 30,
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 8,
                background: disabled ? "var(--hms-surface)" : "#fff",
                color: disabled ? "#cbd5e1" : "#64748b",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                display: edge ? undefined : "flex",
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
