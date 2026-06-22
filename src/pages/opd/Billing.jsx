// ─────────────────────────────────────────────────────────────────────────────
// Billing.jsx — Week 3, Saturday
// Final step of the visit chain: Appointment → Consultation → Prescription
// → Billing. Saved directly onto the appointment record. Full PDF/Excel
// invoice export is a dedicated Week 7 task — today's scope is the billing
// form itself and a clean, live-calculated summary.
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
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  DrawerSelect,
} from "../../components/common";
import { useAppointments } from "../../context/AppointmentsContext";
import { usePatients } from "../../context/PatientsContext";
import { billingSchema } from "./opdSchema";

const CONSULTATION_FEES = { OPD: 500, "Follow-up": 300, Emergency: 1000 };
const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Insurance", "Pending"].map(
  (v) => ({ value: v, label: v }),
);
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"].map((v) => ({
  value: v,
  label: v,
}));
const blankItem = { description: "", amount: 0 };

const Billing = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { appointments, updateAppointment } = useAppointments();
  const { patients } = usePatients();

  const appt = appointments.find((a) => a.id === appointmentId);
  const patient = appt?.patientId
    ? patients.find((p) => p.id === appt.patientId)
    : null;
  const existingBill = appt?.billing;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      consultationFee:
        existingBill?.consultationFee ??
        CONSULTATION_FEES[appt?.visitType] ??
        500,
      items: existingBill?.items?.length ? existingBill.items : [],
      discountPercent: existingBill?.discountPercent ?? 0,
      taxPercent: existingBill?.taxPercent ?? 5,
      paymentMethod: existingBill?.paymentMethod ?? "",
      paymentStatus: existingBill?.paymentStatus ?? "Pending",
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watched = useWatch({ control });

  if (!appt) {
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
          This appointment could not be found.
        </p>
        <button
          onClick={() => navigate("/opd/appointments")}
          style={{
            color: "var(--hms-blue)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontFamily: "var(--font-body)",
          }}
        >
          ← Back to Appointments
        </button>
      </div>
    );
  }

  const itemsTotal = (watched.items || []).reduce(
    (sum, item) => sum + (Number(item?.amount) || 0),
    0,
  );
  const subtotal = (Number(watched.consultationFee) || 0) + itemsTotal;
  const discountAmount =
    subtotal * ((Number(watched.discountPercent) || 0) / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * ((Number(watched.taxPercent) || 0) / 100);
  const grandTotal = afterDiscount + taxAmount;
  const fmt = (n) =>
    `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const submit = (data) => {
    updateAppointment({
      ...appt,
      status: "Completed",
      billing: {
        ...data,
        subtotal,
        discountAmount,
        taxAmount,
        total: grandTotal,
        billedOn: dayjs().format("YYYY-MM-DD"),
      },
    });
    toast.success("Bill saved — visit completed", {
      description: `Invoice for ${appt.patientName} — ${fmt(grandTotal)}`,
    });
    navigate("/opd/appointments");
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
        .bill-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
        @media (max-width: 540px) { .bill-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <button
        onClick={() => navigate("/opd/appointments")}
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
        <ArrowLeft size={15} /> Back to Appointments
      </button>

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
            {appt.patientName}
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
            {appt.doctor} · {dayjs(appt.date).format("D MMM YYYY")}
          </p>
        </div>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            background: "var(--hms-blue-light)",
            color: "var(--hms-blue)",
            fontSize: "0.72rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {appt.visitType}
        </span>
      </div>

      {(appt.diagnosis || appt.prescription) && (
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
              fontSize: "0.68rem",
              fontWeight: 800,
              color: "var(--hms-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              margin: "0 0 0.5rem",
            }}
          >
            From Consultation & Prescription
          </p>
          {appt.diagnosis && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--hms-navy)",
                margin: "0 0 4px",
                fontWeight: 600,
              }}
            >
              Diagnosis:{" "}
              <span style={{ fontWeight: 500, color: "#475569" }}>
                {appt.diagnosis}
              </span>
            </p>
          )}
          {appt.prescription?.medicines?.length > 0 && (
            <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0 }}>
              Prescribed:{" "}
              {appt.prescription.medicines.map((m) => m.medicine).join(", ")}
            </p>
          )}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
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
            <Receipt size={16} style={{ color: "var(--hms-blue)" }} /> Charges
          </h2>

          <div style={{ marginBottom: "1rem" }}>
            <Field
              label="Consultation Fee (₹)"
              required
              error={errors.consultationFee?.message}
            >
              <Input
                {...register("consultationFee")}
                type="number"
                min="0"
                error={errors.consultationFee}
              />
            </Field>
          </div>

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
                  <div style={{ flex: 1 }}>
                    <Field
                      label={index === 0 ? "Additional Items" : undefined}
                      error={errors.items?.[index]?.description?.message}
                    >
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="e.g. Lab Test - CBC"
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
            <Plus size={14} /> Add Item (lab test, procedure, etc.)
          </button>
        </div>

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
          <div className="bill-grid-2">
            <Field label="Discount (%)" error={errors.discountPercent?.message}>
              <Input
                {...register("discountPercent")}
                type="number"
                min="0"
                max="100"
                error={errors.discountPercent}
              />
            </Field>
            <Field label="Tax / GST (%)" error={errors.taxPercent?.message}>
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
              <DrawerSelect
                name="paymentMethod"
                control={control}
                options={PAYMENT_METHODS}
                error={errors.paymentMethod}
                placeholder="Select method"
              />
            </Field>
            <Field
              label="Payment Status"
              required
              error={errors.paymentStatus?.message}
            >
              <DrawerSelect
                name="paymentStatus"
                control={control}
                options={PAYMENT_STATUSES}
                error={errors.paymentStatus}
                placeholder="Select status"
              />
            </Field>
          </div>
        </div>

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
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
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
          <CheckCircle2 size={17} /> Save Bill & Finish
        </button>
      </form>
    </div>
  );
};

export default Billing;
