// ─────────────────────────────────────────────────────────────────────────────
// Consultation.jsx - Week 3, Thursday
// Reached via /opd/consultation/:appointmentId from a Scheduled appointment's
// "Start Consultation" action. Completing it marks that appointment
// Completed and stores the clinical record directly on it via the existing
// AppointmentsContext - no new data layer needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Activity,
  Stethoscope,
  ClipboardCheck,
  User2,
  ArrowLeft,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
} from "../../components/common";
import { useAppointments } from "../../context/AppointmentsContext";
import { usePatients } from "../../context/PatientsContext";
import { consultationSchema } from "./opdSchema";

const Consultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { appointments, updateAppointment } = useAppointments();
  const { patients } = usePatients();

  const appt = appointments.find((a) => a.id === appointmentId);
  const patient = appt?.patientId
    ? patients.find((p) => p.id === appt.patientId)
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(consultationSchema),
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

  const submit = (data) => {
    updateAppointment({
      ...appt,
      status: "Completed",
      vitals: data,
      diagnosis: data.diagnosis,
      notes: data.notes,
      advice: data.advice,
    });
    toast.success("Consultation saved", {
      description: "Now let's write the prescription.",
    });
    navigate(`/opd/prescription/${appt.id}`);
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
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
            {patient
              ? `${patient.age} yrs · ${patient.gender} · ${patient.bloodGroup || "Blood group unknown"} · `
              : "No registered patient record linked · "}
            {appt.doctor} · {dayjs(appt.date).format("D MMM YYYY")} at{" "}
            {appt.time}
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
            <Activity size={16} style={{ color: "var(--hms-blue)" }} /> Vitals
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
            }}
          >
            <Field
              label="Blood Pressure"
              required
              error={errors.bloodPressure?.message}
            >
              <Input
                {...register("bloodPressure")}
                placeholder="e.g. 120/80"
                error={errors.bloodPressure}
              />
            </Field>
            <Field
              label="Temperature (°F)"
              required
              error={errors.temperature?.message}
            >
              <Input
                {...register("temperature")}
                placeholder="e.g. 98.6"
                error={errors.temperature}
              />
            </Field>
            <Field label="Pulse (bpm)" required error={errors.pulse?.message}>
              <Input
                {...register("pulse")}
                placeholder="e.g. 72"
                error={errors.pulse}
              />
            </Field>
            <Field label="Weight (kg)">
              <Input {...register("weight")} placeholder="Optional" />
            </Field>
            <Field label="SpO2 (%)">
              <Input {...register("spo2")} placeholder="Optional" />
            </Field>
          </div>
        </div>

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
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.125rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Stethoscope size={16} style={{ color: "var(--hms-blue)" }} />{" "}
            Clinical Assessment
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
          >
            <Field label="Diagnosis" required error={errors.diagnosis?.message}>
              <Textarea
                {...register("diagnosis")}
                placeholder="Clinical diagnosis..."
                error={errors.diagnosis}
              />
            </Field>
            <Field label="Observations / Notes">
              <Textarea
                {...register("notes")}
                placeholder="Symptoms, examination findings... (optional)"
              />
            </Field>
            <Field label="Advice / Treatment Plan">
              <Textarea
                {...register("advice")}
                placeholder="Recommendations, follow-up instructions... (optional)"
              />
            </Field>
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
          <ClipboardCheck size={17} /> Save & Write Prescription
        </button>
      </form>
    </div>
  );
};

export default Consultation;
