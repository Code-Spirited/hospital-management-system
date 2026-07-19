// ─────────────────────────────────────────────────────────────────────────────
// IPDBilling.jsx — Week 4, Saturday
//
// Final IPD billing task. Unlike OPD's flat consultation fee, an inpatient
// stay is priced by DURATION: Room & Stay Charges = dailyRate ×
// numberOfDays, auto-suggested from the admission's ward type and the
// admission→discharge (or admission→today, if still admitted) span, but
// editable — same "suggest, allow override" pattern as OPD's
// consultationFee.
//
// Medications administered during the stay (from Thursday's Treatment
// Records) are shown as a read-only reference list — no pricing data
// exists for them yet (Week 5's Pharmacy module), so they're informational
// only; a billable line is added manually if needed.
//
// Week 8, Thursday — responsive fix: same as Billing.jsx — the
// description field in each "Additional Charges" row sits in a plain flex
// row next to a fixed 120px amount field, with no minWidth: 0 to let it
// actually shrink below content size on a narrow screen. Added as a
// defensive one-line fix, matching Billing.jsx's identical change.
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Receipt,
  Plus,
  Trash2,
  ArrowLeft,
  User2,
  CheckCircle2,
  Info,
  BedDouble,
  Pill,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormSelect,
} from "../../components/common";
import Abbr from "../../components/common/Abbr/Abbr";
import { useIPD } from "../../context/IPDContext";
import { usePatients } from "../../context/PatientsContext";
import {
  WARD_TYPE_CONFIG,
  WARD_DAILY_RATE,
  CONDITION_AT_DISCHARGE_CONFIG,
} from "./ipdData";
import { ipdBillingSchema } from "./ipdSchema";

const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Insurance", "Pending"].map(
  (v) => ({ value: v, label: v }),
);
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"].map((v) => ({
  value: v,
  label: v,
}));
const blankItem = { description: "", amount: 0 };

// Number of billable days: admission date through discharge date if the
// stay has ended, otherwise through today if still ongoing. Minimum of 1
// day so a same-day stay is never billed as zero.
const computeDays = (admission) => {
  if (!admission) return 1;
  const start = dayjs(admission.admissionDate);
  const end = admission.dischargeDate
    ? dayjs(admission.dischargeDate)
    : dayjs();
  return Math.max(1, end.diff(start, "day"));
};

const IPDBilling = () => {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const { admissions, updateAdmission } = useIPD();
  const { patients } = usePatients();

  const admission = admissions.find((a) => a.id === admissionId);
  const patient = admission?.patientId
    ? patients.find((p) => p.id === admission.patientId)
    : null;
  const existingBill = admission?.billing;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ipdBillingSchema),
    defaultValues: {
      dailyRate:
        existingBill?.dailyRate ?? WARD_DAILY_RATE[admission?.wardType] ?? 0,
      numberOfDays: existingBill?.numberOfDays ?? computeDays(admission),
      items: existingBill?.items?.length ? existingBill.items : [],
      discountPercent: existingBill?.discountPercent ?? 0,
      taxPercent: existingBill?.taxPercent ?? 5,
      paymentMethod: existingBill?.paymentMethod ?? "",
      paymentStatus: existingBill?.paymentStatus ?? "Pending",
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watched = useWatch({ control });

  if (!admission) {
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
          This admission could not be found.
        </p>
        <button
          onClick={() => navigate("/ipd")}
          style={{
            color: "var(--hms-blue)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontFamily: "var(--font-body)",
          }}
        >
          ← Back to Admissions
        </button>
      </div>
    );
  }

  const roomCharges =
    (Number(watched.dailyRate) || 0) * (Number(watched.numberOfDays) || 0);
  const itemsTotal = (watched.items || []).reduce(
    (sum, item) => sum + (Number(item?.amount) || 0),
    0,
  );
  const subtotal = roomCharges + itemsTotal;
  const discountAmount =
    subtotal * ((Number(watched.discountPercent) || 0) / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * ((Number(watched.taxPercent) || 0) / 100);
  const grandTotal = afterDiscount + taxAmount;
  const fmt = (n) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const medicationEntries = (admission.treatmentRecords || [])
    .filter((r) => r.medicationGiven)
    .map((r) => ({ id: r.id, text: r.medicationGiven, date: r.recordedAt }));

  const wardCfg = WARD_TYPE_CONFIG[admission.wardType] || {
    color: "#94a3b8",
    bg: "#f8fafc",
  };
  const conditionCfg = admission.dischargeSummary?.conditionAtDischarge
    ? CONDITION_AT_DISCHARGE_CONFIG[
        admission.dischargeSummary.conditionAtDischarge
      ]
    : null;

  const submit = (data) => {
    updateAdmission({
      ...admission,
      billing: {
        ...data,
        subtotal,
        discountAmount,
        taxAmount,
        total: grandTotal,
        billedOn: dayjs().format("YYYY-MM-DD"),
      },
    });
    toast.success("Bill saved", {
      description: `Invoice for ${admission.patientName} — ${fmt(grandTotal)}`,
    });
    navigate("/ipd");
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <style>{`
        .ipdbill-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
        @media (max-width: 540px) { .ipdbill-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <button
        onClick={() => navigate("/ipd")}
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
        <ArrowLeft size={15} /> Back to Admissions
      </button>

      {/* ── Header ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User2 size={22} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: 0,
            }}
          >
            {admission.patientName}
          </h1>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#64748b",
              margin: "2px 0 0",
              fontWeight: 500,
            }}
          >
            {patient ? `${patient.age} yrs · ${patient.gender} · ` : ""}
            {admission.admittingDoctor} · Admitted{" "}
            {dayjs(admission.admissionDate).format("D MMM YYYY")}
          </p>
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            background: wardCfg.bg,
            color: wardCfg.color,
            fontSize: "0.72rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {admission.wardType}
        </span>
      </div>

      {/* ── Stay context ── */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--hms-navy)",
            margin: "0 0 6px",
            fontWeight: 600,
          }}
        >
          Reason for Admission:{" "}
          <span style={{ fontWeight: 500, color: "#475569" }}>
            {admission.reasonForAdmission}
          </span>
        </p>

        {admission.dischargeSummary ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 6,
            }}
          >
            {conditionCfg && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: conditionCfg.bg,
                  color: conditionCfg.color,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}
              >
                {admission.dischargeSummary.conditionAtDischarge}
              </span>
            )}
            <button
              onClick={() => navigate(`/ipd/discharge/${admission.id}`)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--hms-blue)",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: 700,
                fontFamily: "var(--font-body)",
                padding: 0,
              }}
            >
              View Discharge Summary →
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginTop: 8,
              padding: "0.625rem 0.875rem",
              borderRadius: 10,
              background: "var(--hms-blue-light)",
            }}
          >
            <Info
              size={14}
              style={{ color: "var(--hms-blue)", flexShrink: 0, marginTop: 1 }}
            />
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--hms-blue)",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Patient is still admitted — charges below are calculated through
              today. Finalize this bill again after discharge for an exact
              total.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate(`/ipd/treatment/${admission.id}`)}
          style={{
            display: "block",
            marginTop: 10,
            border: "none",
            background: "transparent",
            color: "var(--hms-blue)",
            cursor: "pointer",
            fontSize: "0.78rem",
            fontWeight: 700,
            fontFamily: "var(--font-body)",
            padding: 0,
          }}
        >
          View Treatment History →
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* ── Room & Stay Charges ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.125rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BedDouble size={16} style={{ color: "var(--hms-blue)" }} /> Room &
            Stay Charges
          </h2>
          <div className="ipdbill-grid-2" style={{ marginBottom: "0.75rem" }}>
            <Field
              label="Daily Rate (₹)"
              required
              error={errors.dailyRate?.message}
              hint={`Suggested for ${admission.wardType} ward`}
            >
              <Input
                {...register("dailyRate")}
                type="number"
                min="0"
                error={errors.dailyRate}
              />
            </Field>
            <Field
              label="Number of Days"
              required
              error={errors.numberOfDays?.message}
              hint="Auto-calculated from admission/discharge dates"
            >
              <Input
                {...register("numberOfDays")}
                type="number"
                min="1"
                error={errors.numberOfDays}
              />
            </Field>
          </div>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#64748b",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Room & Stay Subtotal:{" "}
            <span style={{ color: "var(--hms-navy)" }}>{fmt(roomCharges)}</span>
          </p>
        </div>

        {/* ── Additional charges ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.125rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Receipt size={16} style={{ color: "var(--hms-blue)" }} />{" "}
            Additional Charges
          </h2>

          {medicationEntries.length > 0 && (
            <div
              style={{
                marginBottom: "1.125rem",
                padding: "0.875rem 1rem",
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
                  margin: "0 0 0.5rem",
                }}
              >
                Medications Administered During Stay (reference only)
              </p>
              {medicationEntries.map((m) => (
                <p
                  key={m.id}
                  style={{
                    fontSize: "0.8rem",
                    color: "#475569",
                    margin: "2px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Pill size={12} style={{ color: "#94a3b8", flexShrink: 0 }} />{" "}
                  {m.text}
                  <span style={{ color: "#cbd5e1", fontSize: "0.72rem" }}>
                    · {dayjs(m.date).format("D MMM")}
                  </span>
                </p>
              ))}
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                  margin: "0.5rem 0 0",
                  fontStyle: "italic",
                }}
              >
                No pricing data available yet — add a billable line below if
                these should be charged.
              </p>
            </div>
          )}

          {fields.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginBottom: "0.875rem",
              }}
            >
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Field
                      label={index === 0 ? "Description" : undefined}
                      error={errors.items?.[index]?.description?.message}
                    >
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="e.g. X-Ray, Lab Test, Nursing Fee"
                        error={errors.items?.[index]?.description}
                      />
                    </Field>
                  </div>
                  <div style={{ width: 120 }}>
                    <Field
                      label={index === 0 ? "Amount (₹)" : undefined}
                      error={errors.items?.[index]?.amount?.message}
                    >
                      <Input
                        {...register(`items.${index}.amount`)}
                        type="number"
                        min="0"
                        error={errors.items?.[index]?.amount}
                      />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      border: "1.5px solid var(--hms-border)",
                      background: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#dc2626",
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => append(blankItem)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0.5rem 1rem",
              border: "1.5px dashed var(--hms-border-2)",
              borderRadius: 9,
              background: "var(--hms-surface)",
              color: "var(--hms-blue)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            <Plus size={14} /> Add Item (lab test, procedure, medicine, etc.)
          </button>
        </div>

        {/* ── Discount / Tax / Payment ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          <div className="ipdbill-grid-2">
            <Field label="Discount (%)" error={errors.discountPercent?.message}>
              <Input
                {...register("discountPercent")}
                type="number"
                min="0"
                max="100"
                error={errors.discountPercent}
              />
            </Field>
            <Field
              label={
                <>
                  Tax / <Abbr underline={false}>GST</Abbr> (%)
                </>
              }
              error={errors.taxPercent?.message}
            >
              <Input
                {...register("taxPercent")}
                type="number"
                min="0"
                max="100"
                error={errors.taxPercent}
              />
            </Field>
            <Field
              label="Payment Method"
              required
              error={errors.paymentMethod?.message}
            >
              <FormSelect
                name="paymentMethod"
                control={control}
                options={PAYMENT_METHODS}
                error={errors.paymentMethod}
                placeholder="Select method"
                isSearchable={false}
              />
            </Field>
            <Field
              label="Payment Status"
              required
              error={errors.paymentStatus?.message}
            >
              <FormSelect
                name="paymentStatus"
                control={control}
                options={PAYMENT_STATUSES}
                error={errors.paymentStatus}
                placeholder="Select status"
                isSearchable={false}
              />
            </Field>
          </div>
        </div>

        {/* ── Bill Summary ── */}
        <div
          style={{
            background: "var(--hms-navy)",
            borderRadius: 16,
            padding: "1.5rem",
            marginBottom: "1.25rem",
            color: "#fff",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.95rem",
              fontWeight: 800,
              margin: "0 0 1rem",
              opacity: 0.9,
            }}
          >
            Bill Summary
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              fontSize: "0.85rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                opacity: 0.75,
              }}
            >
              <span>Room & Stay Charges</span>
              <span>{fmt(roomCharges)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                opacity: 0.75,
              }}
            >
              <span>Additional Items</span>
              <span>{fmt(itemsTotal)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                opacity: 0.75,
              }}
            >
              <span>Discount ({Number(watched.discountPercent) || 0}%)</span>
              <span>−{fmt(discountAmount)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                opacity: 0.75,
              }}
            >
              <span>Tax ({Number(watched.taxPercent) || 0}%)</span>
              <span>+{fmt(taxAmount)}</span>
            </div>
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.15)",
                margin: "6px 0",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 800,
              }}
            >
              <span>Total</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
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
            background: "var(--hms-success)",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
          }}
        >
          <CheckCircle2 size={17} />{" "}
          {existingBill ? "Save Changes" : "Save Bill"}
        </button>
      </form>
    </div>
  );
};

export default IPDBilling;
