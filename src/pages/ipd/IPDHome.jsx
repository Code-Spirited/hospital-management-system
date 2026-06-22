// ─────────────────────────────────────────────────────────────────────────────
// IPDHome.jsx — Week 4, Monday
// Lightweight landing page for the IPD module: shows current admissions so
// there's an immediate way to verify the Admission Form worked. This is
// NOT the full Ward Management view (that's Tuesday's dedicated task,
// which will organize patients by ward/bed) — today's table is a simple,
// flat list across all wards.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { BedDouble, Activity, ClipboardPlus } from "lucide-react";
import { DataTable, multiSelectFilter } from "../../components/common";
import { useIPD } from "../../context/IPDContext";
import { ADMISSION_STATUS_CONFIG, WARD_TYPE_CONFIG } from "./ipdData";

const StatusPill = ({ status }) => {
  const cfg = ADMISSION_STATUS_CONFIG[status] || {
    color: "#94a3b8",
    bg: "#f8fafc",
  };
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
const WardPill = ({ type }) => {
  const cfg = WARD_TYPE_CONFIG[type] || { color: "#94a3b8", bg: "#f8fafc" };
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

const IPDHome = () => {
  const navigate = useNavigate();
  const { admissions } = useIPD();

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("id", {
      header: "Admission ID",
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
          <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8" }}>
            {info.row.original.patientId}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor("admittingDoctor", {
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
    columnHelper.accessor("wardType", {
      header: "Ward Type",
      filterFn: multiSelectFilter,
      cell: (info) => <WardPill type={info.getValue()} />,
    }),
    columnHelper.accessor("admissionDate", {
      header: "Admitted On",
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
  ];

  const total = admissions.length;
  const currentlyAdmitted = admissions.filter(
    (a) => a.status === "Admitted",
  ).length;
  const icuCount = admissions.filter(
    (a) => a.status === "Admitted" && a.wardType === "ICU",
  ).length;

  return (
    <div className="ipd-home" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .ipd-home { container-type: inline-size; container-name: ipd-home; }
        .ipd-stats-grid { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 1.25rem; }
        .ipd-stats-grid > div { min-width: 0; }
        @container ipd-home (min-width: 480px) { .ipd-stats-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>

      <div className="ipd-stats-grid">
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
            <BedDouble size={18} style={{ color: "var(--hms-blue)" }} />
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
              {currentlyAdmitted}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Currently Admitted
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
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={18} style={{ color: "#dc2626" }} />
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
              {icuCount}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              In ICU
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
            <ClipboardPlus size={18} style={{ color: "var(--hms-success)" }} />
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
              Total Admissions Recorded
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
          onClick={() => navigate("/ipd/admit")}
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
          <ClipboardPlus size={16} /> New Admission
        </button>
      </div>

      <DataTable
        columns={columns}
        data={admissions}
        title="Admissions"
        subtitle="All inpatient admissions · Ward-wise management arrives this week"
        pageSize={10}
        filters={[
          {
            columnId: "status",
            label: "Status",
            options: Object.keys(ADMISSION_STATUS_CONFIG),
          },
          {
            columnId: "wardType",
            label: "Ward Type",
            options: Object.keys(WARD_TYPE_CONFIG),
          },
        ]}
      />
    </div>
  );
};

export default IPDHome;
