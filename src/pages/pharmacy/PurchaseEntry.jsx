// ─────────────────────────────────────────────────────────────────────────────
// PurchaseEntry.jsx — rebuilt as a genuine multi-line invoice
//
// One invoice header (supplier, invoice number, purchase date) applied
// once, then a repeatable table of line items — each line independently
// searches the existing Medicine catalog, enters a batch number,
// quantity, cost, MRP, and expiry. Each line's batch number is checked
// live against that specific medicine's existing batches: matching
// restocks it, non-matching creates a new batch. This can NEVER create a
// new Medicine — only Add Medicine does that — which is what makes the
// two screens genuinely distinct now.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Truck,
  Plus,
  Trash2,
  PackageCheck,
  PackagePlus,
  CheckCircle2,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormSelect,
  DateInput,
} from "../../components/common";
import { usePharmacy } from "../../context/PharmacyContext";
import { SUPPLIERS, SHELF_LOCATIONS } from "./pharmacyData";
import { purchaseEntrySchema } from "./pharmacySchema";

const opt = (v) => ({ value: v, label: v });
const SUPPLIER_OPTIONS = SUPPLIERS.map(opt);
const SHELF_OPTIONS = SHELF_LOCATIONS.map(opt);

const blankLine = {
  medicineId: "",
  batchNumber: "",
  quantity: "",
  unitCost: "",
  mrp: "",
  expiryDate: "",
};

// One invoice line — its own component so each line's live
// restock-vs-new-batch check is scoped correctly per row.
const PurchaseLine = ({
  index,
  control,
  register,
  errors,
  remove,
  canRemove,
  medicineOptions,
  batches,
}) => {
  const navigate = useNavigate();
  const medicineId = useWatch({ control, name: `lines.${index}.medicineId` });
  const batchNumber = useWatch({ control, name: `lines.${index}.batchNumber` });

  const matchedBatch =
    medicineId && batchNumber?.trim()
      ? batches.find(
          (b) =>
            b.medicineId === medicineId &&
            b.batchNumber.trim().toLowerCase() ===
              batchNumber.trim().toLowerCase(),
        )
      : null;

  return (
    <div
      style={{
        border: "1.5px solid var(--hms-border)",
        borderRadius: 12,
        padding: "1.125rem",
        paddingTop: "1.375rem",
        position: "relative",
        background: "#fff",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {/* Line number badge — makes multiple line items visually
          distinct from one another at a glance, and gives this card
          the same "numbered step" weight AddMedicine/AdmissionForm use
          elsewhere in the app, rather than reading as a flat, undifferentiated block. */}
      <span
        style={{
          position: "absolute",
          top: -10,
          left: 14,
          padding: "2px 10px",
          borderRadius: 20,
          background: "var(--hms-blue)",
          color: "#fff",
          fontSize: "0.7rem",
          fontWeight: 700,
          fontFamily: "var(--font-body)",
          boxShadow: "0 2px 6px rgba(37,99,235,0.35)",
        }}
      >
        Item {index + 1}
      </span>
      {canRemove && (
        <button
          type="button"
          onClick={() => remove(index)}
          title="Remove line"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "1.5px solid var(--hms-border)",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#dc2626",
          }}
        >
          <Trash2 size={13} />
        </button>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.875rem",
          marginBottom: "0.875rem",
        }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            label="Medicine"
            required
            error={errors?.medicineId?.message}
            hint="Not finding it? It must be registered in the catalog first — see below."
          >
            <FormSelect
              name={`lines.${index}.medicineId`}
              control={control}
              options={medicineOptions}
              error={errors?.medicineId}
              placeholder="Search medicine catalog"
              isSearchable
              noOptionsMessage={() => (
                <div style={{ textAlign: "left", padding: "0.25rem" }}>
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontSize: "0.8rem",
                      color: "#475569",
                      fontWeight: 600,
                      lineHeight: 1.5,
                    }}
                  >
                    This isn't in the catalog yet, which means it's a new
                    medicine. Please register it first.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/pharmacy/add")}
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--hms-blue)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Go to Add Medicine →
                  </button>
                </div>
              )}
            />
          </Field>
        </div>
        <Field
          label="Batch Number"
          required
          error={errors?.batchNumber?.message}
          hint="Existing number restocks it; new number adds a new batch"
        >
          <Input
            {...register(`lines.${index}.batchNumber`)}
            placeholder="e.g. CR2547"
            error={errors?.batchNumber}
          />
        </Field>
        <Field
          label="Quantity Received"
          required
          error={errors?.quantity?.message}
        >
          <Input
            {...register(`lines.${index}.quantity`)}
            type="number"
            min="1"
            placeholder="e.g. 200"
            error={errors?.quantity}
          />
        </Field>
        <Field
          label="Unit Cost Paid (₹)"
          required
          error={errors?.unitCost?.message}
        >
          <Input
            {...register(`lines.${index}.unitCost`)}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1.20"
            error={errors?.unitCost}
          />
        </Field>
        <Field label="MRP This Batch (₹)" required error={errors?.mrp?.message}>
          <Input
            {...register(`lines.${index}.mrp`)}
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1.80"
            error={errors?.mrp}
          />
        </Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            label="Shelf Location"
            required
            error={errors?.shelfLocation?.message}
            hint="Where this batch will physically sit — can differ from other batches of the same medicine"
          >
            <FormSelect
              name={`lines.${index}.shelfLocation`}
              control={control}
              options={SHELF_OPTIONS}
              error={errors?.shelfLocation}
              placeholder="Select shelf location"
              isSearchable={false}
            />
          </Field>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            label="Expiry Date"
            required
            error={errors?.expiryDate?.message}
          >
            <DateInput
              {...register(`lines.${index}.expiryDate`)}
              error={errors?.expiryDate}
            />
          </Field>
        </div>
      </div>

      {medicineId && batchNumber?.trim() && (
        <div
          style={{
            padding: "0.65rem 0.875rem",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: matchedBatch
              ? "var(--hms-success-bg)"
              : "var(--hms-blue-light)",
            border: `1.5px solid ${matchedBatch ? "rgba(5,150,105,0.25)" : "rgba(37,99,235,0.25)"}`,
          }}
        >
          {matchedBatch ? (
            <>
              <PackageCheck
                size={15}
                style={{ color: "var(--hms-success)", flexShrink: 0 }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "0.76rem",
                  color: "var(--hms-success)",
                  fontWeight: 600,
                }}
              >
                Restocking existing batch — currently {matchedBatch.quantity}{" "}
                units on hand.
              </p>
            </>
          ) : (
            <>
              <PackagePlus
                size={15}
                style={{ color: "var(--hms-blue)", flexShrink: 0 }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "0.76rem",
                  color: "var(--hms-blue)",
                  fontWeight: 600,
                }}
              >
                New batch for this medicine.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const PurchaseEntry = () => {
  const navigate = useNavigate();
  const { medicines, batches, recordPurchase } = usePharmacy();
  const [submitting, setSubmitting] = useState(false);

  const medicineOptions = medicines.map((m) => ({
    value: m.id,
    label: `${m.brandName} — ${m.strength} (${m.manufacturer})`,
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(purchaseEntrySchema),
    defaultValues: {
      supplier: "",
      invoiceNumber: "",
      purchaseDate: dayjs().format("DD-MM-YYYY"),
      lines: [blankLine],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const submit = async (data) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const isoDate = dayjs(data.purchaseDate, "DD-MM-YYYY").format("YYYY-MM-DD");
    recordPurchase({
      supplier: data.supplier,
      invoiceNumber: data.invoiceNumber,
      purchaseDate: isoDate,
      lines: data.lines.map((line) => ({
        medicineId: line.medicineId,
        batchNumber: line.batchNumber,
        quantity: Number(line.quantity),
        unitCost: Number(line.unitCost),
        mrp: Number(line.mrp),
        expiryDate: dayjs(line.expiryDate, "DD-MM-YYYY").format("YYYY-MM-DD"),
      })),
    });

    setSubmitting(false);
    toast.success("Purchase recorded", {
      description: `Invoice ${data.invoiceNumber} · ${data.lines.length} ${data.lines.length === 1 ? "line item" : "line items"} received`,
    });
    navigate("/pharmacy");
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 860,
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
            <Truck size={14} style={{ color: "var(--hms-blue)" }} />
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
            Pharmacy · Purchase Entry
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
          Receive Stock
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#64748b",
            margin: "0.4rem 0 0",
          }}
        >
          One invoice can cover several medicines — add a line for each.
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1.5px solid var(--hms-blue)",
            boxShadow: "0 4px 16px rgba(37,99,235,0.08)",
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--hms-blue)",
                display: "inline-block",
              }}
            />
            Invoice Details
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <Field label="Supplier" required error={errors.supplier?.message}>
              <FormSelect
                name="supplier"
                control={control}
                options={SUPPLIER_OPTIONS}
                error={errors.supplier}
                placeholder="Select supplier"
                isSearchable
              />
            </Field>
            <Field
              label="Invoice Number"
              required
              error={errors.invoiceNumber?.message}
            >
              <Input
                {...register("invoiceNumber")}
                placeholder="e.g. INV-88213"
                error={errors.invoiceNumber}
              />
            </Field>
            <Field
              label="Purchase Date"
              required
              error={errors.purchaseDate?.message}
            >
              <DateInput
                {...register("purchaseDate")}
                error={errors.purchaseDate}
              />
            </Field>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 0.875rem",
            }}
          >
            Line Items
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {fields.map((field, index) => (
              <PurchaseLine
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors.lines?.[index]}
                remove={remove}
                canRemove={fields.length > 1}
                medicineOptions={medicineOptions}
                batches={batches}
              />
            ))}
          </div>
          {errors.lines?.message && (
            <p
              style={{
                fontSize: "0.78rem",
                color: "#dc2626",
                fontWeight: 600,
                margin: "0.5rem 0 0",
              }}
            >
              {errors.lines.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => append(blankLine)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginTop: "0.875rem",
              padding: "0.6rem 1.125rem",
              border: "1.5px dashed var(--hms-border-2)",
              borderRadius: 10,
              background: "var(--hms-surface)",
              color: "var(--hms-blue)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: "0.825rem",
              fontWeight: 700,
            }}
          >
            <Plus size={15} /> Add Another Medicine
          </button>
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
          {submitting ? "Recording..." : "Record Purchase"}
        </button>
      </form>
    </div>
  );
};

export default PurchaseEntry;
