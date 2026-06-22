// ─────────────────────────────────────────────────────────────────────────────
// Consultation.jsx — Week 3, Thursday (revised)
// Reached via /opd/consultation/:appointmentId from a Scheduled (or
// Consulted, for editing) appointment. Three explicit outcomes, none of
// them forced through the others:
//   1. Save & Write Prescription  → status "Consulted", goes to Prescription
//   2. Save & Generate Bill       → status "Consulted", SKIPS Prescription
//      entirely and goes straight to Billing (e.g. consultation needed no
//      medicine but should still be billed)
//   3. Mark Complete — No Further Action → status "Completed" directly,
//      for visits needing neither a prescription nor a bill
// No field in this form is required — a consultation should be easy to
// log even with minimal detail.
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
  Receipt,
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

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      bloodPressure: appt?.vitals?.bloodPressure ?? "",
      temperature: appt?.vitals?.temperature ?? "",
      pulse: appt?.vitals?.pulse ?? "",
      weight: appt?.vitals?.weight ?? "",
      spo2: appt?.vitals?.spo2 ?? "",
      diagnosis: appt?.diagnosis ?? "",
      notes: appt?.notes ?? "",
      advice: appt?.advice ?? "",
    },
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

  const buildUpdate = (data, status) => ({
    ...appt,
    status,
    vitals: data,
    diagnosis: data.diagnosis,
    notes: data.notes,
    advice: data.advice,
  });

  const saveAndWritePrescription = (data) => {
    updateAppointment(buildUpdate(data, "Consulted"));
    toast.success("Consultation saved", {
      description: "Now let's write the prescription.",
    });
    navigate(`/opd/prescription/${appt.id}`);
  };

  const saveAndGenerateBill = (data) => {
    updateAppointment(buildUpdate(data, "Consulted"));
    toast.success("Consultation saved", {
      description: "No prescription needed — let's generate the bill.",
    });
    navigate(`/opd/billing/${appt.id}`);
  };

  const saveAndComplete = (data) => {
    updateAppointment(buildUpdate(data, "Completed"));
    toast.success("Consultation completed", {
      description: "No further action needed for this visit.",
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
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "#94a3b8",
                textTransform: "none",
              }}
            >
              (all optional)
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "1rem",
            }}
          >
            <Field label="Blood Pressure">
              <Input {...register("bloodPressure")} placeholder="e.g. 120/80" />
            </Field>
            <Field label="Temperature (°F)">
              <Input {...register("temperature")} placeholder="e.g. 98.6" />
            </Field>
            <Field label="Pulse (bpm)">
              <Input {...register("pulse")} placeholder="e.g. 72" />
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
            <Field label="Diagnosis">
              <Textarea
                {...register("diagnosis")}
                placeholder="Clinical diagnosis... (optional)"
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
          onClick={handleSubmit(saveAndWritePrescription)}
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
            marginBottom: "0.625rem",
          }}
        >
          <ClipboardCheck size={17} /> Save & Write Prescription
        </button>

        <button
          type="button"
          onClick={handleSubmit(saveAndGenerateBill)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            justifyContent: "center",
            padding: "0.7rem 1rem",
            border: "1.5px solid var(--hms-blue)",
            borderRadius: 12,
            background: "#fff",
            color: "var(--hms-blue)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.875rem",
            fontWeight: 700,
            marginBottom: "0.625rem",
          }}
        >
          <Receipt size={16} /> Save & Generate Bill (Skip Prescription)
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
            padding: "0.65rem 1rem",
            border: "1.5px solid var(--hms-border)",
            borderRadius: 12,
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.83rem",
            fontWeight: 600,
          }}
        >
          Mark Complete — No Further Action
        </button>
      </form>
    </div>
  );
};

export default Consultation;
