// ─────────────────────────────────────────────────────────────────────────────
// ExpiryAlerts.jsx — Week 5, Saturday
//
// A focused worklist, not a duplicate of Inventory: only batches with a
// genuine near-term expiry concern (Expired/Critical/Warning) appear
// here at all — healthy stock is deliberately excluded. Default sort is
// most-urgent-first (longest-expired, then soonest-to-expire), though
// column headers can still be clicked to re-sort.
//
// "Mark Removed"/"Mark Disposed" both require a reason and write to the
// SAME audit log Stock Management's manual adjustments use — one
// unified stock-movement history, fed by two different entry points.
// Quantity is intentionally left unchanged on a disposed/removed batch
// (see updateBatchStatus in PharmacyContext for why) — it drops out of
// every stock total immediately regardless, since status !== "Active".
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import * as Popover from "@radix-ui/react-popover";
import dayjs from "dayjs";
import {
  AlertTriangle,
  XCircle,
  CalendarClock,
  Layers,
  Receipt,
  MoreVertical,
} from "lucide-react";
import { DataTable, multiSelectFilter } from "../../components/common";
import { usePharmacy } from "../../context/PharmacyContext";
import { useTablePagination } from "../../context/TablePaginationContext";
import { EXPIRY_TIER_CONFIG } from "./pharmacyData";
import { getBatchExpiryTier } from "./pharmacyUtils";

const fmtCurrency = (n) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Per-row action — a small popover, not a full modal, since a reason
// field already provides the deliberate-friction Friday's audit
// principle calls for; a second confirmation step would be redundant
// for what's meant to be a fast, contextual action from a worklist.
const BatchActionPopover = ({ batch, medicine, onUpdateStatus }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const closeTimer = useRef(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  const canAct = reason.trim().length > 0;

  const handleAction = (newStatus) => {
    onUpdateStatus(batch.id, newStatus, reason.trim());
    setOpen(false);
    setReason("");
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          title="Actions"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1.5px solid var(--hms-border)",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          <MoreVertical size={15} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="hms-popover-content"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-lg)",
            padding: "0.875rem",
            minWidth: 260,
            zIndex: 50,
            fontFamily: "var(--font-body)",
          }}
        >
          <p
            style={{
              margin: "0 0 2px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--hms-navy)",
            }}
          >
            {medicine?.brandName ?? "Unknown"}
          </p>
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.72rem",
              color: "#94a3b8",
            }}
          >
            Batch {batch.batchNumber} · {batch.quantity} units
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (required) — e.g. 'Confirmed expired on physical check'"
            rows={2}
            style={{
              width: "100%",
              padding: "0.5rem 0.625rem",
              border: "1.5px solid var(--hms-border)",
              borderRadius: 8,
              fontSize: "0.8rem",
              fontFamily: "var(--font-body)",
              marginBottom: "0.625rem",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={!canAct}
              onClick={() => handleAction("Removed")}
              style={{
                flex: 1,
                padding: "0.45rem 0.6rem",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 8,
                background: "#fff",
                color: canAct ? "#64748b" : "#cbd5e1",
                cursor: canAct ? "pointer" : "not-allowed",
                fontFamily: "var(--font-body)",
                fontSize: "0.76rem",
                fontWeight: 700,
              }}
            >
              Mark Removed
            </button>
            <button
              type="button"
              disabled={!canAct}
              onClick={() => handleAction("Disposed")}
              style={{
                flex: 1,
                padding: "0.45rem 0.6rem",
                border: "none",
                borderRadius: 8,
                background: canAct ? "#dc2626" : "#fca5a5",
                color: "#fff",
                cursor: canAct ? "pointer" : "not-allowed",
                fontFamily: "var(--font-body)",
                fontSize: "0.76rem",
                fontWeight: 700,
              }}
            >
              Mark Disposed
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const alertsGlobalFilter = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? "")
    .toLowerCase()
    .trim();
  if (!query) return true;
  return row.original.searchIndex.includes(query);
};

const ExpiryAlerts = () => {
  const { medicines, batches, updateBatchStatus } = usePharmacy();
  const { getPageIndex, setPageIndex } = useTablePagination();

  const alertBatches = useMemo(() => {
    return batches
      .filter((b) => b.status === "Active")
      .map((b) => {
        const medicine = medicines.find((m) => m.id === b.medicineId);
        return {
          ...b,
          medicine,
          tier: getBatchExpiryTier(b),
          daysRemaining: dayjs(b.expiryDate).diff(dayjs(), "day"),
          valueAtRisk: b.quantity * b.unitCost,
          searchIndex: [
            medicine?.brandName,
            medicine?.genericName,
            b.batchNumber,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        };
      })
      .filter((b) => b.tier !== "Good")
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [batches, medicines]);

  const expiredCount = alertBatches.filter((b) => b.tier === "Expired").length;
  const criticalCount = alertBatches.filter(
    (b) => b.tier === "Critical",
  ).length;
  const warningCount = alertBatches.filter((b) => b.tier === "Warning").length;
  const totalValueAtRisk = alertBatches.reduce(
    (sum, b) => sum + b.valueAtRisk,
    0,
  );

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("medicine", {
      header: "Medicine",
      cell: (info) => {
        const m = info.getValue();
        return (
          <div>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--hms-navy)",
                whiteSpace: "nowrap",
              }}
            >
              {m?.brandName ?? "Unknown"}
            </p>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "#94a3b8" }}>
              {m?.genericName} · {m?.strength}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("batchNumber", {
      header: "Batch",
      cell: (info) => (
        <span
          style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}
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
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--hms-navy)",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("expiryDate", {
      header: "Expiry Date",
      cell: (info) => (
        <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
          {dayjs(info.getValue()).format("D MMM YYYY")}
        </span>
      ),
    }),
    columnHelper.accessor("daysRemaining", {
      header: "Days Remaining",
      cell: (info) => {
        const d = info.getValue();
        const cfg = EXPIRY_TIER_CONFIG[info.row.original.tier];
        return (
          <span
            style={{ fontSize: "0.85rem", fontWeight: 700, color: cfg.color }}
          >
            {d < 0 ? `Expired ${Math.abs(d)}d ago` : `${d} days`}
          </span>
        );
      },
    }),
    columnHelper.accessor("tier", {
      header: "Urgency",
      filterFn: multiSelectFilter,
      cell: (info) => {
        const cfg = EXPIRY_TIER_CONFIG[info.getValue()];
        return (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: "0.72rem",
              fontWeight: 700,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            {info.getValue()}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <BatchActionPopover
          batch={info.row.original}
          medicine={info.row.original.medicine}
          onUpdateStatus={(batchId, newStatus, reason) =>
            updateBatchStatus({ batchId, newStatus, reason })
          }
        />
      ),
    }),
  ];

  return (
    <div className="pharmacy-page" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .pharmacy-stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.875rem; margin-bottom: 1.25rem;
        }
      `}</style>

      <div className="pharmacy-stats-grid">
        {[
          {
            label: "Expired",
            value: expiredCount,
            Icon: XCircle,
            color: "#dc2626",
            bg: "#fef2f2",
          },
          {
            label: "Critical (≤30 Days)",
            value: criticalCount,
            Icon: AlertTriangle,
            color: "#ea580c",
            bg: "#fff7ed",
          },
          {
            label: "Warning (≤90 Days)",
            value: warningCount,
            Icon: CalendarClock,
            color: "#d97706",
            bg: "#fffbeb",
          },
          {
            label: "Total Batches Flagged",
            value: alertBatches.length,
            Icon: Layers,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "Value at Risk",
            value: fmtCurrency(totalValueAtRisk),
            Icon: Receipt,
            color: "#7c3aed",
            bg: "#f5f3ff",
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
        data={alertBatches}
        title="Expiry Alerts"
        subtitle="Batches needing attention, most urgent first · Healthy stock is not shown here — see Inventory for the full catalog"
        pageSize={10}
        initialPageIndex={getPageIndex("pharmacy-expiry-alerts")}
        onPageIndexChange={(i) => setPageIndex("pharmacy-expiry-alerts", i)}
        searchPlaceholder="Search medicine, generic, or batch..."
        emptyMessage="No medicines currently need expiry attention"
        rowNoun="batches"
        globalFilterFn={alertsGlobalFilter}
        filters={[
          {
            columnId: "tier",
            label: "Urgency",
            options: ["Expired", "Critical", "Warning"],
          },
        ]}
      />
    </div>
  );
};

export default ExpiryAlerts;
