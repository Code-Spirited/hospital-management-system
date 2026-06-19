// ─────────────────────────────────────────────────────────────────────────────
// PatientList.jsx — Week 3, Tuesday
//
// Full CRUD patient register for the OPD module.
//   Create → "Register Patient" button navigates to the form built Monday
//   Read   → row's View action opens a read-only detail drawer
//   Update → row's Edit action opens a pre-filled quick-edit drawer
//   Delete → removes the row immediately with an "Undo" toast action,
//            rather than an interruptive confirm dialog (the pattern Gmail
//            and Notion use — safer for the user without being intrusive)
//
// All CRUD operations act on local React state for now; Week 8 swaps the
// in-memory array for real API calls without changing this component's
// structure.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "vaul";
import * as Popover from "@radix-ui/react-popover";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  UserPlus,
  Users,
  Activity,
  AlertCircle,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Stethoscope,
  Droplet,
} from "lucide-react";
import {
  DataTable,
  multiSelectFilter,
  FormField as Field,
  FormInput as Input,
  FormTextarea as Textarea,
  FormSelect,
} from "../../components/common";
import { STATUS_CONFIG, VISIT_TYPE_CONFIG, DOCTORS } from "./opdData";
import { usePatients } from "../../context/PatientsContext";
import { editPatientSchema } from "./opdSchema";

const opt = (v) => ({ value: v, label: v });
const STATUS_OPTIONS = Object.keys(STATUS_CONFIG).map(opt);
const DOCTOR_OPTIONS = DOCTORS.map(opt);

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

// ── Small badge components ────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: "#94a3b8", bg: "#f8fafc" };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {status}
    </span>
  );
};

const TypePill = ({ type }) => {
  const cfg = VISIT_TYPE_CONFIG[type] || { color: "#94a3b8", bg: "#f8fafc" };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: "0.72rem",
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {type}
    </span>
  );
};

// ── Row action menu (View / Edit / Delete) ────────────────────────────────────
const RowActions = ({ patient, onView, onEdit, onDelete }) => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button className="opd-row-action-trigger" title="Actions">
        <MoreVertical size={15} />
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        align="end"
        sideOffset={6}
        className="hms-popover-content"
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-lg)",
          padding: "0.375rem",
          minWidth: 170,
          zIndex: 50,
          fontFamily: "var(--font-body)",
        }}
      >
        <button className="opd-row-action-btn" onClick={() => onView(patient)}>
          <Eye size={14} /> View Details
        </button>
        <button className="opd-row-action-btn" onClick={() => onEdit(patient)}>
          <Pencil size={14} /> Edit Patient
        </button>
        <div
          style={{
            height: 1,
            background: "var(--hms-border)",
            margin: "0.3rem 0",
          }}
        />
        <button
          className="opd-row-action-btn opd-row-action-danger"
          onClick={() => onDelete(patient)}
        >
          <Trash2 size={14} /> Delete Patient
        </button>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);

// ── Detail row used inside the View drawer ────────────────────────────────────
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

// ── View drawer ────────────────────────────────────────────────────────────────
const ViewDrawer = ({ patient, open, onOpenChange }) => (
  <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
    <Drawer.Portal>
      <Drawer.Overlay
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(15,23,42,0.45)",
          backdropFilter: "blur(4px)",
        }}
      />
      <Drawer.Content
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: 101,
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(15,23,42,0.18)",
          display: "flex",
          flexDirection: "column",
          outline: "none",
          fontFamily: "var(--font-body)",
        }}
      >
        {patient && (
          <>
            <div
              style={{
                padding: "1.25rem 1.375rem",
                borderBottom: "1px solid var(--hms-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    {getInitials(patient.name)}
                  </span>
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {patient.name}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {patient.id} · {patient.age} yrs · {patient.gender}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "1.5px solid var(--hms-border)",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
              >
                <X size={15} />
              </button>
            </div>

            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.125rem 1.375rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "var(--hms-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "0 0 0.25rem",
                }}
              >
                Contact
              </p>
              <DetailRow Icon={Phone} label="Phone" value={patient.phone} />
              <DetailRow Icon={Mail} label="Email" value={patient.email} />
              <DetailRow
                Icon={MapPin}
                label="Address"
                value={patient.address}
              />

              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "var(--hms-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "1.125rem 0 0.25rem",
                }}
              >
                Medical
              </p>
              <DetailRow
                Icon={Droplet}
                label="Blood Group"
                value={patient.bloodGroup}
              />
              <DetailRow
                Icon={Stethoscope}
                label="Assigned Doctor"
                value={patient.assignedDoctor}
              />

              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "var(--hms-blue)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  margin: "1.125rem 0 0.25rem",
                }}
              >
                Visit Info
              </p>
              <DetailRow
                Icon={Calendar}
                label="Registered On"
                value={dayjs(patient.registeredOn).format("D MMMM YYYY")}
              />
              <DetailRow
                Icon={Calendar}
                label="Last Visit"
                value={dayjs(patient.lastVisit).format("D MMMM YYYY")}
              />

              <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
                <TypePill type={patient.visitType} />
                <StatusPill status={patient.status} />
              </div>
            </div>
          </>
        )}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);

// ── Edit drawer ────────────────────────────────────────────────────────────────
const EditDrawer = ({ patient, open, onOpenChange, onSave }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editPatientSchema),
  });

  // Re-fill the form whenever a different patient is opened for editing.
  // reset() is an imperative call into react-hook-form's internal state —
  // an external system relative to React — so it belongs in an effect,
  // not during render.
  useEffect(() => {
    if (patient && open) {
      reset({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        status: patient.status,
        assignedDoctor: patient.assignedDoctor,
      });
    }
  }, [patient, open, reset]);

  const submit = (data) => {
    onSave({ ...patient, ...data });
    onOpenChange(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(4px)",
          }}
        />
        <Drawer.Content
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 101,
            width: "100%",
            maxWidth: 440,
            background: "#fff",
            boxShadow: "-8px 0 40px rgba(15,23,42,0.18)",
            display: "flex",
            flexDirection: "column",
            outline: "none",
            fontFamily: "var(--font-body)",
          }}
        >
          {patient && (
            <>
              <div
                style={{
                  padding: "1.25rem 1.375rem",
                  borderBottom: "1px solid var(--hms-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Edit Patient
                  </h2>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {patient.id}
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    border: "1.5px solid var(--hms-border)",
                    background: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <div
                  data-lenis-prevent
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1.125rem 1.375rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <Field
                    label="Full Name"
                    required
                    error={errors.name?.message}
                  >
                    <Input {...register("name")} error={errors.name} />
                  </Field>
                  <Field label="Phone" required error={errors.phone?.message}>
                    <Input
                      {...register("phone")}
                      type="tel"
                      maxLength={10}
                      error={errors.phone}
                    />
                  </Field>
                  <Field label="Email" error={errors.email?.message}>
                    <Input
                      {...register("email")}
                      type="email"
                      error={errors.email}
                    />
                  </Field>
                  <Field
                    label="Address"
                    required
                    error={errors.address?.message}
                  >
                    <Textarea {...register("address")} error={errors.address} />
                  </Field>
                  <Field label="Status" required error={errors.status?.message}>
                    <FormSelect
                      name="status"
                      control={control}
                      options={STATUS_OPTIONS}
                      error={errors.status}
                      isSearchable={false}
                    />
                  </Field>
                  <Field
                    label="Assigned Doctor"
                    required
                    error={errors.assignedDoctor?.message}
                  >
                    <FormSelect
                      name="assignedDoctor"
                      control={control}
                      options={DOCTOR_OPTIONS}
                      error={errors.assignedDoctor}
                      isSearchable={false}
                      menuPlacement="top"
                    />
                  </Field>
                </div>

                <div
                  style={{
                    padding: "1rem 1.375rem",
                    borderTop: "1px solid var(--hms-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleSubmit(submit)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 1rem",
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
                    Save Changes
                  </button>
                </div>
              </form>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const PatientList = () => {
  const navigate = useNavigate();
  const { patients, updatePatient, deletePatient, restorePatient } =
    usePatients();
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  const handleDelete = (patient) => {
    deletePatient(patient.id);
    toast(`${patient.name} removed`, {
      description: "Patient record deleted from the list.",
      action: { label: "Undo", onClick: () => restorePatient(patient) },
    });
  };

  const handleSaveEdit = (updated) => {
    updatePatient(updated);
    toast.success("Patient updated", {
      description: `${updated.name}'s details have been saved.`,
    });
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("id", {
      header: "Patient ID",
      cell: (info) => (
        <span
          style={{
            fontWeight: 700,
            color: "var(--hms-blue)",
            fontSize: "0.8rem",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => {
        const p = info.row.original;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{ fontSize: "0.65rem", fontWeight: 800, color: "#fff" }}
              >
                {getInitials(p.name)}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--hms-navy)",
                  whiteSpace: "nowrap",
                }}
              >
                {p.name}
              </p>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8" }}>
                {p.age} yrs · {p.gender}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
      cell: (info) => (
        <span
          style={{
            fontSize: "0.82rem",
            color: "#475569",
            whiteSpace: "nowrap",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("visitType", {
      header: "Visit Type",
      filterFn: multiSelectFilter,
      cell: (info) => <TypePill type={info.getValue()} />,
    }),
    columnHelper.accessor("assignedDoctor", {
      header: "Doctor",
      cell: (info) => (
        <span
          style={{
            fontSize: "0.8rem",
            color: "#475569",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("lastVisit", {
      header: "Last Visit",
      cell: (info) => (
        <span
          style={{
            fontSize: "0.78rem",
            color: "#64748b",
            whiteSpace: "nowrap",
          }}
        >
          {dayjs(info.getValue()).format("D MMM YYYY")}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      filterFn: multiSelectFilter,
      cell: (info) => <StatusPill status={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <RowActions
          patient={info.row.original}
          onView={setViewing}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      ),
    }),
  ];

  const total = patients.length;
  const active = patients.filter((p) => p.status === "Active").length;
  const critical = patients.filter((p) => p.status === "Critical").length;

  return (
    <div className="opd-page" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .opd-page { container-type: inline-size; container-name: opd-list; }

        .opd-stats-grid { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 1.25rem; }
        .opd-stats-grid > div { min-width: 0; }
        @container opd-list (min-width: 480px) {
          .opd-stats-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .opd-row-action-trigger {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid var(--hms-border); background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748b; transition: all 0.15s;
        }
        .opd-row-action-trigger:hover { border-color: var(--hms-blue); color: var(--hms-blue); }

        .opd-row-action-btn {
          width: 100%; display: flex; align-items: center; gap: 9px;
          padding: 0.55rem 0.7rem; border-radius: 9px; border: none;
          background: transparent; cursor: pointer; font-family: var(--font-body);
          font-size: 0.85rem; font-weight: 500; color: var(--hms-navy);
          transition: background 0.15s;
        }
        .opd-row-action-btn:hover { background: var(--hms-surface); }
        .opd-row-action-danger { color: #dc2626; }
        .opd-row-action-danger:hover { background: #fef2f2; }
      `}</style>

      {/* ── Stats row ── */}
      <div className="opd-stats-grid">
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid var(--hms-border)",
            padding: "0.95rem 1.125rem",
            boxShadow: "var(--shadow-xs)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--hms-blue-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={18} style={{ color: "var(--hms-blue)" }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              {total}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Total Patients
            </p>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid var(--hms-border)",
            padding: "0.95rem 1.125rem",
            boxShadow: "var(--shadow-xs)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--hms-success-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={18} style={{ color: "var(--hms-success)" }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              {active}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Active Patients
            </p>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid var(--hms-border)",
            padding: "0.95rem 1.125rem",
            boxShadow: "var(--shadow-xs)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--hms-danger-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={18} style={{ color: "var(--hms-danger)" }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "var(--hms-navy)",
                margin: 0,
              }}
            >
              {critical}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Critical Cases
            </p>
          </div>
        </div>
      </div>

      {/* ── Register button ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/opd/register")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0.625rem 1.25rem",
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
          <UserPlus size={16} /> Register Patient
        </button>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={patients}
        title="Patient List"
        subtitle="Full OPD register · Click a row's ⋮ menu for actions"
        pageSize={10}
        filters={[
          {
            columnId: "status",
            label: "Status",
            options: Object.keys(STATUS_CONFIG),
          },
          {
            columnId: "visitType",
            label: "Visit Type",
            options: Object.keys(VISIT_TYPE_CONFIG),
          },
        ]}
      />

      <ViewDrawer
        patient={viewing}
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
      />
      <EditDrawer
        patient={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default PatientList;
