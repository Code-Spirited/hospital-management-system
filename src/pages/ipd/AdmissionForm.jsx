// ─────────────────────────────────────────────────────────────────────────────
// AdmissionForm.jsx — Week 4, Monday
// IPD's admission intake form. A full page (not a drawer), so it uses
// FormSelect (the portal-based, searchable react-select wrapper) rather
// than DrawerSelect — the portal-vs-vaul-drawer conflict that DrawerSelect
// exists to avoid only applies inside vaul Drawers, which this page isn't.
// Saving creates a new admission record in IPDContext and redirects to the
// admissions list so the result is immediately visible.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import { BedDouble, CheckCircle2, ClipboardPlus } from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
  FormSelect,
  DateInput,
} from "../../components/common";
import { usePatients } from "../../context/PatientsContext";
import { useIPD } from "../../context/IPDContext";
import { DOCTORS } from "../opd/opdData";
import { WARD_TYPE_CONFIG } from "./ipdData";
import { admissionSchema } from "./ipdSchema";

const opt = (v) => ({ value: v, label: v });
const DOCTOR_OPTIONS = DOCTORS.map(opt);
const WARD_TYPE_OPTIONS = Object.keys(WARD_TYPE_CONFIG).map(opt);

// Shows the selected patient's identifying details the instant one is
// picked — same pattern used in the Appointment booking drawer, so a
// receptionist can confirm they've selected the right person even if two
// patients share a name.
const SelectedPatientCard = ({ control, patients }) => {
  const patientId = useWatch({ control, name: "patientId" });
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0.625rem 0.875rem",
        borderRadius: 10,
        background: "var(--hms-blue-light)",
        border: "1px solid rgba(37,99,235,0.2)",
        fontSize: "0.78rem",
        color: "var(--hms-blue)",
        fontWeight: 600,
      }}
    >
      <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
      {patient.name} · {patient.age} yrs, {patient.gender} · {patient.phone}
    </div>
  );
};

const AdmissionForm = () => {
  const navigate = useNavigate();
  const { patients } = usePatients();
  const { addAdmission } = useIPD();
  const [submitting, setSubmitting] = useState(false);

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.id} · ${p.age}y, ${p.gender}`,
  }));

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      patientId: "",
      admittingDoctor: "",
      wardType: "",
      admissionDate: dayjs().format("DD-MM-YYYY"),
      reasonForAdmission: "",
      diagnosisAtAdmission: "",
      attendantName: "",
      attendantPhone: "",
      expectedStayDays: "",
    },
  });

  const submit = async (data) => {
    setSubmitting(true);
    const patient = patients.find((p) => p.id === data.patientId);
    const isoDate = dayjs(data.admissionDate, "DD-MM-YYYY").format(
      "YYYY-MM-DD",
    );
    await new Promise((r) => setTimeout(r, 600));
    const newId = `ADM-${3003 + Math.floor(Math.random() * 900)}`;
    addAdmission({
      id: newId,
      ...data,
      admissionDate: isoDate,
      patientName: patient?.name ?? "",
      status: "Admitted",
    });
    setSubmitting(false);
    toast.success("Patient admitted", {
      description: `${patient?.name} · ${data.wardType} ward`,
    });
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
            <BedDouble size={14} style={{ color: "var(--hms-blue)" }} />
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
            IPD · New Admission
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
          Admit Patient
        </h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
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
            Patient & Admission Details
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Field label="Patient" required error={errors.patientId?.message}>
              <FormSelect
                name="patientId"
                control={control}
                options={patientOptions}
                error={errors.patientId}
                placeholder="Search by name or ID"
                isSearchable
              />
            </Field>
            <SelectedPatientCard control={control} patients={patients} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              <Field
                label="Admitting Doctor"
                required
                error={errors.admittingDoctor?.message}
              >
                <FormSelect
                  name="admittingDoctor"
                  control={control}
                  options={DOCTOR_OPTIONS}
                  error={errors.admittingDoctor}
                  placeholder="Select doctor"
                  isSearchable={false}
                />
              </Field>
              <Field
                label="Ward Type"
                required
                error={errors.wardType?.message}
              >
                <FormSelect
                  name="wardType"
                  control={control}
                  options={WARD_TYPE_OPTIONS}
                  error={errors.wardType}
                  placeholder="Select ward type"
                  isSearchable={false}
                />
              </Field>
              <Field
                label="Admission Date"
                required
                error={errors.admissionDate?.message}
              >
                <DateInput
                  {...register("admissionDate")}
                  error={errors.admissionDate}
                />
              </Field>
              <Field label="Expected Stay (days)" hint="Optional estimate">
                <Input
                  {...register("expectedStayDays")}
                  type="number"
                  min="0"
                  placeholder="e.g. 3"
                />
              </Field>
            </div>
          </div>
        </div>

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
            Clinical Information
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Field
              label="Reason for Admission"
              required
              error={errors.reasonForAdmission?.message}
            >
              <Textarea
                {...register("reasonForAdmission")}
                placeholder="Why is this patient being admitted?"
                error={errors.reasonForAdmission}
              />
            </Field>
            <Field
              label="Diagnosis at Admission"
              hint="Optional — can be added or updated later"
            >
              <Textarea
                {...register("diagnosisAtAdmission")}
                placeholder="Working diagnosis on admission (optional)"
              />
            </Field>
          </div>
        </div>

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
            Attendant Details
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            <Field
              label="Attendant Name"
              required
              error={errors.attendantName?.message}
              hint="Person accompanying / responsible during stay"
            >
              <Input
                {...register("attendantName")}
                placeholder="Full name"
                error={errors.attendantName}
              />
            </Field>
            <Field
              label="Attendant Phone"
              required
              error={errors.attendantPhone?.message}
            >
              <Input
                {...register("attendantPhone")}
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                error={errors.attendantPhone}
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
          <ClipboardPlus size={17} />{" "}
          {submitting ? "Admitting..." : "Admit Patient"}
        </button>
      </form>
    </div>
  );
};

export default AdmissionForm;
