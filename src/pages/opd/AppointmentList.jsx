// ─────────────────────────────────────────────────────────────────────────────
// AppointmentList.jsx — Week 3, Wednesday
//
// Full appointment management: book, view, reschedule, cancel — all backed
// by the shared AppointmentsContext. Patient selection in the booking form
// pulls live from PatientsContext, so the dropdown always reflects the real,
// current patient registry (including anyone added via OPD today).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "vaul";
import * as Popover from "@radix-ui/react-popover";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  CalendarPlus,
  CalendarClock,
  CheckCircle2,
  MoreVertical,
  Eye,
  RefreshCcw,
  Ban,
  X,
  Stethoscope,
  Clock,
  FileText,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  multiSelectFilter,
  FormField as Field,
  FormTextarea as Textarea,
  DrawerSelect,
  DateInput,
} from "../../components/common";
import { usePatients } from "../../context/PatientsContext";
import { useAppointments } from "../../context/AppointmentsContext";
import { useTablePagination } from "../../context/TablePaginationContext";
import { generateId } from "../../utils/generateId";
import { STATUS_CONFIG, VISIT_TYPE_CONFIG } from "./appointmentsData";
import { DOCTORS } from "./opdData";
import { appointmentSchema } from "./opdSchema";

const opt = (v) => ({ value: v, label: v });
const DOCTOR_OPTIONS = DOCTORS.map(opt);
const VISIT_TYPE_OPTIONS = Object.keys(VISIT_TYPE_CONFIG).map(opt);

// Fixed 30-minute slots, 8:00 AM–7:30 PM. A native select of predefined
// slots matches how clinics actually schedule, and sidesteps any
// native time-input rendering quirks entirely.
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30;
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const mm = String(totalMinutes % 60).padStart(2, "0");
  const value = `${hh}:${mm}`;
  return { value, label: dayjs(`2000-01-01T${value}`).format("h:mm A") };
});

// ── Badges ─────────────────────────────────────────────────────────────────
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

// ── Row action menu ─────────────────────────────────────────────────────────
const RowActions = ({ appt, onView, onReschedule, onCancel }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="opd-row-action-trigger"
          title="Actions"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <MoreVertical size={15} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="hms-popover-content"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-lg)",
            padding: "0.375rem",
            minWidth: 175,
            zIndex: 50,
            fontFamily: "var(--font-body)",
          }}
        >
          <button
            className="opd-row-action-btn"
            onClick={() => {
              setOpen(false);
              onView(appt);
            }}
          >
            <Eye size={14} /> View Details
          </button>
          {(appt.status === "Scheduled" || appt.status === "Consulted") && (
            <button
              className="opd-row-action-btn"
              onClick={() => navigate(`/opd/consultation/${appt.id}`)}
            >
              <Stethoscope size={14} />{" "}
              {appt.status === "Scheduled" ? "Start" : "Edit"} Consultation
            </button>
          )}
          {appt.status === "Scheduled" && (
            <>
              <button
                className="opd-row-action-btn"
                onClick={() => {
                  setOpen(false);
                  onReschedule(appt);
                }}
              >
                <RefreshCcw size={14} /> Reschedule
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
                onClick={() => {
                  setOpen(false);
                  onCancel(appt);
                }}
              >
                <Ban size={14} /> Cancel Appointment
              </button>
            </>
          )}
          {(appt.status === "Consulted" ||
            appt.status === "Prescribed" ||
            appt.status === "Completed") && (
            <button
              className="opd-row-action-btn"
              onClick={() => navigate(`/opd/prescription/${appt.id}`)}
            >
              <FileText size={14} /> {appt.prescription ? "Edit" : "Write"}{" "}
              Prescription
            </button>
          )}
          {(appt.status === "Consulted" ||
            appt.status === "Prescribed" ||
            appt.status === "Completed") && (
            <button
              className="opd-row-action-btn"
              onClick={() => navigate(`/opd/billing/${appt.id}`)}
            >
              <Receipt size={14} /> {appt.billing ? "Edit" : "Generate"} Bill
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

// ── Detail row ──────────────────────────────────────────────────────────────
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

// ── View drawer ──────────────────────────────────────────────────────────────
const ViewDrawer = ({ appt, open, onOpenChange }) => (
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
        {appt && (
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
                  {appt.patientName}
                </h2>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#94a3b8",
                    margin: "2px 0 0",
                    fontWeight: 600,
                  }}
                >
                  {appt.id}
                  {appt.patientId ? ` · ${appt.patientId}` : ""}
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
            <div
              data-lenis-prevent
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.125rem 1.375rem",
              }}
            >
              <DetailRow
                Icon={Stethoscope}
                label="Doctor"
                value={appt.doctor}
              />
              <DetailRow
                Icon={Clock}
                label="Date & Time"
                value={`${dayjs(appt.date).format("D MMMM YYYY")} at ${appt.time}`}
              />
              <DetailRow
                Icon={FileText}
                label="Reason for Visit"
                value={appt.reason}
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: "1rem",
                  marginBottom: appt.diagnosis ? "1rem" : 0,
                }}
              >
                <TypePill type={appt.visitType} />
                <StatusPill status={appt.status} />
              </div>

              {appt.diagnosis && (
                <>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: "var(--hms-blue)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      margin: "0.5rem 0 0.25rem",
                    }}
                  >
                    Clinical Record
                  </p>
                  <DetailRow
                    Icon={Stethoscope}
                    label="Diagnosis"
                    value={appt.diagnosis}
                  />
                  {appt.notes && (
                    <DetailRow
                      Icon={FileText}
                      label="Notes"
                      value={appt.notes}
                    />
                  )}
                </>
              )}

              {appt.prescription?.medicines?.length > 0 && (
                <>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: "var(--hms-blue)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      margin: "1.125rem 0 0.5rem",
                    }}
                  >
                    Prescription
                  </p>
                  {appt.prescription.medicines.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "0.5rem 0",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "var(--hms-navy)",
                          margin: 0,
                        }}
                      >
                        {m.medicine}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "#64748b",
                          margin: "2px 0 0",
                        }}
                      >
                        {m.dosage} · {m.frequency} · {m.duration}
                        {m.instructions ? ` · ${m.instructions}` : ""}
                      </p>
                    </div>
                  ))}
                </>
              )}

              {appt.billing && (
                <>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: "var(--hms-blue)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      margin: "1.125rem 0 0.5rem",
                    }}
                  >
                    Billing
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--hms-navy)",
                      }}
                    >
                      Total: ₹
                      {Math.round(appt.billing.total).toLocaleString("en-IN")}
                    </span>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background:
                          appt.billing.paymentStatus === "Paid"
                            ? "#ecfdf5"
                            : appt.billing.paymentStatus === "Partial"
                              ? "#fffbeb"
                              : "#fef2f2",
                        color:
                          appt.billing.paymentStatus === "Paid"
                            ? "#059669"
                            : appt.billing.paymentStatus === "Partial"
                              ? "#d97706"
                              : "#dc2626",
                      }}
                    >
                      {appt.billing.paymentStatus}
                    </span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);

// Shows the selected patient's identifying details the instant an ID is
// picked — directly solving "two people can share the exact same name."
// Re-renders live as the watched patientId changes.
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

// ── Book / Reschedule drawer ──────────────────────────────────────────────────
const BookingDrawer = ({ open, onOpenChange, editingAppt, onSubmitAppt }) => {
  const { patients } = usePatients();
  // Labels carry age/gender/phone too — patients can share a name, and this
  // is the detail that disambiguates them inside the dropdown itself.
  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.id} · ${p.age}y, ${p.gender}`,
  }));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
  });

  // Pre-fill when rescheduling an existing appointment; blank for a new booking.
  useEffect(() => {
    if (!open) return;
    if (editingAppt) {
      reset({
        patientId: editingAppt.patientId,
        doctor: editingAppt.doctor,
        date: dayjs(editingAppt.date).format("DD-MM-YYYY"),
        time: editingAppt.time,
        visitType: editingAppt.visitType,
        reason: editingAppt.reason,
      });
    } else {
      reset({
        patientId: "",
        doctor: "",
        date: "",
        time: "",
        visitType: "",
        reason: "",
      });
    }
  }, [open, editingAppt, reset]);

  const submit = (data) => {
    const isoDate = dayjs(data.date, "DD-MM-YYYY").format("YYYY-MM-DD");
    const patient = patients.find((p) => p.id === data.patientId);
    onSubmitAppt({ ...data, date: isoDate, patientName: patient?.name ?? "" });
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
          <div
            style={{
              padding: "1.25rem 1.375rem",
              borderBottom: "1px solid var(--hms-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {editingAppt ? "Reschedule Appointment" : "Book Appointment"}
            </h2>
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
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              data-lenis-prevent
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                padding: "1.125rem 1.375rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <Field label="Patient" required error={errors.patientId?.message}>
                <DrawerSelect
                  name="patientId"
                  control={control}
                  options={patientOptions}
                  error={errors.patientId}
                  placeholder="Search by name or ID"
                  searchable
                />
              </Field>
              <SelectedPatientCard control={control} patients={patients} />
              <Field label="Doctor" required error={errors.doctor?.message}>
                <DrawerSelect
                  name="doctor"
                  control={control}
                  options={DOCTOR_OPTIONS}
                  error={errors.doctor}
                  placeholder="Select doctor"
                />
              </Field>
              <Field label="Date" required error={errors.date?.message}>
                <DateInput {...register("date")} error={errors.date} />
              </Field>
              <Field label="Time" required error={errors.time?.message}>
                <DrawerSelect
                  name="time"
                  control={control}
                  options={TIME_SLOTS}
                  error={errors.time}
                  placeholder="Select time"
                />
              </Field>
              <Field
                label="Visit Type"
                required
                error={errors.visitType?.message}
              >
                <DrawerSelect
                  name="visitType"
                  control={control}
                  options={VISIT_TYPE_OPTIONS}
                  error={errors.visitType}
                  placeholder="Select visit type"
                />
              </Field>
              <Field
                label="Reason for Visit"
                required
                error={errors.reason?.message}
              >
                <Textarea
                  {...register("reason")}
                  error={errors.reason}
                  placeholder="Brief reason for this appointment..."
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
                {editingAppt ? "Save Changes" : "Book Appointment"}
              </button>
            </div>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const AppointmentList = () => {
  const { appointments, addAppointment, updateAppointment, cancelAppointment } =
    useAppointments();
  const { getPageIndex, setPageIndex } = useTablePagination();
  const [viewing, setViewing] = useState(null);
  const [booking, setBooking] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  const handleCancel = (appt) => {
    cancelAppointment(appt.id);
    toast(`Appointment ${appt.id} cancelled`, {
      description: `${appt.patientName}'s appointment has been cancelled.`,
    });
  };

  const handleSubmitAppt = (data) => {
    if (editingAppt) {
      updateAppointment({ ...editingAppt, ...data });
      toast.success("Appointment rescheduled", {
        description: `${data.patientName}'s appointment has been updated.`,
      });
    } else {
      const newId = generateId("APT", 2021, 500);
      addAppointment({ id: newId, status: "Scheduled", ...data });
      toast.success("Appointment booked", {
        description: `${data.patientName} — ${dayjs(data.date).format("D MMM")} at ${data.time}`,
      });
    }
    setEditingAppt(null);
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("id", {
      header: "Appointment ID",
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
    columnHelper.accessor("patientName", {
      header: "Patient",
      cell: (info) => (
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "var(--hms-navy)",
              whiteSpace: "nowrap",
            }}
          >
            {info.getValue()}
          </p>
          {info.row.original.patientId && (
            <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8" }}>
              {info.row.original.patientId}
            </p>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("doctor", {
      header: "Doctor",
      cell: (info) => (
        <span
          style={{
            fontSize: "0.82rem",
            color: "#475569",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("date", {
      header: "Date & Time",
      cell: (info) => (
        <span
          style={{
            fontSize: "0.78rem",
            color: "#64748b",
            whiteSpace: "nowrap",
          }}
        >
          {dayjs(info.getValue()).format("D MMM YYYY")} ·{" "}
          {info.row.original.time}
        </span>
      ),
    }),
    columnHelper.accessor("visitType", {
      header: "Type",
      filterFn: multiSelectFilter,
      cell: (info) => <TypePill type={info.getValue()} />,
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
          appt={info.row.original}
          onView={setViewing}
          onReschedule={(a) => {
            setEditingAppt(a);
            setBooking(true);
          }}
          onCancel={handleCancel}
        />
      ),
    }),
  ];

  const today = dayjs().format("YYYY-MM-DD");
  const todayCount = appointments.filter((a) => a.date === today).length;
  const scheduledCount = appointments.filter(
    (a) => a.status === "Scheduled",
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "Completed",
  ).length;

  return (
    <div className="opd-page" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .opd-page { container-type: inline-size; container-name: opd-list; }
        .opd-stats-grid { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 1.25rem; }
        .opd-stats-grid > div { min-width: 0; }
        @container opd-list (min-width: 480px) { .opd-stats-grid { grid-template-columns: repeat(3, 1fr); } }

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
            <CalendarClock size={18} style={{ color: "var(--hms-blue)" }} />
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
              {todayCount}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Today
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
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarClock size={18} style={{ color: "#2563eb" }} />
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
              {scheduledCount}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Scheduled
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
            <CheckCircle2 size={18} style={{ color: "var(--hms-success)" }} />
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
              {completedCount}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Completed
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={() => {
            setEditingAppt(null);
            setBooking(true);
          }}
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
          <CalendarPlus size={16} /> Book Appointment
        </button>
      </div>

      <DataTable
        columns={columns}
        data={appointments}
        title="Appointments"
        subtitle="Click a row's ⋮ menu for actions"
        pageSize={10}
        initialPageIndex={getPageIndex("opd-appointments")}
        onPageIndexChange={(i) => setPageIndex("opd-appointments", i)}
        filters={[
          {
            columnId: "status",
            label: "Status",
            options: Object.keys(STATUS_CONFIG),
          },
          {
            columnId: "visitType",
            label: "Type",
            options: Object.keys(VISIT_TYPE_CONFIG),
          },
        ]}
      />

      <ViewDrawer
        appt={viewing}
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
      />
      <BookingDrawer
        open={booking}
        onOpenChange={(o) => {
          setBooking(o);
          if (!o) setEditingAppt(null);
        }}
        editingAppt={editingAppt}
        onSubmitAppt={handleSubmitAppt}
      />
    </div>
  );
};

export default AppointmentList;
