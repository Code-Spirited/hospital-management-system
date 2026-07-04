// ─────────────────────────────────────────────────────────────────────────────
// MedicineDetails.jsx — new, replaces the old flat View drawer
//
// The natural home for batch-level detail now that Inventory is
// medicine-level. Shows the Medicine's permanent Product-tier facts
// once at the top, then every Batch that has ever been received for it
// — Active, Removed, or Disposed — each with its own batch number,
// quantity, cost, MRP, expiry, and sourcing detail. This is what makes
// FEFO genuinely visible: a pharmacist can see at a glance which batch
// should be dispensed next.
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Pill,
  Package,
  Factory,
  Thermometer,
  Receipt,
  Truck,
} from "lucide-react";
import Abbr from "../../components/common/Abbr/Abbr";
import { usePharmacy } from "../../context/PharmacyContext";
import { SCHEDULE_CONFIG, BATCH_STATUS_CONFIG } from "./pharmacyData";
import {
  getBatchesForMedicine,
  getTotalQuantity,
  getStockStatus,
  getExpiryStatus,
  getMedicineInventoryValue,
  EXPIRY_WARNING_DAYS,
} from "./pharmacyUtils";

const SCHEDULE_TERM_KEY = {
  OTC: "SCHEDULE_OTC",
  H: "SCHEDULE_H",
  H1: "SCHEDULE_H1",
  X: "SCHEDULE_X",
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

const batchExpiryLabel = (expiryDate) => {
  const today = dayjs();
  const expiry = dayjs(expiryDate);
  if (expiry.isBefore(today, "day"))
    return { text: "Expired", color: "#dc2626" };
  if (expiry.diff(today, "day") <= EXPIRY_WARNING_DAYS)
    return { text: "Expiring Soon", color: "#d97706" };
  return { text: "Good", color: "#475569" };
};

const MedicineDetails = () => {
  const { medicineId } = useParams();
  const navigate = useNavigate();
  const { medicines, batches } = usePharmacy();

  const medicine = medicines.find((m) => m.id === medicineId);

  if (!medicine) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          padding: "3rem",
          textAlign: "center",
          fontFamily: "var(--font-body)",
        }}
      >
        <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 12px" }}>
          This medicine could not be found.
        </p>
        <button
          onClick={() => navigate("/pharmacy")}
          style={{
            color: "var(--hms-blue)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontFamily: "var(--font-body)",
          }}
        >
          ← Back to Inventory
        </button>
      </div>
    );
  }

  const allBatches = [...getBatchesForMedicine(medicine.id, batches)].sort(
    (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
  );
  const totalQty = getTotalQuantity(medicine.id, batches);
  const stockStatus = getStockStatus(medicine, batches);
  const expiryStatus = getExpiryStatus(medicine, batches);
  const inventoryValue = getMedicineInventoryValue(medicine.id, batches);
  const scheduleCfg = SCHEDULE_CONFIG[medicine.schedule] || {};
  const activeBatches = allBatches.filter(
    (b) => b.status === "Active" && b.quantity > 0,
  );
  const fefoNextBatch = activeBatches[0]; // already sorted by soonest expiry

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 860,
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => navigate("/pharmacy")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748b",
          fontSize: "0.8rem",
          fontWeight: 600,
          marginBottom: "1rem",
          padding: 0,
          fontFamily: "var(--font-body)",
        }}
      >
        <ArrowLeft size={15} /> Back to Inventory
      </button>

      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              background: "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Pill size={24} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              {medicine.brandName}
            </h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                margin: "3px 0 0",
                fontWeight: 500,
              }}
            >
              {medicine.genericName} · {medicine.strength} ·{" "}
              {medicine.dosageForm}
            </p>
          </div>
          <span
            style={{
              padding: "5px 13px",
              borderRadius: 20,
              background: scheduleCfg.bg,
              color: scheduleCfg.color,
              fontSize: "0.78rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <Abbr term={SCHEDULE_TERM_KEY[medicine.schedule]} underline={false}>
              {medicine.schedule}
            </Abbr>
          </span>
        </div>

        {/* Quick stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.875rem",
          }}
        >
          {[
            { label: "Total Stock", value: `${totalQty} units` },
            { label: "Stock Status", value: stockStatus },
            { label: "Expiry Status", value: expiryStatus },
            {
              label: "Inventory Value",
              value: `₹${inventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "0.75rem 0.9rem",
                borderRadius: 10,
                background: "var(--hms-surface)",
              }}
            >
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 3px",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "var(--hms-navy)",
                  margin: 0,
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product details ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: "0 0 0.875rem",
          }}
        >
          Product Details
        </h2>
        <DetailRow Icon={Package} label="Category" value={medicine.category} />
        <DetailRow
          Icon={Factory}
          label="Manufacturer"
          value={medicine.manufacturer}
        />
        <DetailRow
          Icon={Thermometer}
          label="Storage Condition"
          value={medicine.storageCondition}
        />
        <DetailRow
          Icon={Receipt}
          label={<Abbr underline={false}>GST</Abbr>}
          value={`${medicine.gstPercent}%`}
        />
        <DetailRow
          Icon={Package}
          label="Reorder Level"
          value={`${medicine.reorderLevel} units`}
        />
      </div>

      {/* ── Batches ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: "0 0 0.375rem",
          }}
        >
          Batches ({allBatches.length})
        </h2>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#94a3b8",
            margin: "0 0 1.125rem",
            fontWeight: 500,
          }}
        >
          Sorted by nearest expiry — the top Active batch is the one FEFO
          dispensing should use next.
        </p>

        {allBatches.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                margin: 0,
                fontWeight: 500,
              }}
            >
              No batches on record for this medicine — currently out of stock.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {allBatches.map((b) => {
              const exp = batchExpiryLabel(b.expiryDate);
              const isFefoNext = fefoNextBatch?.id === b.id;
              const statusCfg = BATCH_STATUS_CONFIG[b.status] || {};
              return (
                <div
                  key={b.id}
                  style={{
                    border: `1.5px solid ${isFefoNext ? "var(--hms-blue)" : "var(--hms-border)"}`,
                    borderRadius: 12,
                    padding: "1rem 1.25rem",
                    background: isFefoNext ? "var(--hms-blue-light)" : "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.92rem",
                          fontWeight: 800,
                          color: "var(--hms-navy)",
                        }}
                      >
                        Batch {b.batchNumber}
                      </span>
                      {isFefoNext && (
                        <span
                          style={{
                            padding: "2px 9px",
                            borderRadius: 20,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            background: "var(--hms-blue)",
                            color: "#fff",
                          }}
                        >
                          Dispense Next
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "2px 9px",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: statusCfg.bg,
                        color: statusCfg.color,
                      }}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: "0.75rem",
                      fontSize: "0.82rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Quantity
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontWeight: 700,
                          color: "var(--hms-navy)",
                        }}
                      >
                        {b.quantity} units
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Expiry
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontWeight: 700,
                          color: exp.color,
                        }}
                      >
                        {dayjs(b.expiryDate).format("D MMM YYYY")}{" "}
                        <span style={{ fontWeight: 500 }}>({exp.text})</span>
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Cost / MRP
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontWeight: 700,
                          color: "var(--hms-navy)",
                        }}
                      >
                        ₹{b.unitCost.toFixed(2)} / ₹{b.mrp.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Supplier
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontWeight: 600,
                          color: "#475569",
                        }}
                      >
                        {b.supplier}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Shelf Location
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontWeight: 600,
                          color: "#475569",
                        }}
                      >
                        {b.shelfLocation || "Not recorded"}
                      </p>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "0.6rem 0 0",
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Truck size={12} /> Invoice {b.invoiceNumber} · Received{" "}
                    {dayjs(b.purchaseDate).format("D MMM YYYY")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineDetails;
