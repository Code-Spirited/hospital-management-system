// ─────────────────────────────────────────────────────────────────────────────
// SalesBilling.jsx — Week 5, Thursday
//
// The highest-frequency screen in the Pharmacy module — built for speed.
// Searching a medicine and adding it to the cart auto-assigns the Active
// batch with the nearest expiry (FEFO), shown transparently with a
// "Dispense Next" label; a pharmacist can override to a different batch
// via a dropdown if genuinely needed, but the default always respects
// FEFO. Stock is validated per-line against the SPECIFIC batch assigned,
// not the medicine's aggregate total — a cart line can never request
// more than that one batch actually has on hand.
//
// SCOPE NOTE: "Load from Prescription" (pulling a patient's OPD-
// prescribed medicines directly into the cart) is deliberately deferred.
// It requires fuzzy-matching a doctor's free-text prescription entry
// (e.g. "Paracetamol 500mg") against this catalog's structured Medicine
// records, which is a real matching problem needing its own careful
// pass — not attempted today. This page fully supports manual medicine
// selection for OPD/IPD patients and walk-in customers.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Search,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  History,
} from "lucide-react";
import {
  FormField as Field,
  FormSelect,
  FormInput as Input,
} from "../../components/common";
import { usePharmacy } from "../../context/PharmacyContext";
import { usePatients } from "../../context/PatientsContext";
import { useIPD } from "../../context/IPDContext";
import { getActiveBatches, getTotalQuantity } from "./pharmacyUtils";
import { salesBillingSchema } from "./pharmacySchema";

const CUSTOMER_TYPE_OPTIONS = ["OPD Patient", "IPD Patient", "Walk-in"].map(
  (v) => ({ value: v, label: v }),
);
const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Insurance", "Pending"].map(
  (v) => ({ value: v, label: v }),
);
const PAYMENT_STATUSES = ["Paid", "Pending", "Partial"].map((v) => ({
  value: v,
  label: v,
}));

const fmt = (n) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const SalesBilling = () => {
  const { medicines, batches, sales, recordSale } = usePharmacy();
  const { patients } = usePatients();
  const { admissions } = useIPD();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]); // { medicineId, batchId, quantity, unitPrice }
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(salesBillingSchema),
    defaultValues: {
      customerType: "",
      patientId: "",
      walkInName: "",
      walkInPhone: "",
      discountPercent: 0,
      paymentMethod: "",
      paymentStatus: "Pending",
    },
  });
  const customerType = useWatch({ control, name: "customerType" });

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.id} · ${p.age}y, ${p.gender}`,
  }));
  const admittedOptions = admissions
    .filter((a) => a.status === "Admitted")
    .map((a) => ({
      value: a.patientId,
      label: `${a.patientName} — ${a.patientId} · ${a.wardType}`,
    }));

  // Search results: medicines matching the typed query with at least one
  // unit of Active stock somewhere. Each result shows its FEFO-next
  // batch inline, so the correct batch is visible before it's even added.
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return medicines
      .filter((m) =>
        `${m.brandName} ${m.genericName}`.toLowerCase().includes(q),
      )
      .map((m) => {
        const active = getActiveBatches(m.id, batches).sort(
          (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
        );
        return {
          medicine: m,
          fefoNext: active[0] || null,
          totalQty: getTotalQuantity(m.id, batches),
        };
      })
      .filter((r) => r.totalQty > 0)
      .slice(0, 8);
  }, [searchQuery, medicines, batches]);

  const addToCart = (medicine, batch) => {
    if (cart.some((c) => c.batchId === batch.id)) {
      toast("Already in cart", {
        description: "Adjust the quantity on that line instead.",
      });
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        medicineId: medicine.id,
        batchId: batch.id,
        quantity: 1,
        unitPrice: batch.mrp,
      },
    ]);
    setSearchQuery("");
  };

  const updateCartQuantity = (batchId, quantity) => {
    setCart((prev) =>
      prev.map((c) => (c.batchId === batchId ? { ...c, quantity } : c)),
    );
  };

  const changeCartBatch = (oldBatchId, newBatchId) => {
    const newBatch = batches.find((b) => b.id === newBatchId);
    setCart((prev) =>
      prev.map((c) =>
        c.batchId === oldBatchId
          ? { ...c, batchId: newBatchId, unitPrice: newBatch.mrp, quantity: 1 }
          : c,
      ),
    );
  };

  const removeFromCart = (batchId) =>
    setCart((prev) => prev.filter((c) => c.batchId !== batchId));

  // Per-line stock check — against the SPECIFIC assigned batch, not the
  // medicine's total. A line can never be confirmed with a quantity
  // greater than that one batch actually holds.
  const cartWithDetails = cart.map((item) => {
    const medicine = medicines.find((m) => m.id === item.medicineId);
    const batch = batches.find((b) => b.id === item.batchId);
    const allBatchesForMedicine = getActiveBatches(
      item.medicineId,
      batches,
    ).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    const isFefoNext = allBatchesForMedicine[0]?.id === item.batchId;
    const exceedsStock = item.quantity > (batch?.quantity ?? 0);
    return {
      ...item,
      medicine,
      batch,
      allBatchesForMedicine,
      isFefoNext,
      exceedsStock,
      lineTotal: item.quantity * item.unitPrice,
    };
  });

  const hasStockIssue = cartWithDetails.some((c) => c.exceedsStock);
  const subtotal = cartWithDetails.reduce((sum, c) => sum + c.lineTotal, 0);
  const discountPercent = useWatch({ control, name: "discountPercent" }) || 0;
  const discountAmount = subtotal * (Number(discountPercent) / 100);
  const taxableAmount = subtotal - discountAmount;
  // GST is genuinely batch/medicine-specific (each medicine carries its
  // own gstPercent) — computed per-line, then summed, rather than one
  // flat rate applied to the whole cart.
  const taxAmount = cartWithDetails.reduce((sum, c) => {
    const lineAfterDiscount = c.lineTotal * (1 - Number(discountPercent) / 100);
    return sum + lineAfterDiscount * ((c.medicine?.gstPercent ?? 0) / 100);
  }, 0);
  const grandTotal = taxableAmount + taxAmount;

  const submit = async (data) => {
    if (cart.length === 0) {
      toast.error("Cart is empty", {
        description: "Add at least one medicine before completing the sale.",
      });
      return;
    }
    if (hasStockIssue) {
      toast.error("Fix stock issues first", {
        description:
          "One or more items exceed the selected batch's available quantity.",
      });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const patient = data.patientId
      ? patients.find((p) => p.id === data.patientId) ||
        admissions.find((a) => a.patientId === data.patientId)
      : null;
    const sale = recordSale({
      customerType: data.customerType,
      customerName:
        data.customerType === "Walk-in"
          ? data.walkInName
          : patient?.name || patient?.patientName || "Unknown",
      customerPhone:
        data.customerType === "Walk-in"
          ? data.walkInPhone
          : patient?.phone || "",
      patientId: data.patientId || null,
      items: cartWithDetails.map((c) => ({
        medicineId: c.medicineId,
        batchId: c.batchId,
        brandName: c.medicine.brandName,
        batchNumber: c.batch.batchNumber,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        gstPercent: c.medicine.gstPercent,
      })),
      subtotal,
      discountPercent: Number(discountPercent),
      discountAmount,
      taxAmount,
      total: grandTotal,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      soldOn: dayjs().format("YYYY-MM-DD"),
    });

    setSubmitting(false);
    toast.success("Sale completed", {
      description: `Receipt ${sale.id} · ${fmt(grandTotal)} · ${cart.length} ${cart.length === 1 ? "item" : "items"}`,
    });

    // Deliberately stays on this page rather than navigating away — both
    // source documents describe Sales Billing as the module's highest-
    // frequency screen, serving patients continuously throughout the
    // day. Redirecting after every single sale would force a pharmacist
    // to re-navigate back here before ringing up the next customer,
    // which is exactly the wrong kind of friction on a speed-critical
    // screen. Cart and customer details reset instead, ready
    // immediately for the next sale.
    setCart([]);
    reset({
      customerType: "",
      patientId: "",
      walkInName: "",
      walkInPhone: "",
      discountPercent: 0,
      paymentMethod: "",
      paymentStatus: "Pending",
    });
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 900,
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
            <ShoppingCart size={14} style={{ color: "var(--hms-blue)" }} />
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
            Pharmacy · Sales Billing
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
          New Sale
        </h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* ── Customer ── */}
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
              margin: "0 0 1rem",
            }}
          >
            Customer
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <Field
              label="Sale For"
              required
              error={errors.customerType?.message}
            >
              <FormSelect
                name="customerType"
                control={control}
                options={CUSTOMER_TYPE_OPTIONS}
                error={errors.customerType}
                placeholder="Select"
                isSearchable={false}
              />
            </Field>
            {customerType === "OPD Patient" && (
              <Field label="Patient" required error={errors.patientId?.message}>
                <FormSelect
                  name="patientId"
                  control={control}
                  options={patientOptions}
                  error={errors.patientId}
                  placeholder="Search patient"
                  isSearchable
                />
              </Field>
            )}
            {customerType === "IPD Patient" && (
              <Field
                label="Admitted Patient"
                required
                error={errors.patientId?.message}
              >
                <FormSelect
                  name="patientId"
                  control={control}
                  options={admittedOptions}
                  error={errors.patientId}
                  placeholder="Search admitted patient"
                  isSearchable
                />
              </Field>
            )}
            {customerType === "Walk-in" && (
              <>
                <Field
                  label="Customer Name"
                  required
                  error={errors.walkInName?.message}
                >
                  <Input
                    {...register("walkInName")}
                    placeholder="Full name"
                    error={errors.walkInName}
                  />
                </Field>
                <Field label="Phone Number" hint="Optional">
                  <Input
                    {...register("walkInPhone")}
                    type="tel"
                    maxLength={10}
                    placeholder="Optional"
                  />
                </Field>
              </>
            )}
          </div>
        </div>

        {/* ── Medicine search ── */}
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
              margin: "0 0 1rem",
            }}
          >
            Add Medicine
          </h2>
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or generic name..."
              autoFocus
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 11,
                fontSize: "0.92rem",
                fontFamily: "var(--font-body)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {searchResults.length > 0 && (
            <div
              style={{
                marginTop: "0.875rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {searchResults.map(({ medicine, fefoNext, totalQty }) => (
                <button
                  key={medicine.id}
                  type="button"
                  onClick={() => fefoNext && addToCart(medicine, fefoNext)}
                  disabled={!fefoNext}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "0.75rem 1rem",
                    borderRadius: 10,
                    border: "1.5px solid var(--hms-border)",
                    background: "#fff",
                    cursor: fefoNext ? "pointer" : "not-allowed",
                    textAlign: "left",
                    fontFamily: "var(--font-body)",
                    width: "100%",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "var(--hms-navy)",
                      }}
                    >
                      {medicine.brandName}{" "}
                      <span style={{ fontWeight: 500, color: "#94a3b8" }}>
                        · {medicine.genericName} · {medicine.strength}
                      </span>
                    </p>
                    {fefoNext && (
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: "0.76rem",
                          color: "var(--hms-success)",
                          fontWeight: 600,
                        }}
                      >
                        Batch {fefoNext.batchNumber} · Exp{" "}
                        {dayjs(fefoNext.expiryDate).format("MMM YYYY")} ·{" "}
                        {fmt(fefoNext.mrp)}/unit
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#64748b",
                      flexShrink: 0,
                    }}
                  >
                    {totalQty} in stock
                  </span>
                </button>
              ))}
            </div>
          )}
          {searchQuery.trim() && searchResults.length === 0 && (
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.82rem",
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              No medicines with available stock match "{searchQuery}".
            </p>
          )}
        </div>

        {/* ── Cart ── */}
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
              margin: "0 0 1rem",
            }}
          >
            Cart ({cart.length})
          </h2>
          {cartWithDetails.length === 0 ? (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                margin: 0,
                textAlign: "center",
                padding: "1.5rem 0",
              }}
            >
              Search and add medicines above to begin.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {cartWithDetails.map((c) => (
                <div
                  key={c.batchId}
                  style={{
                    border: `1.5px solid ${c.exceedsStock ? "#dc2626" : "var(--hms-border)"}`,
                    borderRadius: 11,
                    padding: "0.875rem 1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: "var(--hms-navy)",
                        }}
                      >
                        {c.medicine.brandName}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "0.76rem",
                          color: "#94a3b8",
                        }}
                      >
                        {c.medicine.genericName} · {c.medicine.strength}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(c.batchId)}
                      style={{
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
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.6fr 0.8fr 0.8fr",
                      gap: "0.75rem",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        Batch
                      </label>
                      <select
                        value={c.batchId}
                        onChange={(e) =>
                          changeCartBatch(c.batchId, e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.625rem",
                          border: "1.5px solid var(--hms-border)",
                          borderRadius: 8,
                          fontSize: "0.8rem",
                          fontFamily: "var(--font-body)",
                          background: "#fff",
                        }}
                      >
                        {c.allBatchesForMedicine.map((b, i) => (
                          <option key={b.id} value={b.id}>
                            {b.batchNumber} · Exp{" "}
                            {dayjs(b.expiryDate).format("MMM YY")} ·{" "}
                            {b.quantity} left{i === 0 ? " (FEFO)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={c.quantity}
                        onChange={(e) =>
                          updateCartQuantity(
                            c.batchId,
                            Math.max(1, Number(e.target.value) || 1),
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.625rem",
                          border: `1.5px solid ${c.exceedsStock ? "#dc2626" : "var(--hms-border)"}`,
                          borderRadius: 8,
                          fontSize: "0.85rem",
                          fontFamily: "var(--font-body)",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        Total
                      </label>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.92rem",
                          fontWeight: 800,
                          color: "var(--hms-navy)",
                          padding: "0.5rem 0",
                        }}
                      >
                        {fmt(c.lineTotal)}
                      </p>
                    </div>
                  </div>

                  {!c.isFefoNext && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "0.72rem",
                        color: "#d97706",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Info size={12} /> This isn't the nearest-expiry batch — a
                      different, more urgent batch is available.
                    </p>
                  )}
                  {c.exceedsStock && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "0.72rem",
                        color: "#dc2626",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <AlertTriangle size={12} /> Only {c.batch.quantity} units
                      available in this batch.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Payment ── */}
        {cart.length > 0 && (
          <>
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
                  margin: "0 0 1rem",
                }}
              >
                Payment
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1rem",
                }}
              >
                <Field
                  label="Discount (%)"
                  error={errors.discountPercent?.message}
                >
                  <Input
                    {...register("discountPercent")}
                    type="number"
                    min="0"
                    max="100"
                    error={errors.discountPercent}
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
                    placeholder="Select"
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
                    placeholder="Select"
                    isSearchable={false}
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
                  <span>Discount ({Number(discountPercent) || 0}%)</span>
                  <span>−{fmt(discountAmount)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    opacity: 0.75,
                  }}
                >
                  <span>GST (per item)</span>
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
              disabled={submitting || hasStockIssue}
              onClick={handleSubmit(submit)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                justifyContent: "center",
                padding: "0.85rem 1rem",
                border: "none",
                borderRadius: 12,
                background:
                  submitting || hasStockIssue
                    ? "#94a3b8"
                    : "var(--hms-success)",
                color: "#fff",
                cursor: submitting || hasStockIssue ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                fontWeight: 700,
                boxShadow:
                  submitting || hasStockIssue
                    ? "none"
                    : "0 4px 14px rgba(5,150,105,0.3)",
              }}
            >
              <CheckCircle2 size={18} />{" "}
              {submitting
                ? "Completing Sale..."
                : `Complete Sale — ${fmt(grandTotal)}`}
            </button>
          </>
        )}
      </form>

      {/* ── Recent Sales — the visible confirmation that completed sales
          are actually being recorded, now that this page stays open
          across many consecutive sales instead of redirecting away
          after each one. Newest first, capped at 10 so it stays a quick
          glance rather than growing into its own full history page —
          that's Reports' job later in the project. */}
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
          Sales
        </h2>
        {sales.length === 0 ? (
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
              No sales recorded yet this session.
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
            {sales.slice(0, 10).map((s) => (
              <div
                key={s.id}
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
                    {s.customerName}{" "}
                    <span style={{ fontWeight: 500, color: "#94a3b8" }}>
                      · {s.customerType}
                    </span>
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "0.76rem",
                      color: "#64748b",
                    }}
                  >
                    {s.items
                      .map((i) => `${i.brandName} ×${i.quantity}`)
                      .join(", ")}
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
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      background:
                        s.paymentStatus === "Paid"
                          ? "var(--hms-success-bg)"
                          : s.paymentStatus === "Partial"
                            ? "#fffbeb"
                            : "var(--hms-danger-bg)",
                      color:
                        s.paymentStatus === "Paid"
                          ? "var(--hms-success)"
                          : s.paymentStatus === "Partial"
                            ? "#d97706"
                            : "#dc2626",
                    }}
                  >
                    {s.paymentStatus}
                  </span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: "var(--hms-navy)",
                    }}
                  >
                    {fmt(s.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesBilling;
