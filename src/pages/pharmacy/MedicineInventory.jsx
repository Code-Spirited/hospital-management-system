// ─────────────────────────────────────────────────────────────────────────────
// MedicineInventory.jsx — Week 5, Monday (polish pass)
//
// StatusCell rebuilt to fix a real alignment bug: the previous version
// rendered "needs attention" statuses as a padded pill and "normal"
// statuses as plain, unpadded text — two different left starting
// positions for the same column, which is what produced the zig-zag,
// "skewed" look down the Stock/Expiry columns. Every status now uses the
// identical [dot][label] structure regardless of severity, so the column
// stays perfectly left-aligned row to row. The previous version also
// hard-coded a flat gray (#94a3b8) for every "normal" status regardless
// of its actual semantic color, which is the source of the "dull" look —
// each status's real color (defined once in pharmacyData.js) is now
// always used.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Drawer } from "vaul";
import dayjs from "dayjs";
import {
  Pill,
  AlertTriangle,
  XCircle,
  CalendarClock,
  Receipt,
  Eye,
  X,
  Package,
  Factory,
  Hash,
  ShieldAlert,
  Thermometer,
  IndianRupee,
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
} from "./pharmacyData";
import {
  getStockStatus,
  getExpiryStatus,
  getInventoryValue,
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

// A small colored dot + label, used identically for EVERY status —
// "needs attention" states (config has a bg) get bold text and a soft
// halo ring around the dot; calm states get medium-weight text and a
// plain dot. Both share the exact same [dot][gap][text] structure, so
// the column's left edge never shifts between rows regardless of which
// status is showing — this is the structural fix for the alignment bug.
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

const DetailRow = ({ Icon, label, value }) => (
  <div
    style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      padding: "0.7rem 0",
      borderBottom: "1px solid #f1f5f9",
    }}
  >
    <Icon size={16} style={{ color: "#94a3b8", flexShrink: 0, marginTop: 2 }} />
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.92rem",
          fontWeight: 600,
          color: "var(--hms-navy)",
          margin: "3px 0 0",
          overflowWrap: "break-word",
        }}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const ViewDrawer = ({ medicine, open, onOpenChange }) => (
  <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
    <Drawer.Portal>
      <Drawer.Overlay
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
        }}
      />
      <Drawer.Content
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 101,
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(15,23,42,0.18)",
          display: "flex",
          flexDirection: "column",
          outline: "none",
          fontFamily: "var(--font-body)",
        }}
      >
        {medicine && (
          <>
            <div
              style={{
                padding: "1.25rem 1.375rem",
                borderBottom: "1px solid var(--hms-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background:
                      "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Pill size={21} color="#fff" />
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.08rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {medicine.brandName}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {medicine.genericName} · {medicine.strength}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "1.5px solid var(--hms-border)",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.125rem 1.375rem",
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
                <SchedulePill schedule={medicine.schedule} />
              </div>

              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--hms-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "0 0 0.25rem",
                }}
              >
                Classification
              </p>
              <DetailRow
                Icon={Package}
                label="Category"
                value={medicine.category}
              />
              <DetailRow
                Icon={Pill}
                label="Dosage Form"
                value={medicine.dosageForm}
              />

              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--hms-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "1.125rem 0 0.25rem",
                }}
              >
                Sourcing
              </p>
              <DetailRow
                Icon={Factory}
                label="Manufacturer"
                value={medicine.manufacturer}
              />
              <DetailRow
                Icon={Hash}
                label="Batch Number"
                value={medicine.batchNumber}
              />
              <DetailRow
                Icon={ShieldAlert}
                label="Expiry Date"
                value={dayjs(medicine.expiryDate).format("D MMMM YYYY")}
              />
              <DetailRow
                Icon={Thermometer}
                label="Storage Condition"
                value={medicine.storageCondition}
              />

              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--hms-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "1.125rem 0 0.25rem",
                }}
              >
                Stock & Pricing
              </p>
              <DetailRow
                Icon={Package}
                label="Quantity in Stock"
                value={`${medicine.quantity} units (reorder at ${medicine.reorderLevel})`}
              />
              <DetailRow
                Icon={IndianRupee}
                label={
                  <>
                    Unit Cost / <Abbr underline={false}>MRP</Abbr>
                  </>
                }
                value={`₹${medicine.unitPrice.toFixed(2)} / ₹${medicine.mrp.toFixed(2)}`}
              />
              <DetailRow
                Icon={Receipt}
                label={<Abbr underline={false}>GST</Abbr>}
                value={`${medicine.gstPercent}%`}
              />
            </div>
          </>
        )}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);

const fmtCurrency = (n) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const MedicineInventory = () => {
  const { medicines } = usePharmacy();
  const { getPageIndex, setPageIndex } = useTablePagination();
  const [viewing, setViewing] = useState(null);

  const medicinesForTable = medicines.map((m) => ({
    ...m,
    stockStatus: getStockStatus(m),
    expiryStatus: getExpiryStatus(m),
  }));

  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter(
    (m) => getStockStatus(m) === "Low Stock",
  ).length;
  const outOfStockCount = medicines.filter(
    (m) => getStockStatus(m) === "Out of Stock",
  ).length;
  const expiringSoonCount = medicines.filter(
    (m) => getExpiryStatus(m) === "Expiring Soon",
  ).length;
  const totalInventoryValue = medicines.reduce(
    (sum, m) => sum + getInventoryValue(m),
    0,
  );

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
      header: "Qty",
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
    columnHelper.accessor("stockStatus", {
      header: "Stock",
      filterFn: multiSelectFilter,
      cell: (info) => (
        <StatusCell status={info.getValue()} config={STOCK_STATUS_CONFIG} />
      ),
    }),
    columnHelper.accessor("expiryStatus", {
      header: "Expiry",
      filterFn: multiSelectFilter,
      cell: (info) => (
        <StatusCell
          status={info.getValue()}
          config={EXPIRY_STATUS_CONFIG}
          dateText={dayjs(info.row.original.expiryDate).format("D MMM YYYY")}
        />
      ),
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
          onClick={() => setViewing(info.row.original)}
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

      <DataTable
        columns={columns}
        data={medicinesForTable}
        title="Medicine Inventory"
        subtitle="Full pharmacy register · Click a row's View button for full details"
        pageSize={10}
        initialPageIndex={getPageIndex("pharmacy-inventory")}
        onPageIndexChange={(i) => setPageIndex("pharmacy-inventory", i)}
        filters={[
          { columnId: "category", label: "Category", options: CATEGORIES },
          {
            columnId: "stockStatus",
            label: "Stock",
            options: Object.keys(STOCK_STATUS_CONFIG),
          },
          {
            columnId: "schedule",
            label: "Schedule",
            options: Object.keys(SCHEDULE_CONFIG),
          },
        ]}
      />

      <ViewDrawer
        medicine={viewing}
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
      />
    </div>
  );
};

export default MedicineInventory;
