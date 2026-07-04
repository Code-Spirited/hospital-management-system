// ─────────────────────────────────────────────────────────────────────────────
// StockManagement.jsx — Week 5, Friday
//
// For manual corrections outside the normal purchase/sale flow: damage,
// loss, physical stock-count reconciliation, transfers. Distinct from
// Medicine Inventory (a read-oriented master view) — this is action-
// oriented and irreversible, so it follows the same caution pattern used
// elsewhere in the app for destructive actions: a mandatory before→after
// preview and explicit confirmation before committing. Every adjustment
// is written to an audit log (batch, type, quantities, reason,
// timestamp) — mandatory, per both source documents, since stock
// adjustments must be traceable in any real hospital pharmacy.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  ClipboardEdit,
  AlertTriangle,
  ArrowRight,
  History,
  CheckCircle2,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
  FormSelect,
} from "../../components/common";
import { usePharmacy } from "../../context/PharmacyContext";
import { ADJUSTMENT_TYPE_CONFIG } from "./pharmacyData";
import { stockAdjustmentSchema } from "./pharmacySchema";

const opt = (v) => ({ value: v, label: v });
const ADJUSTMENT_TYPE_OPTIONS = Object.keys(ADJUSTMENT_TYPE_CONFIG).map(opt);

const TypePill = ({ type }) => {
  const cfg = ADJUSTMENT_TYPE_CONFIG[type] || {
    color: "#94a3b8",
    bg: "#f8fafc",
  };
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
      {type}
    </span>
  );
};

const StockManagement = () => {
  const { medicines, batches, stockMovements, adjustStock } = usePharmacy();
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      batchId: "",
      adjustmentType: "",
      quantity: "",
      reason: "",
    },
  });

  const batchId = useWatch({ control, name: "batchId" });
  const adjustmentType = useWatch({ control, name: "adjustmentType" });
  const quantity = useWatch({ control, name: "quantity" });

  // Batches shown with their medicine name attached, since batch numbers
  // alone aren't meaningful to a person scanning the dropdown.
  const batchOptions = batches
    .filter((b) => b.status === "Active")
    .map((b) => {
      const medicine = medicines.find((m) => m.id === b.medicineId);
      return {
        value: b.id,
        label: `${medicine?.brandName ?? "Unknown"} — Batch ${b.batchNumber} (${b.quantity} units)`,
      };
    });

  const selectedBatch = batches.find((b) => b.id === batchId);
  const selectedMedicine = selectedBatch
    ? medicines.find((m) => m.id === selectedBatch.medicineId)
    : null;

  // Correction can go either way; everything else always decreases.
  // isIncrease is asked explicitly only for Correction.
  const [correctionDirection, setCorrectionDirection] = useState("decrease");
  const effectiveDirection =
    adjustmentType === "Correction"
      ? correctionDirection
      : (ADJUSTMENT_TYPE_CONFIG[adjustmentType]?.direction ?? "decrease");

  const preview = useMemo(() => {
    if (!selectedBatch || !quantity) return null;
    const qty = Number(quantity) || 0;
    const before = selectedBatch.quantity;
    const after =
      effectiveDirection === "increase"
        ? before + qty
        : Math.max(0, before - qty);
    return {
      before,
      after,
      exceedsStock: effectiveDirection === "decrease" && qty > before,
    };
  }, [selectedBatch, quantity, effectiveDirection]);

  const submit = () => {
    if (preview?.exceedsStock) {
      toast.error("Cannot proceed", {
        description: "This would reduce the batch below zero.",
      });
      return;
    }
    setConfirming(true);
  };

  const confirmAdjustment = handleSubmit(async (data) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const qty = Number(data.quantity);
    const signedChange = effectiveDirection === "increase" ? qty : -qty;
    adjustStock({
      batchId: data.batchId,
      type: data.adjustmentType,
      quantityChange: signedChange,
      reason: data.reason,
    });
    setSubmitting(false);
    setConfirming(false);
    toast.success("Stock adjusted", {
      description: `${selectedMedicine?.brandName} · Batch ${selectedBatch.batchNumber} · ${data.adjustmentType}`,
    });
    reset({ batchId: "", adjustmentType: "", quantity: "", reason: "" });
    setCorrectionDirection("decrease");
  });

  const recentMovements = [...stockMovements].slice(0, 15);

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 820,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--hms-blue-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ClipboardEdit size={14} style={{ color: "var(--hms-blue)" }} />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--hms-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Pharmacy · Stock Management
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Adjust Stock
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#64748b",
            margin: "0.4rem 0 0",
          }}
        >
          For damage, loss, physical recounts, and transfers — not for normal
          purchases or sales.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Field label="Batch" required error={errors.batchId?.message}>
              <FormSelect
                name="batchId"
                control={control}
                options={batchOptions}
                error={errors.batchId}
                placeholder="Search medicine or batch number"
                isSearchable
              />
            </Field>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              <Field
                label="Adjustment Type"
                required
                error={errors.adjustmentType?.message}
              >
                <FormSelect
                  name="adjustmentType"
                  control={control}
                  options={ADJUSTMENT_TYPE_OPTIONS}
                  error={errors.adjustmentType}
                  placeholder="Select type"
                  isSearchable={false}
                />
              </Field>
              <Field label="Quantity" required error={errors.quantity?.message}>
                <Input
                  {...register("quantity")}
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  error={errors.quantity}
                />
              </Field>
            </div>

            {adjustmentType === "Correction" && (
              <div style={{ display: "flex", gap: 8 }}>
                {["decrease", "increase"].map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setCorrectionDirection(dir)}
                    style={{
                      flex: 1,
                      padding: "0.55rem 1rem",
                      borderRadius: 9,
                      border: `1.5px solid ${correctionDirection === dir ? "var(--hms-blue)" : "var(--hms-border)"}`,
                      background:
                        correctionDirection === dir
                          ? "var(--hms-blue-light)"
                          : "#fff",
                      color:
                        correctionDirection === dir
                          ? "var(--hms-blue)"
                          : "#64748b",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                    }}
                  >
                    {dir === "decrease"
                      ? "Recount found LESS stock"
                      : "Recount found MORE stock"}
                  </button>
                ))}
              </div>
            )}

            <Field
              label="Reason / Notes"
              required
              error={errors.reason?.message}
              hint="Mandatory — this becomes part of the audit record"
            >
              <Textarea
                {...register("reason")}
                placeholder="Describe what happened in detail (e.g. 'Water damage to 10 units during storage flooding on shelf B-2')"
              />
            </Field>
          </div>

          {preview && (
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1rem 1.125rem",
                borderRadius: 11,
                background: preview.exceedsStock
                  ? "var(--hms-danger-bg)"
                  : "var(--hms-surface)",
                border: preview.exceedsStock
                  ? "1.5px solid rgba(220,38,38,0.3)"
                  : "1px solid var(--hms-border)",
              }}
            >
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 0.625rem",
                }}
              >
                {selectedMedicine?.brandName} — Batch{" "}
                {selectedBatch?.batchNumber}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    Current
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--hms-navy)",
                    }}
                  >
                    {preview.before}
                  </p>
                </div>
                <ArrowRight size={18} style={{ color: "#cbd5e1" }} />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    After Adjustment
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: preview.exceedsStock
                        ? "#dc2626"
                        : "var(--hms-success)",
                    }}
                  >
                    {preview.after}
                  </p>
                </div>
              </div>
              {preview.exceedsStock && (
                <p
                  style={{
                    margin: "0.625rem 0 0",
                    fontSize: "0.78rem",
                    color: "#dc2626",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <AlertTriangle size={13} /> This would take the batch below
                  zero — reduce the quantity.
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!preview || preview.exceedsStock}
          onClick={handleSubmit(submit)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            justifyContent: "center",
            padding: "0.75rem 1rem",
            border: "none",
            borderRadius: 12,
            background:
              !preview || preview.exceedsStock ? "#94a3b8" : "var(--hms-blue)",
            color: "#fff",
            cursor:
              !preview || preview.exceedsStock ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow:
              !preview || preview.exceedsStock
                ? "none"
                : "0 4px 14px rgba(37,99,235,0.3)",
          }}
        >
          Review Adjustment
        </button>
      </form>

      {/* ── Confirmation modal ── */}
      {confirming && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "1.75rem",
              maxWidth: 420,
              width: "100%",
              fontFamily: "var(--font-body)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "var(--hms-blue-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangle size={20} style={{ color: "var(--hms-blue)" }} />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: "0 0 0.5rem",
              }}
            >
              Confirm Stock Adjustment
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                margin: "0 0 1.25rem",
                lineHeight: 1.5,
              }}
            >
              This will change <strong>{selectedMedicine?.brandName}</strong>{" "}
              (Batch {selectedBatch?.batchNumber}) from{" "}
              <strong>{preview?.before}</strong> to{" "}
              <strong>{preview?.after}</strong> units. This action is recorded
              permanently in the audit log and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                style={{
                  flex: 1,
                  padding: "0.65rem 1rem",
                  border: "1.5px solid var(--hms-border)",
                  borderRadius: 10,
                  background: "#fff",
                  color: "#64748b",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirmAdjustment}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "0.65rem 1rem",
                  border: "none",
                  borderRadius: 10,
                  background: submitting ? "#94a3b8" : "var(--hms-success)",
                  color: "#fff",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={15} />{" "}
                {submitting ? "Applying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent movements ── */}
      <div style={{ marginTop: "2rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: "0 0 0.875rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <History size={16} style={{ color: "var(--hms-blue)" }} /> Recent
          Adjustments
        </h2>
        {recentMovements.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid var(--hms-border)",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                margin: 0,
                fontWeight: 500,
              }}
            >
              No manual adjustments recorded yet this session.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            {recentMovements.map((mv) => {
              const medicine = medicines.find((m) => m.id === mv.medicineId);
              return (
                <div
                  key={mv.id}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid var(--hms-border)",
                    padding: "0.875rem 1.125rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--hms-navy)",
                      }}
                    >
                      {medicine?.brandName}{" "}
                      <span style={{ fontWeight: 500, color: "#94a3b8" }}>
                        · Batch {mv.batchNumber}
                      </span>
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "0.76rem",
                        color: "#64748b",
                      }}
                    >
                      {mv.reason}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <TypePill type={mv.type} />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color:
                          mv.quantityChange < 0
                            ? "#dc2626"
                            : "var(--hms-success)",
                      }}
                    >
                      {mv.quantityChange > 0 ? "+" : ""}
                      {mv.quantityChange}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      {dayjs(mv.timestamp).fromNow()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagement;
