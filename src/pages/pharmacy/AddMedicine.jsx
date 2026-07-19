// ─────────────────────────────────────────────────────────────────────────────
// AddMedicine.jsx — rebuilt for the two-tier model
//
// Now creates ONLY a Product-tier Medicine record — no quantity, batch
// number, or expiry date anywhere on this form. A newly added medicine
// starts with zero stock, which is correct: it now exists in the
// catalog, but nothing has been received yet. Receiving its first
// shipment is Purchase Entry's job, not this form's.
//
// Week 8, Thursday — responsive fix: this form has 10 fields in a single
// fixed repeat(2, 1fr) grid with no mobile fallback — the densest
// unguarded grid found in the responsive audit. Now uses .medicine-grid-2,
// the same named-class + @media (max-width: 540px) pattern already used
// in Billing.jsx / Prescription.jsx / IPDBilling.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pill, CheckCircle2 } from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormSelect,
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
      schedule: "",
      storageCondition: "",
      reorderLevel: "150",
      gstPercent: "12",
    },
  });

  const submit = async (data) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    const newId = generateId("M", 100, 900);
    addMedicine({
      id: newId,
      ...data,
      reorderLevel: Number(data.reorderLevel),
      gstPercent: Number(data.gstPercent),
    });
    setSubmitting(false);
    toast.success("Medicine added to catalog", {
      description: `${data.brandName} is now catalogued — receive its first batch via Purchase Entry.`,
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
      <style>{`
        .medicine-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (max-width: 540px) { .medicine-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

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
        <p
          style={{
            fontSize: "0.85rem",
            color: "#64748b",
            margin: "0.4rem 0 0",
          }}
        >
          This registers the medicine in the catalog only. Stock is received
          separately via Purchase Entry.
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
          <div className="medicine-grid-2">
            <Field
              label="Medicine Name"
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
            <Field
              label="Strength"
              required
              error={errors.strength?.message}
              hint="A different strength is a different medicine (e.g. Crocin 500 vs 650)"
            >
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
            <Field
              label="Storage Condition"
              required
              error={errors.storageCondition?.message}
              hint="This drug's required environment — not where it sits on a shelf"
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
            <Field
              label="Reorder Level"
              required
              error={errors.reorderLevel?.message}
              hint="Total stock across all batches at or below this triggers Low Stock"
            >
              <Input
                {...register("reorderLevel")}
                type="number"
                min="0"
                placeholder="e.g. 150"
                error={errors.reorderLevel}
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
          <CheckCircle2 size={17} />{" "}
          {submitting ? "Adding..." : "Add to Catalog"}
        </button>
      </form>
    </div>
  );
};

export default AddMedicine;
