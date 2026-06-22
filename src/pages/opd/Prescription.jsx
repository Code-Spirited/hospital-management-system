// ─────────────────────────────────────────────────────────────────────────────
// Prescription.jsx — Week 3, Friday
// Reached via /opd/prescription/:appointmentId, either straight after
// completing a consultation, or later via "Edit Prescription" on a
// Completed appointment. Saved directly onto the appointment record —
// Week 5's Pharmacy module will read prescriptions from here.
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Pill,
  Plus,
  Trash2,
  ArrowLeft,
  User2,
  ClipboardCheck,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
  DrawerSelect,
} from "../../components/common";
import { useAppointments } from "../../context/AppointmentsContext";
import { usePatients } from "../../context/PatientsContext";
import { prescriptionSchema } from "./opdSchema";

const FREQUENCY_OPTIONS = [
  "Once daily (OD)",
  "Twice daily (BD)",
  "Three times daily (TDS)",
  "Four times daily (QID)",
  "As needed (SOS)",
].map((v) => ({ value: v, label: v }));

const blankMedicine = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const Prescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { appointments, updateAppointment } = useAppointments();
  const { patients } = usePatients();

  const appt = appointments.find((a) => a.id === appointmentId);
  const patient = appt?.patientId
    ? patients.find((p) => p.id === appt.patientId)
    : null;
  const existingRx = appt?.prescription;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medicines: existingRx?.medicines?.length
        ? existingRx.medicines
        : [blankMedicine],
      generalAdvice: existingRx?.generalAdvice ?? "",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines",
  });

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

  const saveAndContinue = (data) => {
    updateAppointment({
      ...appt,
      status: "Prescribed",
      prescription: {
        medicines: data.medicines,
        generalAdvice: data.generalAdvice,
        issuedOn: dayjs().format("YYYY-MM-DD"),
      },
    });
    toast.success("Prescription saved", {
      description: "Now let's generate the bill.",
    });
    navigate(`/opd/billing/${appt.id}`);
  };

  const saveAndComplete = (data) => {
    updateAppointment({
      ...appt,
      status: "Completed",
      prescription: {
        medicines: data.medicines,
        generalAdvice: data.generalAdvice,
        issuedOn: dayjs().format("YYYY-MM-DD"),
      },
    });
    toast.success("Prescription saved & visit completed");
    navigate("/opd/appointments");
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <style>{`
        .rx-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
        @media (max-width: 600px) { .rx-grid { grid-template-columns: 1fr; } }
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

      {/* Patient + diagnosis summary */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "flex-start",
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
          {appt.diagnosis && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px solid var(--hms-border)",
                width: "100%",
              }}
            >
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "var(--hms-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "0 0 5px",
                }}
              >
                From Consultation
              </p>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--hms-navy)",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                Diagnosis:{" "}
                <span style={{ fontWeight: 500, color: "#475569" }}>
                  {appt.diagnosis}
                </span>
              </p>
              {appt.vitals && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#64748b",
                    margin: "4px 0 0",
                  }}
                >
                  BP {appt.vitals.bloodPressure} · Temp{" "}
                  {appt.vitals.temperature}°F · Pulse {appt.vitals.pulse} bpm
                  {appt.vitals.weight ? ` · ${appt.vitals.weight} kg` : ""}
                  {appt.vitals.spo2 ? ` · SpO2 ${appt.vitals.spo2}%` : ""}
                </p>
              )}
              {appt.notes && (
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#64748b",
                    margin: "4px 0 0",
                  }}
                >
                  Notes: {appt.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Medicine rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
            marginBottom: "0.875rem",
          }}
        >
          {fields.map((field, index) => (
            <div
              key={field.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid var(--hms-border)",
                boxShadow: "var(--shadow-xs)",
                padding: "1.25rem 1.5rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      color: "var(--hms-navy)",
                    }}
                  >
                    Rx #{index + 1}
                  </span>
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    title="Remove medicine"
                    style={{
                      width: 30,
                      height: 30,
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
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="rx-grid">
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field
                    label="Medicine Name"
                    required
                    error={errors.medicines?.[index]?.medicine?.message}
                  >
                    <Input
                      {...register(`medicines.${index}.medicine`)}
                      placeholder="e.g. Paracetamol 500mg"
                      error={errors.medicines?.[index]?.medicine}
                    />
                  </Field>
                </div>
                <Field
                  label="Dosage"
                  required
                  error={errors.medicines?.[index]?.dosage?.message}
                >
                  <Input
                    {...register(`medicines.${index}.dosage`)}
                    placeholder="e.g. 1 tablet"
                    error={errors.medicines?.[index]?.dosage}
                  />
                </Field>
                <Field
                  label="Duration"
                  required
                  error={errors.medicines?.[index]?.duration?.message}
                >
                  <Input
                    {...register(`medicines.${index}.duration`)}
                    placeholder="e.g. 5 days"
                    error={errors.medicines?.[index]?.duration}
                  />
                </Field>
                <Field
                  label="Frequency"
                  required
                  error={errors.medicines?.[index]?.frequency?.message}
                >
                  <DrawerSelect
                    name={`medicines.${index}.frequency`}
                    control={control}
                    options={FREQUENCY_OPTIONS}
                    error={errors.medicines?.[index]?.frequency}
                    placeholder="Select frequency"
                  />
                </Field>
                <Field label="Instructions">
                  <Input
                    {...register(`medicines.${index}.instructions`)}
                    placeholder="e.g. After food"
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append(blankMedicine)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "0.6rem 1.125rem",
            border: "1.5px dashed var(--hms-border-2)",
            borderRadius: 10,
            background: "var(--hms-surface)",
            color: "var(--hms-blue)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.825rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
          }}
        >
          <Plus size={15} /> Add Medicine
        </button>

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
          <Field
            label="General Advice"
            hint="Diet, lifestyle, or follow-up notes (optional)"
          >
            <Textarea
              {...register("generalAdvice")}
              placeholder="e.g. Plenty of fluids, avoid spicy food, follow up in 1 week if symptoms persist..."
            />
          </Field>
        </div>

        <button
          type="button"
          onClick={handleSubmit(saveAndContinue)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            justifyContent: "center",
            padding: "0.75rem 1rem",
            border: "none",
            borderRadius: 12,
            background: "var(--hms-blue)",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
            marginBottom: "0.75rem",
          }}
        >
          <ClipboardCheck size={17} /> Save & Generate Bill
        </button>
        <button
          type="button"
          onClick={handleSubmit(saveAndComplete)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            justifyContent: "center",
            padding: "0.7rem 1rem",
            border: "1.5px solid var(--hms-border)",
            borderRadius: 12,
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          No billing needed — Mark Complete
        </button>
      </form>
    </div>
  );
};

export default Prescription;
