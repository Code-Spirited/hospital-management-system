// ─────────────────────────────────────────────────────────────────────────────
// TreatmentRecords.jsx — Week 4, Thursday
//
// Reached via /ipd/treatment/:admissionId. Genuinely different from OPD's
// Consultation page: one admission accumulates MANY treatment entries over
// the course of a stay (daily rounds, vitals checks), not a single
// one-time form. Each entry is auto-timestamped the moment it's logged —
// it's a progress chart, not a back-dateable record.
//
// "Recorded By" only offers the doctor list — this project has no
// separate nursing-staff roster yet, even though in a real hospital most
// of these entries would be logged by nurses. Flagged deliberately.
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  ClipboardList,
  Plus,
  ArrowLeft,
  User2,
  Info,
  Activity,
  Pill,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
  FormSelect,
} from "../../components/common";
import Abbr from "../../components/common/Abbr/Abbr";
import { useIPD } from "../../context/IPDContext";
import { usePatients } from "../../context/PatientsContext";
import { generateId } from "../../utils/generateId";
import { DOCTORS } from "../opd/opdData";
import { WARD_TYPE_CONFIG, ADMISSION_STATUS_CONFIG } from "./ipdData";
import { treatmentRecordSchema } from "./ipdSchema";

const opt = (v) => ({ value: v, label: v });
const DOCTOR_OPTIONS = DOCTORS.map(opt);

// Builds a readable, JSX-based vitals summary from whichever fields were
// actually recorded — skips any left blank, so a partial entry never
// shows "BP undefined · Temp undefined". Returns JSX (not a plain
// string) specifically so BP and SpO2 can carry the same hover glossary
// used everywhere else in the app.
const formatVitalsLine = (r) => {
  const parts = [];
  if (r.bloodPressure)
    parts.push({
      key: "bp",
      node: (
        <>
          <Abbr underline={false}>BP</Abbr> {r.bloodPressure}
        </>
      ),
    });
  if (r.temperature)
    parts.push({ key: "temp", node: <>Temp {r.temperature}°F</> });
  if (r.pulse) parts.push({ key: "pulse", node: <>Pulse {r.pulse} bpm</> });
  if (r.spo2)
    parts.push({
      key: "spo2",
      node: (
        <>
          <Abbr underline={false}>SpO2</Abbr> {r.spo2}%
        </>
      ),
    });
  if (parts.length === 0) return null;
  return parts.map((p, i) => (
    <span key={p.key}>
      {i > 0 && " · "}
      {p.node}
    </span>
  ));
};

const TreatmentRecords = () => {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const { admissions, addTreatmentRecord } = useIPD();
  const { patients } = usePatients();

  const admission = admissions.find((a) => a.id === admissionId);
  const patient = admission?.patientId
    ? patients.find((p) => p.id === admission.patientId)
    : null;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(treatmentRecordSchema),
    defaultValues: {
      recordedBy: admission?.admittingDoctor ?? "",
      bloodPressure: "",
      temperature: "",
      pulse: "",
      spo2: "",
      notes: "",
      medicationGiven: "",
    },
  });

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

  const isDischarged = admission.status === "Discharged";
  const records = [...(admission.treatmentRecords || [])].sort(
    (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt),
  );

  const submit = (data) => {
    const record = {
      id: generateId("TRT", 5000, 9000),
      recordedAt: dayjs().toISOString(),
      ...data,
    };
    addTreatmentRecord(admission.id, record);
    toast.success("Treatment record added", {
      description: `Logged by ${data.recordedBy}`,
    });
    reset({
      recordedBy: data.recordedBy,
      bloodPressure: "",
      temperature: "",
      pulse: "",
      spo2: "",
      notes: "",
      medicationGiven: "",
    });
  };

  const wardCfg = WARD_TYPE_CONFIG[admission.wardType] || {
    color: "#94a3b8",
    bg: "#f8fafc",
  };
  const statusCfg = ADMISSION_STATUS_CONFIG[admission.status] || {
    color: "#94a3b8",
    bg: "#f8fafc",
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
            {admission.bedNumber
              ? ` · Bed ${admission.bedNumber}`
              : " · Bed not yet assigned"}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              background: wardCfg.bg,
              color: wardCfg.color,
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            {admission.wardType}
          </span>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              background: statusCfg.bg,
              color: statusCfg.color,
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            {admission.status}
          </span>
        </div>
      </div>

      {/* ── New entry form, or read-only notice ── */}
      {isDischarged ? (
        <div
          style={{
            background: "var(--hms-blue-light)",
            border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: 12,
            padding: "0.875rem 1.125rem",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: "1.25rem",
          }}
        >
          <Info
            size={16}
            style={{ color: "var(--hms-blue)", flexShrink: 0, marginTop: 2 }}
          />
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--hms-blue)",
              margin: 0,
              fontWeight: 500,
            }}
          >
            This patient has been discharged. Treatment records are now
            read-only.
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ marginBottom: "1.25rem" }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid var(--hms-border)",
              boxShadow: "var(--shadow-xs)",
              padding: "1.5rem",
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
              <Activity size={16} style={{ color: "var(--hms-blue)" }} /> Log
              Treatment Entry
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  color: "#94a3b8",
                  textTransform: "none",
                }}
              >
                (vitals optional)
              </span>
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <Field
                label="Recorded By"
                required
                error={errors.recordedBy?.message}
                hint="Doctor logging this entry — no separate nursing roster exists yet"
              >
                <FormSelect
                  name="recordedBy"
                  control={control}
                  options={DOCTOR_OPTIONS}
                  error={errors.recordedBy}
                  placeholder="Select doctor"
                  isSearchable={false}
                />
              </Field>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <Field label="Blood Pressure">
                <Input
                  {...register("bloodPressure")}
                  placeholder="e.g. 120/80"
                />
              </Field>
              <Field label="Temperature (°F)">
                <Input {...register("temperature")} placeholder="e.g. 98.6" />
              </Field>
              <Field label="Pulse (bpm)">
                <Input {...register("pulse")} placeholder="e.g. 72" />
              </Field>
              <Field
                label={
                  <>
                    <Abbr underline={false}>SpO2</Abbr> (%)
                  </>
                }
              >
                <Input {...register("spo2")} placeholder="Optional" />
              </Field>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <Field label="Notes / Observations">
                <Textarea
                  {...register("notes")}
                  placeholder="Progress, symptoms, examination findings... (optional)"
                />
              </Field>
              <Field
                label="Medication Given"
                hint="Free text for now — connects to Pharmacy inventory in Week 5"
              >
                <Input
                  {...register("medicationGiven")}
                  placeholder="e.g. Paracetamol 650mg IV (optional)"
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={handleSubmit(submit)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0.65rem 1.25rem",
                border: "none",
                borderRadius: 10,
                background: "var(--hms-blue)",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              }}
            >
              <Plus size={16} /> Add Treatment Record
            </button>
          </div>
        </form>
      )}

      {/* ── History timeline ── */}
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: "0 0 0.875rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ClipboardList size={16} style={{ color: "var(--hms-blue)" }} />{" "}
          Treatment History
          <span
            style={{ fontSize: "0.7rem", fontWeight: 500, color: "#94a3b8" }}
          >
            ({records.length} {records.length === 1 ? "entry" : "entries"})
          </span>
        </h2>

        {records.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid var(--hms-border)",
              padding: "2.5rem",
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
              No treatment records yet.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {records.map((r) => {
              const vitalsLine = formatVitalsLine(r);
              return (
                <div
                  key={r.id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    border: "1px solid var(--hms-border)",
                    borderLeft: "4px solid var(--hms-blue)",
                    padding: "1rem 1.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--hms-navy)",
                      }}
                    >
                      {r.recordedBy}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      {dayjs(r.recordedAt).format("D MMM, h:mm A")} ·{" "}
                      {dayjs(r.recordedAt).fromNow()}
                    </span>
                  </div>
                  {vitalsLine && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#475569",
                        margin: "0 0 4px",
                        fontWeight: 600,
                      }}
                    >
                      {vitalsLine}
                    </p>
                  )}
                  {r.notes && (
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "#475569",
                        margin: "0 0 4px",
                      }}
                    >
                      {r.notes}
                    </p>
                  )}
                  {r.medicationGiven && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--hms-blue)",
                        margin: 0,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Pill size={13} /> {r.medicationGiven}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentRecords;
