// ─────────────────────────────────────────────────────────────────────────────
// PatientRegistration.jsx — Week 3, Monday (revised)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  User,
  Phone,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  UserPlus,
  Info,
} from "lucide-react";
import { patientRegistrationSchema, STEP_FIELDS } from "./opdSchema";
import {
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
  FormSelect,
  DateInput,
} from "../../components/common";
import Abbr from "../../components/common/Abbr/Abbr";
import { generateId } from "../../utils/generateId";

// ── Option lists ──────────────────────────────────────────────────────────────
const opt = (v) => ({ value: v, label: v });

const GENDERS = ["Male", "Female", "Other"].map(opt);
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
  opt,
);
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"].map(opt);
const ID_TYPES = [
  "Aadhaar",
  "PAN",
  "Passport",
  "Voter ID",
  "Driving License",
].map(opt);
const RELATIONS = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Friend",
  "Guardian",
  "Other",
].map(opt);
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
  "Andaman & Nicobar Islands",
  "Lakshadweep",
  "Dadra & Nagar Haveli and Daman & Diu",
].map(opt);

const STEPS = [
  { label: "Personal", subtitle: "Basic information", Icon: User },
  { label: "Contact", subtitle: "Address & reachability", Icon: Phone },
  { label: "Medical", subtitle: "Emergency & health", Icon: AlertTriangle },
  { label: "Review", subtitle: "Confirm & submit", Icon: ClipboardCheck },
];

const ReviewRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 1,
      padding: "0.625rem 0",
      borderBottom: "1px solid var(--hms-border)",
      minWidth: 0,
    }}
  >
    <span
      style={{
        fontSize: "0.68rem",
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "var(--hms-navy)",
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      {value || (
        <span style={{ color: "#cbd5e1", fontWeight: 400 }}>Not provided</span>
      )}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const PatientRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Refs powering the desktop stepper's auto-center-scroll
  const stepperScrollRef = useRef(null);
  const stepRefs = useRef([]);

  const form = useForm({
    resolver: zodResolver(patientRegistrationSchema),
    mode: "onChange",
    defaultValues: {
      hasInsurance: false,
      fullName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      maritalStatus: "",
      idType: "",
      idNumber: "",
      mobileNumber: "",
      alternatePhone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      emergencyName: "",
      emergencyRelation: "",
      emergencyPhone: "",
      chiefComplaint: "",
      symptoms: "",
      allergies: "",
      currentMedications: "",
      insuranceProvider: "",
      policyNumber: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = form;

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() returns a function the React Compiler can't safely auto-memoize. This is a known, harmless characteristic of the library; live field values still work correctly.
  const allValues = form.watch();

  const age = allValues.dateOfBirth
    ? dayjs().diff(dayjs(allValues.dateOfBirth, "DD-MM-YYYY"), "year")
    : null;

  const goNext = useCallback(async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = fields ? await trigger(fields) : true;
    if (!valid) return;
    setDirection(1);
    setCurrentStep((s) => s + 1);
  }, [currentStep, trigger]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    // generateId, not Math.random() directly here: this function runs
    // after an `await`, and a setState updater or async continuation that
    // calls Math.random() directly is the same react-hooks/purity risk
    // already fixed in AdmissionForm.jsx and AppointmentList.jsx — React
    // re-invoking this on an interrupted render could mint a different,
    // possibly duplicate, ID.
    const newId = generateId("P", 1043, 100);
    toast.success(`Patient registered successfully`, {
      description: `${data.fullName} · ID: ${newId}`,
    });
    navigate("/opd");
  };

  // Auto-scroll the desktop stepper so the active step is centered —
  // the user never needs to manually swipe/scroll to find their place.
  useEffect(() => {
    const container = stepperScrollRef.current;
    const activeEl = stepRefs.current[currentStep];
    if (!container || !activeEl) return;
    const target =
      activeEl.offsetLeft -
      container.offsetWidth / 2 +
      activeEl.offsetWidth / 2;
    container.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [currentStep]);

  const stepVariants = {
    initial: (d) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    animate: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  };

  return (
    <div
      className="reg-page"
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 920,
        margin: "0 auto",
      }}
    >
      <style>{`
        .reg-page { container-type: inline-size; container-name: reg-page; }

        .reg-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.125rem; }
        .reg-span-2 { grid-column: span 2; }
        @media (max-width: 540px) {
          .reg-grid-2 { grid-template-columns: 1fr; }
          .reg-span-2 { grid-column: span 1; }
        }

        /* Mobile: compact progress bar. Desktop: rich stepper with icons. */
        .reg-stepper-mobile      { display: block; }
        .reg-stepper-desktop-wrap { display: none; }
        @container reg-page (min-width: 640px) {
          .reg-stepper-mobile       { display: none; }
          .reg-stepper-desktop-wrap {
            display: block;
            overflow-x: auto;
            scrollbar-width: none; /* Firefox — auto-scroll makes a visible bar unnecessary clutter */
          }
          .reg-stepper-desktop-wrap::-webkit-scrollbar { display: none; } /* Chrome/Edge — same reasoning */
        }
        .reg-stepper-desktop { display: flex; align-items: center; min-width: max-content; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Page header ── */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
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
              <UserPlus size={14} style={{ color: "var(--hms-blue)" }} />
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
              <Abbr underline={false}>OPD</Abbr> · New Registration
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
            Patient Registration
          </h1>
        </div>

        <button
          onClick={() => navigate("/opd")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 9,
            border: "1.5px solid var(--hms-border)",
            background: "#fff",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#64748b",
            fontFamily: "var(--font-body)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--hms-blue)";
            e.currentTarget.style.color = "var(--hms-blue)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--hms-border)";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          ← Back to OPD
        </button>
      </div>

      {/* ── Stepper ── */}
      <div
        style={{
          marginBottom: "1.5rem",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          padding: "1.125rem 1.375rem",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {/* Mobile version */}
        <div className="reg-stepper-mobile">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--hms-blue)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
              }}
            >
              {STEPS[currentStep].label}
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "var(--hms-surface)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: "100%",
                background: "var(--hms-blue)",
                borderRadius: 99,
              }}
            />
          </div>
          <p
            style={{
              fontSize: "0.7rem",
              color: "#94a3b8",
              margin: "6px 0 0",
              fontWeight: 500,
            }}
          >
            {STEPS[currentStep].subtitle}
          </p>
        </div>

        {/* Desktop / tablet version — auto-centers the active step */}
        <div className="reg-stepper-desktop-wrap" ref={stepperScrollRef}>
          <div className="reg-stepper-desktop">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              const Icon = step.Icon;
              return (
                <div
                  key={i}
                  ref={(el) => (stepRefs.current[i] = el)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: i < STEPS.length - 1 ? 1 : 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        background: done
                          ? "var(--hms-success)"
                          : active
                            ? "var(--hms-blue)"
                            : "var(--hms-surface)",
                        border: `2px solid ${done ? "var(--hms-success)" : active ? "var(--hms-blue)" : "var(--hms-border)"}`,
                        transition: "all 0.3s",
                      }}
                    >
                      {done ? (
                        <Check size={16} color="#fff" strokeWidth={2.5} />
                      ) : (
                        <Icon
                          size={15}
                          color={active ? "#fff" : "#94a3b8"}
                          strokeWidth={active ? 2.2 : 1.8}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: active ? 800 : done ? 600 : 500,
                          color: active
                            ? "var(--hms-navy)"
                            : done
                              ? "var(--hms-success)"
                              : "#94a3b8",
                          lineHeight: 1.2,
                        }}
                      >
                        {step.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: "#94a3b8",
                          fontWeight: 400,
                        }}
                      >
                        {step.subtitle}
                      </span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        margin: "0 12px",
                        minWidth: 32,
                        background:
                          i < currentStep
                            ? "var(--hms-success)"
                            : "var(--hms-border)",
                        borderRadius: 99,
                        transition: "background 0.4s",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      {/* Defensive guard: native form submission is fully disabled here.
          Both "Continue" and "Register Patient" below are plain
          type="button" elements that act explicitly via onClick. This
          avoids a known React/HTML edge case where a button's type
          attribute changing at the same JSX position (button → submit,
          as happens entering the final step) can be misread by the
          browser as a submit click from the click that triggered the
          step change. */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div
          style={{ position: "relative", overflow: "hidden", minHeight: 420 }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* ════ STEP 0: Personal Information ════ */}
              {currentStep === 0 && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid var(--hms-border)",
                    padding: "1.75rem",
                    boxShadow: "var(--shadow-xs)",
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
                    Personal Information
                  </h2>
                  <div className="reg-grid-2">
                    <div className="reg-span-2">
                      <Field
                        label="Full Name"
                        required
                        error={errors.fullName?.message}
                      >
                        <Input
                          {...register("fullName")}
                          placeholder="e.g. Ramesh Kumar Sharma"
                          error={errors.fullName}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Date of Birth"
                      required
                      error={errors.dateOfBirth?.message}
                    >
                      <DateInput
                        {...register("dateOfBirth")}
                        error={errors.dateOfBirth}
                      />
                    </Field>

                    <Field
                      label="Age"
                      hint="Auto-calculated from date of birth"
                    >
                      <Input
                        value={age !== null ? `${age} years` : ""}
                        placeholder="—"
                        disabled
                        readOnly
                        style={{
                          padding: "0.575rem 0.875rem",
                          border: "1.5px solid var(--hms-border)",
                          borderRadius: 10,
                          fontSize: "0.875rem",
                          fontFamily: "var(--font-body)",
                          color: "#64748b",
                          background: "var(--hms-surface)",
                          width: "100%",
                          boxSizing: "border-box",
                          cursor: "not-allowed",
                        }}
                      />
                    </Field>

                    <Field
                      label="Gender"
                      required
                      error={errors.gender?.message}
                    >
                      <FormSelect
                        name="gender"
                        control={control}
                        options={GENDERS}
                        error={errors.gender}
                        placeholder="Select gender"
                        isSearchable={false}
                      />
                    </Field>

                    <Field
                      label="Blood Group"
                      error={errors.bloodGroup?.message}
                    >
                      <FormSelect
                        name="bloodGroup"
                        control={control}
                        options={BLOOD_GROUPS}
                        placeholder="Select blood group"
                        isSearchable={false}
                        isClearable
                      />
                    </Field>

                    <Field label="Marital Status">
                      <FormSelect
                        name="maritalStatus"
                        control={control}
                        options={MARITAL_STATUS}
                        placeholder="Select status"
                        isSearchable={false}
                        isClearable
                      />
                    </Field>

                    <Field label="ID Proof Type">
                      <FormSelect
                        name="idType"
                        control={control}
                        options={ID_TYPES}
                        placeholder="Select ID type"
                        isSearchable={false}
                        isClearable
                      />
                    </Field>

                    <Field label="ID Number" error={errors.idNumber?.message}>
                      <Input
                        {...register("idNumber")}
                        placeholder="e.g. 1234 5678 9012"
                        error={errors.idNumber}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ════ STEP 1: Contact Details ════ */}
              {currentStep === 1 && (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid var(--hms-border)",
                    padding: "1.75rem",
                    boxShadow: "var(--shadow-xs)",
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
                    Contact Details
                  </h2>
                  <div className="reg-grid-2">
                    <Field
                      label="Mobile Number"
                      required
                      error={errors.mobileNumber?.message}
                    >
                      <Input
                        {...register("mobileNumber")}
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        error={errors.mobileNumber}
                      />
                    </Field>

                    <Field
                      label="Alternate Phone"
                      error={errors.alternatePhone?.message}
                    >
                      <Input
                        {...register("alternatePhone")}
                        type="tel"
                        maxLength={10}
                        placeholder="Optional"
                        error={errors.alternatePhone}
                      />
                    </Field>

                    <div className="reg-span-2">
                      <Field
                        label="Email Address"
                        error={errors.email?.message}
                      >
                        <Input
                          {...register("email")}
                          type="email"
                          placeholder="patient@example.com (optional)"
                          error={errors.email}
                        />
                      </Field>
                    </div>

                    <div className="reg-span-2">
                      <Field
                        label="Address Line 1"
                        required
                        error={errors.addressLine1?.message}
                      >
                        <Input
                          {...register("addressLine1")}
                          placeholder="House / Flat no., Street, Locality"
                          error={errors.addressLine1}
                        />
                      </Field>
                    </div>

                    <div className="reg-span-2">
                      <Field label="Address Line 2">
                        <Input
                          {...register("addressLine2")}
                          placeholder="Landmark, Area (optional)"
                        />
                      </Field>
                    </div>

                    {/* City and Pincode side by side, State directly below
                        spanning the full row — confirmed order: City → Pincode → State */}
                    <Field label="City" required error={errors.city?.message}>
                      <Input
                        {...register("city")}
                        placeholder="City"
                        error={errors.city}
                      />
                    </Field>

                    <Field
                      label="Pincode"
                      required
                      error={errors.pincode?.message}
                    >
                      <Input
                        {...register("pincode")}
                        maxLength={6}
                        placeholder="6-digit pincode"
                        error={errors.pincode}
                      />
                    </Field>

                    <div className="reg-span-2">
                      <Field
                        label="State"
                        required
                        error={errors.state?.message}
                      >
                        <FormSelect
                          name="state"
                          control={control}
                          options={INDIAN_STATES}
                          error={errors.state}
                          placeholder="Select state"
                          isSearchable
                          menuPlacement="top"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ STEP 2: Emergency Contact + Medical Information ════ */}
              {currentStep === 2 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid var(--hms-border)",
                      padding: "1.75rem",
                      boxShadow: "var(--shadow-xs)",
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
                      Emergency Contact
                    </h2>
                    <div className="reg-grid-2">
                      <Field
                        label="Contact Name"
                        required
                        error={errors.emergencyName?.message}
                      >
                        <Input
                          {...register("emergencyName")}
                          placeholder="Full name"
                          error={errors.emergencyName}
                        />
                      </Field>

                      <Field
                        label="Relationship"
                        required
                        error={errors.emergencyRelation?.message}
                      >
                        <FormSelect
                          name="emergencyRelation"
                          control={control}
                          options={RELATIONS}
                          error={errors.emergencyRelation}
                          placeholder="Select relation"
                          isSearchable={false}
                        />
                      </Field>

                      <div className="reg-span-2">
                        <Field
                          label="Emergency Phone"
                          required
                          error={errors.emergencyPhone?.message}
                        >
                          <Input
                            {...register("emergencyPhone")}
                            type="tel"
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            error={errors.emergencyPhone}
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
                      padding: "1.75rem",
                      boxShadow: "var(--shadow-xs)",
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
                      Medical Information
                    </h2>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.125rem",
                      }}
                    >
                      <Field
                        label="Chief Complaint"
                        required
                        error={errors.chiefComplaint?.message}
                      >
                        <Textarea
                          {...register("chiefComplaint")}
                          placeholder="Describe the primary reason for this visit in detail..."
                          error={errors.chiefComplaint}
                        />
                      </Field>

                      <Field
                        label="Symptoms"
                        hint="Describe any accompanying symptoms"
                      >
                        <Textarea
                          {...register("symptoms")}
                          placeholder="Fever, headache, nausea... (optional)"
                        />
                      </Field>

                      <div className="reg-grid-2">
                        <Field label="Known Allergies">
                          <Input
                            {...register("allergies")}
                            placeholder="e.g. Penicillin, Dust mites (optional)"
                          />
                        </Field>
                        <Field label="Current Medications">
                          <Input
                            {...register("currentMedications")}
                            placeholder="e.g. Metformin 500mg (optional)"
                          />
                        </Field>
                      </div>

                      <div style={{ paddingTop: "0.25rem" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 24,
                              borderRadius: 99,
                              position: "relative",
                              background: allValues.hasInsurance
                                ? "var(--hms-blue)"
                                : "#e2e8f0",
                              transition: "background 0.2s",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                            onClick={() =>
                              form.setValue(
                                "hasInsurance",
                                !allValues.hasInsurance,
                              )
                            }
                          >
                            <div
                              style={{
                                position: "absolute",
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "#fff",
                                top: 3,
                                left: allValues.hasInsurance ? 23 : 3,
                                transition: "left 0.2s",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "var(--hms-navy)",
                            }}
                          >
                            Patient has health insurance
                          </span>
                        </label>

                        {allValues.hasInsurance && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ marginTop: "1rem" }}
                            className="reg-grid-2"
                          >
                            <Field label="Insurance Provider">
                              <Input
                                {...register("insuranceProvider")}
                                placeholder="e.g. Star Health, HDFC Ergo"
                              />
                            </Field>
                            <Field label="Policy Number">
                              <Input
                                {...register("policyNumber")}
                                placeholder="Policy / Member ID"
                              />
                            </Field>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════ STEP 3: Review & Submit ════ */}
              {currentStep === 3 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid var(--hms-border)",
                      padding: "1.375rem 1.75rem",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        color: "var(--hms-blue)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        margin: "0 0 0.75rem",
                      }}
                    >
                      Personal Information
                    </p>
                    <div className="reg-grid-2">
                      <ReviewRow label="Full Name" value={allValues.fullName} />
                      <ReviewRow
                        label="Date of Birth"
                        value={
                          allValues.dateOfBirth
                            ? `${dayjs(allValues.dateOfBirth, "DD-MM-YYYY").format("D MMM YYYY")} (Age ${age})`
                            : ""
                        }
                      />
                      <ReviewRow label="Gender" value={allValues.gender} />
                      <ReviewRow
                        label="Blood Group"
                        value={allValues.bloodGroup}
                      />
                      <ReviewRow
                        label="Marital Status"
                        value={allValues.maritalStatus}
                      />
                      <ReviewRow
                        label="ID Proof"
                        value={
                          allValues.idType
                            ? `${allValues.idType} — ${allValues.idNumber || "No. not provided"}`
                            : ""
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid var(--hms-border)",
                      padding: "1.375rem 1.75rem",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        color: "var(--hms-violet)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        margin: "0 0 0.75rem",
                      }}
                    >
                      Contact Details
                    </p>
                    <div className="reg-grid-2">
                      <ReviewRow
                        label="Mobile"
                        value={allValues.mobileNumber}
                      />
                      <ReviewRow label="Email" value={allValues.email} />
                      <div className="reg-span-2">
                        <ReviewRow
                          label="Address"
                          value={[
                            allValues.addressLine1,
                            allValues.addressLine2,
                            allValues.city,
                            allValues.state,
                            allValues.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      border: "1px solid var(--hms-border)",
                      padding: "1.375rem 1.75rem",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        color: "#d97706",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        margin: "0 0 0.75rem",
                      }}
                    >
                      Emergency & Medical
                    </p>
                    <div className="reg-grid-2">
                      <div className="reg-span-2">
                        <ReviewRow
                          label="Emergency Contact"
                          value={
                            allValues.emergencyName
                              ? `${allValues.emergencyName} (${allValues.emergencyRelation}) · ${allValues.emergencyPhone}`
                              : ""
                          }
                        />
                      </div>
                      <div className="reg-span-2">
                        <ReviewRow
                          label="Chief Complaint"
                          value={allValues.chiefComplaint}
                        />
                      </div>
                      <ReviewRow
                        label="Allergies"
                        value={allValues.allergies}
                      />
                      <ReviewRow
                        label="Current Meds"
                        value={allValues.currentMedications}
                      />
                      {allValues.hasInsurance && (
                        <div className="reg-span-2">
                          <ReviewRow
                            label="Insurance"
                            value={`${allValues.insuranceProvider} · ${allValues.policyNumber}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--hms-blue-light)",
                      border: "1px solid rgba(37,99,235,0.2)",
                      borderRadius: 12,
                      padding: "0.875rem 1.125rem",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <Info
                      size={16}
                      style={{
                        color: "var(--hms-blue)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--hms-blue)",
                        margin: 0,
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}
                    >
                      By submitting this form, you confirm that all information
                      provided is accurate to the best of your knowledge.
                      Patient data will be stored securely and used only for
                      medical purposes.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Navigation buttons — both type="button", see guard note above ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: currentStep === 0 ? "flex-end" : "space-between",
            marginTop: "1.25rem",
            gap: "0.75rem",
          }}
        >
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goPrev}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0.625rem 1.25rem",
                border: "1.5px solid var(--hms-border)",
                borderRadius: 10,
                background: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#64748b",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--hms-blue)";
                e.currentTarget.style.color = "var(--hms-blue)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--hms-border)";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0.625rem 1.5rem",
                border: "none",
                borderRadius: 10,
                background: "var(--hms-blue)",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--hms-blue-dark)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--hms-blue)")
              }
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit(onSubmit)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0.625rem 1.75rem",
                border: "none",
                borderRadius: 10,
                background: submitting ? "#94a3b8" : "var(--hms-success)",
                color: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                fontWeight: 700,
                boxShadow: submitting
                  ? "none"
                  : "0 4px 12px rgba(5,150,105,0.3)",
                transition: "all 0.15s",
              }}
            >
              {submitting ? (
                <>
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Registering...
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={2.5} /> Register Patient
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
