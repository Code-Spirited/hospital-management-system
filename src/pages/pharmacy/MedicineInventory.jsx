// ─────────────────────────────────────────────────────────────────────────────
// MedicineInventory.jsx — polish pass
//
// Search/filter now cover every meaningful attribute, not just the three
// original filters. DataTable's own global search only scans visible
// cell text by default, which would miss fields like manufacturer or
// generic name that aren't rendered as their own column text — so a
// dedicated searchable composite string is attached to each row instead,
// and DataTable's built-in search naturally searches it since it's part
// of the row object.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Pill,
  AlertTriangle,
  XCircle,
  CalendarClock,
  Receipt,
  Eye,
  PlusCircle,
  Layers,
} from "lucide-react";
import { DataTable, multiSelectFilter } from "../../components/common";
import Abbr from "../../components/common/Abbr/Abbr";
import { usePharmacy } from "../../context/PharmacyContext";
import { useTablePagination } from "../../context/TablePaginationContext";
import {
  SCHEDULE_CONFIG,
  STOCK_STATUS_CONFIG,
  EXPIRY_STATUS_CONFIG,
  CATEGORIES,
  DOSAGE_FORMS,
} from "./pharmacyData";
import {
  getStockStatus,
  getExpiryStatus,
  getTotalQuantity,
  getBatchesForMedicine,
  getNearestExpiryBatch,
  getTotalInventoryValue,
} from "./pharmacyUtils";

const SCHEDULE_TERM_KEY = {
  OTC: "SCHEDULE_OTC",
  H: "SCHEDULE_H",
  H1: "SCHEDULE_H1",
  X: "SCHEDULE_X",
};

const SchedulePill = ({ schedule }) => {
  const cfg = SCHEDULE_CONFIG[schedule] || { color: "#94a3b8", bg: "#f8fafc" };
  return (
    <span
      style={{
        padding: "4px 11px",
        borderRadius: 20,
        fontSize: "0.78rem",
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      <Abbr term={SCHEDULE_TERM_KEY[schedule]} underline={false}>
        {schedule}
      </Abbr>
    </span>
  );
};

const StatusCell = ({ status, config, dateText }) => {
  const cfg = config[status] || { color: "#94a3b8" };
  const needsAttention = !!cfg.bg;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: cfg.color,
            flexShrink: 0,
            boxShadow: needsAttention ? `0 0 0 3px ${cfg.bg}` : "none",
          }}
        />
        <span
          style={{
            fontSize: "0.86rem",
            fontWeight: needsAttention ? 700 : 600,
            color: cfg.color,
          }}
        >
          {status}
        </span>
      </div>
      {dateText && (
        <p
          style={{
            margin: 0,
            marginLeft: 15,
            fontSize: "0.76rem",
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          {dateText}
        </p>
      )}
    </div>
  );
};

const fmtCurrency = (n) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Matches the global search box against each row's searchIndex — which
// covers batch-level facts (batch number, supplier, shelf location)
// alongside Medicine-tier ones — instead of TanStack's default of only
// scanning each column's own rendered value.
const inventoryGlobalFilter = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? "")
    .toLowerCase()
    .trim();
  if (!query) return true;
  return row.original.searchIndex.includes(query);
};

const MedicineInventory = () => {
  const navigate = useNavigate();
  const { medicines, batches } = usePharmacy();
  const { getPageIndex, setPageIndex } = useTablePagination();

  const medicinesForTable = medicines.map((m) => {
    const nearest = getNearestExpiryBatch(m.id, batches);
    const medicineBatches = getBatchesForMedicine(m.id, batches);
    return {
      ...m,
      quantity: getTotalQuantity(m.id, batches),
      batchCount: medicineBatches.filter((b) => b.status === "Active").length,
      nearestExpiry: nearest?.expiryDate ?? null,
      stockStatus: getStockStatus(m, batches),
      expiryStatus: getExpiryStatus(m, batches),
      // Composite field the global search box matches against (see
      // globalFilterFn below) — covers every Medicine-tier attribute
      // AND every Batch-tier attribute across all of this medicine's
      // batches (batch number, supplier, shelf location, invoice
      // number), even though none of the batch-level facts are
      // rendered as their own inventory column.
      searchIndex: [
        m.brandName,
        m.genericName,
        m.strength,
        m.category,
        m.dosageForm,
        m.manufacturer,
        m.schedule,
        m.storageCondition,
        ...medicineBatches.flatMap((b) => [
          b.batchNumber,
          b.supplier,
          b.shelfLocation,
          b.invoiceNumber,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });

  const totalMedicines = medicines.length;
  const lowStockCount = medicinesForTable.filter(
    (m) => m.stockStatus === "Low Stock",
  ).length;
  const outOfStockCount = medicinesForTable.filter(
    (m) => m.stockStatus === "Out of Stock",
  ).length;
  const expiringSoonCount = medicinesForTable.filter(
    (m) => m.expiryStatus === "Expiring Soon",
  ).length;
  const totalInventoryValue = getTotalInventoryValue(batches);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("brandName", {
      header: "Medicine",
      cell: (info) => {
        const m = info.row.original;
        return (
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--hms-navy)",
                whiteSpace: "nowrap",
              }}
            >
              {m.brandName}
            </p>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "#94a3b8" }}>
              {m.genericName} · {m.strength}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("manufacturer", {
      header: "Manufacturer",
      filterFn: multiSelectFilter,
      cell: (info) => (
        <span
          style={{
            fontSize: "0.84rem",
            color: "#64748b",
            whiteSpace: "nowrap",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      filterFn: multiSelectFilter,
      cell: (info) => (
        <span
          style={{
            fontSize: "0.86rem",
            color: "#475569",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("dosageForm", {
      header: "Form",
      filterFn: multiSelectFilter,
      cell: (info) => (
        <span
          style={{
            fontSize: "0.84rem",
            color: "#64748b",
            whiteSpace: "nowrap",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("quantity", {
      header: "Total Qty",
      cell: (info) => (
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--hms-navy)",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("batchCount", {
      header: "Batches",
      cell: (info) => (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: "0.84rem",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          <Layers size={13} style={{ color: "#94a3b8" }} /> {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("stockStatus", {
      header: "Stock",
      filterFn: multiSelectFilter,
      cell: (info) => (
        <StatusCell status={info.getValue()} config={STOCK_STATUS_CONFIG} />
      ),
    }),
    columnHelper.accessor("expiryStatus", {
      header: "Nearest Expiry",
      filterFn: multiSelectFilter,
      cell: (info) => {
        const m = info.row.original;
        return (
          <StatusCell
            status={info.getValue()}
            config={EXPIRY_STATUS_CONFIG}
            dateText={
              m.nearestExpiry
                ? new Date(m.nearestExpiry).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null
            }
          />
        );
      },
    }),
    columnHelper.accessor("schedule", {
      header: "Schedule",
      filterFn: multiSelectFilter,
      cell: (info) => <SchedulePill schedule={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <button
          onClick={() => navigate(`/pharmacy/medicine/${info.row.original.id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0.45rem 0.8rem",
            borderRadius: 8,
            border: "1.5px solid var(--hms-border)",
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.84rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <Eye size={14} /> View
        </button>
      ),
    }),
  ];

  return (
    <div className="pharmacy-page" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .pharmacy-page { container-type: inline-size; container-name: pharmacy-page; }
        .pharmacy-stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.875rem; margin-bottom: 1.25rem;
        }
      `}</style>

      <div className="pharmacy-stats-grid">
        {[
          {
            label: "Total Medicines",
            value: totalMedicines,
            Icon: Pill,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "Low Stock",
            value: lowStockCount,
            Icon: AlertTriangle,
            color: "#d97706",
            bg: "#fffbeb",
          },
          {
            label: "Out of Stock",
            value: outOfStockCount,
            Icon: XCircle,
            color: "#dc2626",
            bg: "#fef2f2",
          },
          {
            label: "Expiring ≤ 90 Days",
            value: expiringSoonCount,
            Icon: CalendarClock,
            color: "#d97706",
            bg: "#fffbeb",
          },
          {
            label: "Inventory Value",
            value: fmtCurrency(totalInventoryValue),
            Icon: Receipt,
            color: "var(--hms-success)",
            bg: "var(--hms-success-bg)",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid var(--hms-border)",
              padding: "1rem 1.2rem",
              boxShadow: "var(--shadow-xs)",
              display: "flex",
              alignItems: "center",
              gap: 13,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.Icon size={19} style={{ color: s.color }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--hms-navy)",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "0.76rem",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/pharmacy/add")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0.625rem 1.25rem",
            border: "none",
            borderRadius: 10,
            background: "var(--hms-blue)",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}
        >
          <PlusCircle size={16} /> Add Medicine
        </button>
      </div>

      <DataTable
        columns={columns}
        data={medicinesForTable}
        title="Medicine Inventory"
        subtitle="Master catalog · Total Qty aggregated across all Active batches · Search also reaches batch number, supplier, and shelf location"
        pageSize={10}
        initialPageIndex={getPageIndex("pharmacy-inventory")}
        onPageIndexChange={(i) => setPageIndex("pharmacy-inventory", i)}
        searchPlaceholder="Search name, generic, batch, supplier..."
        emptyMessage="No medicines found"
        rowNoun="medicines"
        globalFilterFn={inventoryGlobalFilter}
        filters={[
          { columnId: "category", label: "Category", options: CATEGORIES },
          {
            columnId: "dosageForm",
            label: "Dosage Form",
            options: DOSAGE_FORMS,
          },
          {
            columnId: "manufacturer",
            label: "Manufacturer",
            options: [...new Set(medicines.map((m) => m.manufacturer))].sort(),
          },
          {
            columnId: "stockStatus",
            label: "Stock",
            options: Object.keys(STOCK_STATUS_CONFIG),
          },
          {
            columnId: "expiryStatus",
            label: "Expiry",
            options: Object.keys(EXPIRY_STATUS_CONFIG),
          },
          {
            columnId: "schedule",
            label: "Schedule",
            options: Object.keys(SCHEDULE_CONFIG),
          },
        ]}
      />
    </div>
  );
};

export default MedicineInventory;
