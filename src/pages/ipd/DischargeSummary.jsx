// ─────────────────────────────────────────────────────────────────────────────
// DischargeSummary.jsx — Week 4, Friday
//
// Reached via /ipd/discharge/:admissionId. Closes the admission lifecycle:
// Admission → Treatment Records → Discharge. Saving sets status to
// "Discharged" — because Ward Management and Bed Allocation both filter
// by status === "Admitted", that bed/ward slot frees up automatically,
// with no extra code needed here.
//
// bedNumber is intentionally LEFT on the record after discharge (not
// cleared to null) — it's harmless for capacity calculations (which
// already exclude non-Admitted records) and useful as a historical fact
// ("this patient stayed in ICU Bed 1").
//
// "Condition at Discharge" includes Deceased — a real, necessary outcome
// category. It's styled neutrally (gray, not red/alarming) and the
// confirmation toast for it uses plain wording, not the celebratory tone
// used for every other outcome.
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  ArrowLeft,
  User2,
  LogOut,
  ClipboardList,
  Info,
  Calendar,
  Stethoscope,
  FileText,
} from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
  FormSelect,
  DateInput,
} from "../../components/common";
import { useIPD } from "../../context/IPDContext";
import { usePatients } from "../../context/PatientsContext";
import { DOCTORS } from "../opd/opdData";
import {
  WARD_TYPE_CONFIG,
  ADMISSION_STATUS_CONFIG,
  CONDITION_AT_DISCHARGE_CONFIG,
} from "./ipdData";
import { dischargeSummarySchema } from "./ipdSchema";

const opt = (v) => ({ value: v, label: v });
const DOCTOR_OPTIONS = DOCTORS.map(opt);
const CONDITION_OPTIONS = Object.keys(CONDITION_AT_DISCHARGE_CONFIG).map(opt);

const DetailRow = ({ Icon, label, value }) => (
  <div
    style={{
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      padding: "0.625rem 0",
      borderBottom: "1px solid #f1f5f9",
    }}
  >
    <Icon size={15} style={{ color: "#94a3b8", flexShrink: 0, marginTop: 1 }} />
    <div style={{ minWidth: 0 }}>
      <p
        style={{
          fontSize: "0.66rem",
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--hms-navy)",
          margin: "2px 0 0",
          overflowWrap: "break-word",
        }}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const ConditionPill = ({ condition }) => {
  const cfg = CONDITION_AT_DISCHARGE_CONFIG[condition] || {
    color: "#94a3b8",
    bg: "#f8fafc",
  };
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        fontSize: "0.72rem",
        fontWeight: 700,
      }}
    >
      {condition}
    </span>
  );
};

const DischargeSummary = () => {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const { admissions, dischargeAdmission } = useIPD();
  const { patients } = usePatients();

  const admission = admissions.find((a) => a.id === admissionId);
  const patient = admission?.patientId
    ? patients.find((p) => p.id === admission.patientId)
    : null;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dischargeSummarySchema),
    defaultValues: {
      dischargeDate: dayjs().format("DD-MM-YYYY"),
      conditionAtDischarge: "",
      dischargedBy: admission?.admittingDoctor ?? "",
      finalDiagnosis: "",
      treatmentSummary: "",
      followUpDate: "",
      followUpInstructions: "",
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
  const treatmentCount = (admission.treatmentRecords || []).length;
  const lastEntry =
    treatmentCount > 0
      ? [...admission.treatmentRecords].sort(
          (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt),
        )[0]
      : null;
  const wardCfg = WARD_TYPE_CONFIG[admission.wardType] || {
    color: "#94a3b8",
    bg: "#f8fafc",
  };
  const statusCfg = ADMISSION_STATUS_CONFIG[admission.status] || {
    color: "#94a3b8",
    bg: "#f8fafc",
  };

  const submit = (data) => {
    const isoDischargeDate = dayjs(data.dischargeDate, "DD-MM-YYYY").format(
      "YYYY-MM-DD",
    );
    const isoFollowUp = data.followUpDate
      ? dayjs(data.followUpDate, "DD-MM-YYYY").format("YYYY-MM-DD")
      : null;

    dischargeAdmission(admission.id, {
      dischargeDate: isoDischargeDate,
      dischargeSummary: {
        conditionAtDischarge: data.conditionAtDischarge,
        dischargedBy: data.dischargedBy,
        finalDiagnosis: data.finalDiagnosis,
        treatmentSummary: data.treatmentSummary,
        followUpDate: isoFollowUp,
        followUpInstructions: data.followUpInstructions,
      },
    });

    if (data.conditionAtDischarge === "Deceased") {
      toast("Admission record closed", {
        description: `${admission.patientName}'s record has been updated.`,
      });
    } else {
      toast.success("Patient discharged", {
        description: `${admission.patientName} · ${data.conditionAtDischarge}`,
      });
    }
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
            {admission.bedNumber ? ` · Bed ${admission.bedNumber}` : ""}
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

      {/* ── Stay summary (always shown — context from the earlier stages) ── */}
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
            margin: "0 0 0.875rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ClipboardList size={16} style={{ color: "var(--hms-blue)" }} /> Stay
          Summary
        </h2>
        <DetailRow
          Icon={FileText}
          label="Reason for Admission"
          value={admission.reasonForAdmission}
        />
        {admission.diagnosisAtAdmission && (
          <DetailRow
            Icon={Stethoscope}
            label="Diagnosis at Admission"
            value={admission.diagnosisAtAdmission}
          />
        )}
        <div style={{ padding: "0.625rem 0" }}>
          <p
            style={{
              fontSize: "0.66rem",
              fontWeight: 700,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 4px",
            }}
          >
            Treatment Records
          </p>
          {treatmentCount === 0 ? (
            <p
              style={{
                fontSize: "0.82rem",
                color: "#94a3b8",
                margin: 0,
                fontWeight: 500,
              }}
            >
              No treatment records were logged during this stay.
            </p>
          ) : (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--hms-navy)",
                margin: "0 0 6px",
                fontWeight: 600,
              }}
            >
              {treatmentCount} {treatmentCount === 1 ? "entry" : "entries"}{" "}
              logged · last by {lastEntry.recordedBy},{" "}
              {dayjs(lastEntry.recordedAt).fromNow()}
            </p>
          )}
          <button
            onClick={() => navigate(`/ipd/treatment/${admission.id}`)}
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
            View Full Treatment History →
          </button>
        </div>
      </div>

      {/* ── Discharge form, or read-only summary if already discharged ── */}
      {isDischarged ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Info size={16} style={{ color: "var(--hms-blue)" }} /> Discharge
              Summary
            </h2>
            {admission.dischargeSummary?.conditionAtDischarge && (
              <ConditionPill
                condition={admission.dischargeSummary.conditionAtDischarge}
              />
            )}
          </div>
          <DetailRow
            Icon={Calendar}
            label="Discharge Date"
            value={
              admission.dischargeDate
                ? dayjs(admission.dischargeDate).format("D MMMM YYYY")
                : null
            }
          />
          <DetailRow
            Icon={User2}
            label="Discharged By"
            value={admission.dischargeSummary?.dischargedBy}
          />
          {admission.dischargeSummary?.finalDiagnosis && (
            <DetailRow
              Icon={Stethoscope}
              label="Final Diagnosis"
              value={admission.dischargeSummary.finalDiagnosis}
            />
          )}
          {admission.dischargeSummary?.treatmentSummary && (
            <DetailRow
              Icon={FileText}
              label="Treatment Summary"
              value={admission.dischargeSummary.treatmentSummary}
            />
          )}
          {admission.dischargeSummary?.followUpDate && (
            <DetailRow
              Icon={Calendar}
              label="Follow-up Date"
              value={dayjs(admission.dischargeSummary.followUpDate).format(
                "D MMMM YYYY",
              )}
            />
          )}
          {admission.dischargeSummary?.followUpInstructions && (
            <DetailRow
              Icon={FileText}
              label="Follow-up Instructions"
              value={admission.dischargeSummary.followUpInstructions}
            />
          )}
        </div>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
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
              <LogOut size={16} style={{ color: "var(--hms-blue)" }} />{" "}
              Discharge Patient
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                <Field
                  label="Discharge Date"
                  required
                  error={errors.dischargeDate?.message}
                >
                  <DateInput
                    {...register("dischargeDate")}
                    error={errors.dischargeDate}
                  />
                </Field>
                <Field
                  label="Condition at Discharge"
                  required
                  error={errors.conditionAtDischarge?.message}
                >
                  <FormSelect
                    name="conditionAtDischarge"
                    control={control}
                    options={CONDITION_OPTIONS}
                    error={errors.conditionAtDischarge}
                    placeholder="Select outcome"
                    isSearchable={false}
                  />
                </Field>
              </div>

              <Field
                label="Discharged By"
                required
                error={errors.dischargedBy?.message}
              >
                <FormSelect
                  name="dischargedBy"
                  control={control}
                  options={DOCTOR_OPTIONS}
                  error={errors.dischargedBy}
                  placeholder="Select discharging doctor"
                  isSearchable={false}
                />
              </Field>

              <Field label="Final Diagnosis" hint="Optional">
                <Textarea
                  {...register("finalDiagnosis")}
                  placeholder="Final diagnosis on discharge (optional)"
                />
              </Field>
              <Field
                label="Treatment Summary"
                hint="Optional — overview of what was done during this stay"
              >
                <Textarea
                  {...register("treatmentSummary")}
                  placeholder="Brief summary of treatment provided (optional)"
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                }}
              >
                <Field
                  label="Follow-up Date"
                  hint="Optional"
                  error={errors.followUpDate?.message}
                >
                  <DateInput
                    {...register("followUpDate")}
                    error={errors.followUpDate}
                  />
                </Field>
                <Field label="Follow-up Instructions" hint="Optional">
                  <Input
                    {...register("followUpInstructions")}
                    placeholder="e.g. Return for review"
                  />
                </Field>
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
            <LogOut size={17} /> Complete Discharge
          </button>
        </form>
      )}
    </div>
  );
};

export default DischargeSummary;
