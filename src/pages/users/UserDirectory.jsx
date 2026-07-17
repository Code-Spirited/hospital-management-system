// ─────────────────────────────────────────────────────────────────────────────
// UserDirectory.jsx — Week 6, Monday (updated Tuesday: Edit, Add User button)
//
// Row actions are View Details + Edit User only — deliberately no
// Delete. Removing a system user account would orphan every historical
// record referencing them (who discharged a patient, who logged a
// treatment, who processed a sale); the correct action for someone
// leaving is changing Status to Inactive/Suspended via Edit, which stays
// fully supported. lastLogin is null-checked everywhere it's displayed —
// a brand-new user genuinely has never logged in, unlike every seeded
// user from Monday which all carry a real timestamp.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "vaul";
import * as Popover from "@radix-ui/react-popover";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Users,
  UserCheck,
  Stethoscope,
  UserX,
  ShieldOff,
  UserPlus,
  Eye,
  Pencil,
  MoreVertical,
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  IdCard,
} from "lucide-react";
import {
  DataTable,
  multiSelectFilter,
  FormField as Field,
  FormInput as Input,
  DrawerSelect,
} from "../../components/common";
import { useUsers } from "../../context/UsersContext";
import { useTablePagination } from "../../context/TablePaginationContext";
import AsyncErrorBanner from "../../components/common/AsyncErrorBanner/AsyncErrorBanner";
import { ROLE_CONFIG, USER_STATUS_CONFIG, DEPARTMENTS } from "./userData";
import { editUserSchema } from "./userSchema";

const getInitials = (name) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const RolePill = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || { color: "#94a3b8", bg: "#f8fafc" };
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
      {role}
    </span>
  );
};
const StatusPill = ({ status }) => {
  const cfg = USER_STATUS_CONFIG[status] || { color: "#94a3b8", bg: "#f8fafc" };
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

// ── Row action menu (View / Edit only — see file header for why no Delete) ──
const RowActions = ({ user, onView, onEdit }) => {
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
          className="users-row-action-trigger"
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
            minWidth: 170,
            zIndex: 50,
            fontFamily: "var(--font-body)",
          }}
        >
          <button
            className="users-row-action-btn"
            onClick={() => {
              setOpen(false);
              onView(user);
            }}
          >
            <Eye size={14} /> View Details
          </button>
          <button
            className="users-row-action-btn"
            onClick={() => {
              setOpen(false);
              onEdit(user);
            }}
          >
            <Pencil size={14} /> Edit User
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const ViewDrawer = ({ user, open, onOpenChange }) => (
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
        {user && (
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
                    {getInitials(user.fullName)}
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
                    {user.fullName}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {user.id}
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
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
                <RolePill role={user.role} />
                <StatusPill status={user.status} />
              </div>

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
              <DetailRow Icon={Mail} label="Email" value={user.email} />
              <DetailRow Icon={Phone} label="Phone" value={user.phone} />

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
                Role & Department
              </p>
              <DetailRow
                Icon={Building2}
                label="Department"
                value={user.department}
              />
              <DetailRow Icon={IdCard} label="Gender" value={user.gender} />

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
                Employment
              </p>
              <DetailRow
                Icon={Calendar}
                label="Joined On"
                value={dayjs(user.joinedOn).format("D MMMM YYYY")}
              />
              <DetailRow
                Icon={Clock}
                label="Last Login"
                value={
                  user.lastLogin
                    ? `${dayjs(user.lastLogin).format("D MMM YYYY, h:mm A")} · ${dayjs(user.lastLogin).fromNow()}`
                    : "Never logged in"
                }
              />
            </div>
          </>
        )}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);

// ── Edit drawer — Full Name/Email/Phone/Role/Department/Status only.
// Gender and Joined-On are NOT editable here — same immutable-identity
// principle already used for editPatientSchema's exclusion of DOB. Uses
// DrawerSelect (not FormSelect) for every dropdown — permanent
// architectural rule: native controls only inside vaul Drawers, since a
// portaled react-select menu conflicts with vaul's own outside-click
// detection.
const EditDrawer = ({ user, open, onOpenChange, onSave, users }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: async (values, context, options) => {
      const result = await zodResolver(editUserSchema)(
        values,
        context,
        options,
      );
      if (Object.keys(result.errors).length === 0 && user) {
        const emailTaken = users.some(
          (u) =>
            u.id !== user.id &&
            u.email.trim().toLowerCase() === values.email.trim().toLowerCase(),
        );
        if (emailTaken) {
          return {
            values: {},
            errors: {
              email: {
                type: "manual",
                message: "This email is already registered to another user",
              },
            },
          };
        }
      }
      return result;
    },
  });

  useEffect(() => {
    if (user && open) {
      reset({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        status: user.status,
      });
    }
  }, [user, open, reset]);

  const submit = (data) => {
    onSave({ ...user, ...data });
    onOpenChange(false);
  };

  const ROLE_OPTIONS = Object.keys(ROLE_CONFIG).map((v) => ({
    value: v,
    label: v,
  }));
  const DEPARTMENT_OPTIONS = DEPARTMENTS.map((v) => ({ value: v, label: v }));
  const STATUS_OPTIONS = Object.keys(USER_STATUS_CONFIG).map((v) => ({
    value: v,
    label: v,
  }));

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
          {user && (
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
                    Edit User
                  </h2>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {user.id}
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
                  <Field
                    label="Full Name"
                    required
                    error={errors.fullName?.message}
                  >
                    <Input {...register("fullName")} error={errors.fullName} />
                  </Field>
                  <Field label="Email" required error={errors.email?.message}>
                    <Input
                      {...register("email")}
                      type="email"
                      error={errors.email}
                    />
                  </Field>
                  <Field label="Phone" required error={errors.phone?.message}>
                    <Input
                      {...register("phone")}
                      type="tel"
                      maxLength={10}
                      error={errors.phone}
                    />
                  </Field>
                  <Field label="Role" required error={errors.role?.message}>
                    <DrawerSelect
                      name="role"
                      control={control}
                      options={ROLE_OPTIONS}
                      error={errors.role}
                      placeholder="Select role"
                    />
                  </Field>
                  <Field
                    label="Department"
                    required
                    error={errors.department?.message}
                  >
                    <DrawerSelect
                      name="department"
                      control={control}
                      options={DEPARTMENT_OPTIONS}
                      error={errors.department}
                      placeholder="Select department"
                      searchable
                    />
                  </Field>
                  <Field label="Status" required error={errors.status?.message}>
                    <DrawerSelect
                      name="status"
                      control={control}
                      options={STATUS_OPTIONS}
                      error={errors.status}
                      placeholder="Select status"
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

const UserDirectory = () => {
  const navigate = useNavigate();
  const { users, isLoading, error, refetch, updateUser } = useUsers();
  const { getPageIndex, setPageIndex } = useTablePagination();
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  const handleSaveEdit = (updated) => {
    updateUser(updated);
    toast.success("User updated", {
      description: `${updated.fullName}'s details have been saved.`,
    });
  };

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === "Active").length;
  const activeDoctors = users.filter(
    (u) => u.role === "Doctor" && u.status === "Active",
  ).length;
  const inactiveCount = users.filter((u) => u.status === "Inactive").length;
  const suspendedCount = users.filter((u) => u.status === "Suspended").length;

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("fullName", {
      header: "User",
      cell: (info) => {
        const u = info.row.original;
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
                {getInitials(u.fullName)}
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
                {u.fullName}
              </p>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8" }}>
                {u.email}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("role", {
      header: "Role",
      filterFn: multiSelectFilter,
      cell: (info) => <RolePill role={info.getValue()} />,
    }),
    columnHelper.accessor("department", {
      header: "Department",
      filterFn: multiSelectFilter,
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
    columnHelper.accessor("phone", {
      header: "Contact",
      cell: (info) => (
        <span
          style={{
            fontSize: "0.82rem",
            color: "#64748b",
            whiteSpace: "nowrap",
          }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      filterFn: multiSelectFilter,
      cell: (info) => <StatusPill status={info.getValue()} />,
    }),
    columnHelper.accessor("lastLogin", {
      header: "Last Login",
      cell: (info) => {
        const v = info.getValue();
        return (
          <span
            style={{
              fontSize: "0.78rem",
              color: v ? "#94a3b8" : "#cbd5e1",
              whiteSpace: "nowrap",
              fontStyle: v ? "normal" : "italic",
            }}
          >
            {v ? dayjs(v).fromNow() : "Never logged in"}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <RowActions
          user={info.row.original}
          onView={setViewing}
          onEdit={setEditing}
        />
      ),
    }),
  ];

  return (
    <div className="users-page" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .users-page { container-type: inline-size; container-name: users-page; }
        .users-stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.875rem; margin-bottom: 1.25rem;
        }
        .users-row-action-trigger {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid var(--hms-border); background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748b; transition: all 0.15s;
        }
        .users-row-action-trigger:hover { border-color: var(--hms-blue); color: var(--hms-blue); }
        .users-row-action-btn {
          width: 100%; display: flex; align-items: center; gap: 9px;
          padding: 0.55rem 0.7rem; border-radius: 9px; border: none;
          background: transparent; cursor: pointer; font-family: var(--font-body);
          font-size: 0.85rem; font-weight: 500; color: var(--hms-navy);
          transition: background 0.15s;
        }
        .users-row-action-btn:hover { background: var(--hms-surface); }
      `}</style>

      <AsyncErrorBanner error={error} onRetry={refetch} label="users" />

      {isLoading && (
        <p
          style={{
            fontSize: "0.78rem",
            color: "#94a3b8",
            fontWeight: 600,
            margin: "0 0 0.875rem",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              border: "2px solid #e2e8f0",
              borderTopColor: "var(--hms-blue)",
              borderRadius: "50%",
              animation: "usr-spin 0.7s linear infinite",
              display: "inline-block",
            }}
          />
          Refreshing users…
        </p>
      )}
      <style>{`@keyframes usr-spin { to { transform: rotate(360deg); } }`}</style>

      <div className="users-stats-grid">
        {[
          {
            label: "Total Users",
            value: totalUsers,
            Icon: Users,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "Active",
            value: activeCount,
            Icon: UserCheck,
            color: "var(--hms-success)",
            bg: "var(--hms-success-bg)",
          },
          {
            label: "Doctors on Staff",
            value: activeDoctors,
            Icon: Stethoscope,
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Inactive",
            value: inactiveCount,
            Icon: UserX,
            color: "#64748b",
            bg: "#f1f5f9",
          },
          {
            label: "Suspended",
            value: suspendedCount,
            Icon: ShieldOff,
            color: "#dc2626",
            bg: "#fef2f2",
          },
        ].map((s) => (
          <div
            key={s.label}
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
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.Icon size={18} style={{ color: s.color }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--hms-navy)",
                  margin: 0,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/users/add")}
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
          <UserPlus size={16} /> Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        title="User Directory"
        subtitle="All system users · Click a row's ⋮ menu for actions"
        pageSize={10}
        initialPageIndex={getPageIndex("users-directory")}
        onPageIndexChange={(i) => setPageIndex("users-directory", i)}
        searchPlaceholder="Search name, email, role..."
        emptyMessage="No users found"
        rowNoun="users"
        filters={[
          {
            columnId: "role",
            label: "Role",
            options: Object.keys(ROLE_CONFIG),
          },
          { columnId: "department", label: "Department", options: DEPARTMENTS },
          {
            columnId: "status",
            label: "Status",
            options: Object.keys(USER_STATUS_CONFIG),
          },
        ]}
      />

      <ViewDrawer
        user={viewing}
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
      />
      <EditDrawer
        user={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSave={handleSaveEdit}
        users={users}
      />
    </div>
  );
};

export default UserDirectory;
