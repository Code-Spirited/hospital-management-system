// ─────────────────────────────────────────────────────────────────────────────
// AddMedicine.jsx — Week 5, Tuesday
//
// Adds one new medicine (batch record) to the pharmacy register. A full
// page, not a drawer, so it uses FormSelect (the portal-based dropdown)
// rather than DrawerSelect — same reasoning as IPD's AdmissionForm.
//
// NOTE ON DATA MODEL: this form treats "add a medicine" as "add one
// batch" — matching exactly how pharmacyData.js's seed records are
// already structured (each has its own batchNumber + expiryDate). Real
// pharmacy software usually separates a drug CATALOG from individual
// stock BATCHES so the same drug arriving again later adds to existing
// stock rather than creating a second row. That's a deliberate scope
// boundary for today, flagged for a future Purchase/Stock-In flow —
// not an oversight.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Pill, CheckCircle2 } from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormSelect,
  DateInput,
} from "../../components/common";
import Abbr from "../../components/common/Abbr/Abbr";
import { usePharmacy } from "../../context/PharmacyContext";
import { generateId } from "../../utils/generateId";
import {
  SCHEDULE_CONFIG,
  CATEGORIES,
  DOSAGE_FORMS,
  STORAGE_CONDITIONS,
  GST_SLABS,
} from "./pharmacyData";
import { medicineSchema } from "./pharmacySchema";

const opt = (v) => ({ value: v, label: v });
const CATEGORY_OPTIONS = CATEGORIES.map(opt);
const DOSAGE_FORM_OPTIONS = DOSAGE_FORMS.map(opt);
const STORAGE_OPTIONS = STORAGE_CONDITIONS.map(opt);
const SCHEDULE_OPTIONS = Object.keys(SCHEDULE_CONFIG).map(opt);
const GST_OPTIONS = GST_SLABS.map((v) => ({
  value: String(v),
  label: `${v}%`,
}));

const AddMedicine = () => {
  const navigate = useNavigate();
  const { addMedicine } = usePharmacy();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      brandName: "",
      genericName: "",
      strength: "",
      category: "",
      dosageForm: "",
      manufacturer: "",
      batchNumber: "",
      schedule: "",
      storageCondition: "",
      quantity: "",
      reorderLevel: "",
      unitPrice: "",
      mrp: "",
      gstPercent: "12",
      expiryDate: "",
    },
  });

  const submit = async (data) => {
    setSubmitting(true);
    const isoExpiry = dayjs(data.expiryDate, "DD-MM-YYYY").format("YYYY-MM-DD");
    await new Promise((r) => setTimeout(r, 500));
    const newId = generateId("MED", 100, 900);
    addMedicine({
      id: newId,
      ...data,
      quantity: Number(data.quantity),
      reorderLevel: Number(data.reorderLevel),
      unitPrice: Number(data.unitPrice),
      mrp: Number(data.mrp),
      gstPercent: Number(data.gstPercent),
      expiryDate: isoExpiry,
    });
    setSubmitting(false);
    toast.success("Medicine added", {
      description: `${data.brandName} · Batch ${data.batchNumber}`,
    });
    navigate("/pharmacy");
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 780,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
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
            <Pill size={14} style={{ color: "var(--hms-blue)" }} />
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
            Pharmacy · New Medicine
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
          Add Medicine
        </h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* ── Identification ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
            }}
          >
            Medicine Identification
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <Field
              label="Brand Name"
              required
              error={errors.brandName?.message}
            >
              <Input
                {...register("brandName")}
                placeholder="e.g. Crocin 650"
                error={errors.brandName}
              />
            </Field>
            <Field
              label="Generic Name"
              required
              error={errors.genericName?.message}
              hint="The actual drug compound"
            >
              <Input
                {...register("genericName")}
                placeholder="e.g. Paracetamol"
                error={errors.genericName}
              />
            </Field>
            <Field label="Strength" required error={errors.strength?.message}>
              <Input
                {...register("strength")}
                placeholder="e.g. 500mg, or — if not applicable"
                error={errors.strength}
              />
            </Field>
            <Field label="Category" required error={errors.category?.message}>
              <FormSelect
                name="category"
                control={control}
                options={CATEGORY_OPTIONS}
                error={errors.category}
                placeholder="Select category"
                isSearchable
              />
            </Field>
            <Field
              label="Dosage Form"
              required
              error={errors.dosageForm?.message}
            >
              <FormSelect
                name="dosageForm"
                control={control}
                options={DOSAGE_FORM_OPTIONS}
                error={errors.dosageForm}
                placeholder="Select form"
                isSearchable={false}
              />
            </Field>
            <Field
              label="Drug Schedule"
              required
              error={errors.schedule?.message}
              hint="India's Drugs and Cosmetics Rules classification"
            >
              <FormSelect
                name="schedule"
                control={control}
                options={SCHEDULE_OPTIONS}
                error={errors.schedule}
                placeholder="Select schedule"
                isSearchable={false}
              />
            </Field>
          </div>
        </div>

        {/* ── Sourcing ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
            }}
          >
            Sourcing & Storage
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <Field
              label="Manufacturer"
              required
              error={errors.manufacturer?.message}
            >
              <Input
                {...register("manufacturer")}
                placeholder="e.g. GSK, Cipla"
                error={errors.manufacturer}
              />
            </Field>
            <Field
              label="Batch Number"
              required
              error={errors.batchNumber?.message}
            >
              <Input
                {...register("batchNumber")}
                placeholder="e.g. CR2547"
                error={errors.batchNumber}
              />
            </Field>
            <Field
              label="Expiry Date"
              required
              error={errors.expiryDate?.message}
            >
              <DateInput
                {...register("expiryDate")}
                error={errors.expiryDate}
              />
            </Field>
            <Field
              label="Storage Condition"
              required
              error={errors.storageCondition?.message}
            >
              <FormSelect
                name="storageCondition"
                control={control}
                options={STORAGE_OPTIONS}
                error={errors.storageCondition}
                placeholder="Select condition"
                isSearchable={false}
              />
            </Field>
          </div>
        </div>

        {/* ── Stock & Pricing ── */}
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
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
            }}
          >
            Stock & Pricing
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <Field
              label="Quantity in Stock"
              required
              error={errors.quantity?.message}
            >
              <Input
                {...register("quantity")}
                type="number"
                min="0"
                placeholder="e.g. 500"
                error={errors.quantity}
              />
            </Field>
            <Field
              label="Reorder Level"
              required
              error={errors.reorderLevel?.message}
              hint="Triggers a Low Stock flag at or below this count"
            >
              <Input
                {...register("reorderLevel")}
                type="number"
                min="0"
                placeholder="e.g. 150"
                error={errors.reorderLevel}
              />
            </Field>
            <Field
              label="Unit Cost (₹)"
              required
              error={errors.unitPrice?.message}
              hint="Acquisition price per unit"
            >
              <Input
                {...register("unitPrice")}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1.20"
                error={errors.unitPrice}
              />
            </Field>
            <Field
              label={
                <>
                  <Abbr underline={false}>MRP</Abbr> (₹)
                </>
              }
              required
              error={errors.mrp?.message}
            >
              <Input
                {...register("mrp")}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1.80"
                error={errors.mrp}
              />
            </Field>
            <Field
              label={
                <>
                  <Abbr underline={false}>GST</Abbr> Slab
                </>
              }
              required
              error={errors.gstPercent?.message}
            >
              <FormSelect
                name="gstPercent"
                control={control}
                options={GST_OPTIONS}
                error={errors.gstPercent}
                placeholder="Select GST %"
                isSearchable={false}
              />
            </Field>
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
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
            background: submitting ? "#94a3b8" : "var(--hms-success)",
            color: "#fff",
            cursor: submitting ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: submitting ? "none" : "0 4px 14px rgba(5,150,105,0.3)",
          }}
        >
          <CheckCircle2 size={17} /> {submitting ? "Adding..." : "Add Medicine"}
        </button>
      </form>
    </div>
  );
};

export default AddMedicine;
