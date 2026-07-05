// ─────────────────────────────────────────────────────────────────────────────
// UserDirectory.jsx — Week 6, Monday
// The master, read-oriented view of every system user — mirrors the
// PatientList/MedicineInventory pattern exactly. Every searchable
// attribute (name, email, role, department) is already a visible
// rendered column, so TanStack's default global search works correctly
// out of the box — unlike Pharmacy's Inventory, which needed a custom
// globalFilterFn because batch-level facts weren't rendered as columns
// at all. No such gap exists here, so the simpler default is used.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Drawer } from "vaul";
import dayjs from "dayjs";
import {
  Users,
  UserCheck,
  Stethoscope,
  UserX,
  ShieldOff,
  Eye,
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  IdCard,
} from "lucide-react";
import { DataTable, multiSelectFilter } from "../../components/common";
import { useUsers } from "../../context/UsersContext";
import { useTablePagination } from "../../context/TablePaginationContext";
import { ROLE_CONFIG, USER_STATUS_CONFIG, DEPARTMENTS } from "./userData";

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
                value={`${dayjs(user.lastLogin).format("D MMM YYYY, h:mm A")} · ${dayjs(user.lastLogin).fromNow()}`}
              />
            </div>
          </>
        )}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);

const UserDirectory = () => {
  const { users } = useUsers();
  const { getPageIndex, setPageIndex } = useTablePagination();
  const [viewing, setViewing] = useState(null);

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
      cell: (info) => (
        <span
          style={{
            fontSize: "0.78rem",
            color: "#94a3b8",
            whiteSpace: "nowrap",
          }}
        >
          {dayjs(info.getValue()).fromNow()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <button
          onClick={() => setViewing(info.row.original)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0.4rem 0.75rem",
            borderRadius: 8,
            border: "1.5px solid var(--hms-border)",
            background: "#fff",
            color: "#64748b",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <Eye size={13} /> View
        </button>
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
      `}</style>

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

      <DataTable
        columns={columns}
        data={users}
        title="User Directory"
        subtitle="All system users · Click a row's View button for full details"
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
    </div>
  );
};

export default UserDirectory;
