// ─────────────────────────────────────────────────────────────────────────────
// IPDHome.jsx — Week 4, Monday (Tue: ward filter, Sat: actions → dropdown)
// Lightweight landing page for the IPD module: the full admissions list.
//
// Actions consolidated into a single ⋮ dropdown menu today — Treatment,
// Discharge, and Billing as three separate inline buttons was starting to
// overcrowd the row, especially on narrow screens. Matches the same
// Popover-menu pattern already used in OPD's Patient List/Appointments.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import * as Popover from "@radix-ui/react-popover";
import { Drawer } from "vaul";
import dayjs from "dayjs";
import {
  BedDouble,
  Activity,
  ClipboardPlus,
  ClipboardList,
  LogOut,
  Receipt,
  MoreVertical,
  X,
  Eye,
  User2,
  Stethoscope,
  Calendar,
  Phone,
  FileText,
} from "lucide-react";
import { DataTable, multiSelectFilter } from "../../components/common";
import Abbr from "../../components/common/Abbr/Abbr";
import { usePatients } from "../../context/PatientsContext";
import { useIPD } from "../../context/IPDContext";
import { useTablePagination } from "../../context/TablePaginationContext";
import {
  ADMISSION_STATUS_CONFIG,
  WARD_TYPE_CONFIG,
  CONDITION_AT_DISCHARGE_CONFIG,
} from "./ipdData";

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
      <Abbr underline={false}>{type}</Abbr>
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

// Read-only summary of one admission — vitals/treatment/discharge/billing
// status are each shown as a quick fact with a link to their dedicated
// page for anything that needs editing, rather than duplicating those
// pages' full forms here.
const ViewDrawer = ({ admission, patient, open, onOpenChange, navigate }) => (
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
        {admission && (
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
                  <User2 size={20} color="#fff" />
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
                    {admission.patientName}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                      margin: "2px 0 0",
                      fontWeight: 600,
                    }}
                  >
                    {admission.id}
                    {patient ? ` · ${patient.age} yrs · ${patient.gender}` : ""}
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
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: (WARD_TYPE_CONFIG[admission.wardType] || {}).bg,
                    color: (WARD_TYPE_CONFIG[admission.wardType] || {}).color,
                  }}
                >
                  {admission.wardType}
                </span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: (
                      ADMISSION_STATUS_CONFIG[admission.status] || {}
                    ).bg,
                    color: (ADMISSION_STATUS_CONFIG[admission.status] || {})
                      .color,
                  }}
                >
                  {admission.status}
                </span>
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
                Admission Details
              </p>
              <DetailRow
                Icon={Stethoscope}
                label="Admitting Doctor"
                value={admission.admittingDoctor}
              />
              <DetailRow
                Icon={Calendar}
                label="Admitted On"
                value={dayjs(admission.admissionDate).format("D MMMM YYYY")}
              />
              <DetailRow
                Icon={BedDouble}
                label="Bed"
                value={
                  admission.bedNumber
                    ? `${admission.wardType} Bed ${admission.bedNumber}`
                    : admission.status === "Discharged"
                      ? "No bed number on record"
                      : "Not yet assigned"
                }
              />
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
                Attendant
              </p>
              <DetailRow
                Icon={User2}
                label="Name"
                value={admission.attendantName}
              />
              <DetailRow
                Icon={Phone}
                label="Phone"
                value={admission.attendantPhone}
              />

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
                Stay Progress
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--hms-navy)",
                    fontWeight: 600,
                  }}
                >
                  Treatment Records: {(admission.treatmentRecords || []).length}{" "}
                  logged
                </span>
                <button
                  onClick={() => navigate(`/ipd/treatment/${admission.id}`)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--hms-blue)",
                    cursor: "pointer",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    padding: 0,
                  }}
                >
                  Open →
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--hms-navy)",
                    fontWeight: 600,
                  }}
                >
                  {admission.status === "Discharged" ? (
                    admission.dischargeSummary?.conditionAtDischarge ? (
                      <>
                        Discharged ·{" "}
                        <span
                          style={{
                            color: (
                              CONDITION_AT_DISCHARGE_CONFIG[
                                admission.dischargeSummary.conditionAtDischarge
                              ] || {}
                            ).color,
                          }}
                        >
                          {admission.dischargeSummary.conditionAtDischarge}
                        </span>
                      </>
                    ) : (
                      "Discharged"
                    )
                  ) : (
                    "Not yet discharged"
                  )}
                </span>
                <button
                  onClick={() => navigate(`/ipd/discharge/${admission.id}`)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--hms-blue)",
                    cursor: "pointer",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    padding: 0,
                  }}
                >
                  Open →
                </button>
              </div>

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
                    fontSize: "0.82rem",
                    color: "var(--hms-navy)",
                    fontWeight: 600,
                  }}
                >
                  {admission.billing
                    ? `Billed · ₹${Math.round(admission.billing.total).toLocaleString("en-IN")}`
                    : "Not yet billed"}
                </span>
                <button
                  onClick={() => navigate(`/ipd/billing/${admission.id}`)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--hms-blue)",
                    cursor: "pointer",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    padding: 0,
                  }}
                >
                  Open →
                </button>
              </div>
            </div>
          </>
        )}
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
);

const RowActions = ({ admission, navigate, onView }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 49 }}
          onPointerDown={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className="ipd-row-action-trigger"
            style={{ position: "relative", zIndex: 50 }}
            title="Actions"
          >
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
              minWidth: 190,
              zIndex: 50,
              fontFamily: "var(--font-body)",
            }}
          >
            <button
              className="ipd-row-action-btn"
              onClick={() => {
                setOpen(false);
                onView(admission);
              }}
            >
              <Eye size={14} /> View Details
            </button>
            <div
              style={{
                height: 1,
                background: "var(--hms-border)",
                margin: "0.3rem 0",
              }}
            />
            <button
              className="ipd-row-action-btn"
              onClick={() => {
                setOpen(false);
                navigate(`/ipd/treatment/${admission.id}`);
              }}
            >
              <ClipboardList size={14} /> Treatment Records
            </button>
            <button
              className="ipd-row-action-btn"
              onClick={() => {
                setOpen(false);
                navigate(`/ipd/discharge/${admission.id}`);
              }}
            >
              <LogOut size={14} />{" "}
              {admission.status === "Discharged"
                ? "View Discharge Summary"
                : "Discharge Patient"}
            </button>
            <button
              className="ipd-row-action-btn"
              onClick={() => {
                setOpen(false);
                navigate(`/ipd/billing/${admission.id}`);
              }}
            >
              <Receipt size={14} />{" "}
              {admission.billing ? "Edit Bill" : "Generate Bill"}
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
};

const IPDHome = () => {
  const navigate = useNavigate();
  const { admissions } = useIPD();
  const { patients } = usePatients();
  const { getPageIndex, setPageIndex } = useTablePagination();
  const [searchParams, setSearchParams] = useSearchParams();
  const wardFilter = searchParams.get("ward");
  const [viewing, setViewing] = useState(null);

  const initialColumnFilters = wardFilter
    ? [{ id: "wardType", value: [wardFilter] }]
    : [];

  const clearWardFilter = () => {
    setSearchParams({});
    navigate(0);
  };

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
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <RowActions
          admission={info.row.original}
          navigate={navigate}
          onView={setViewing}
        />
      ),
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

        .ipd-row-action-trigger {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid var(--hms-border); background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748b; transition: all 0.15s;
        }
        .ipd-row-action-trigger:hover { border-color: var(--hms-blue); color: var(--hms-blue); }
        .ipd-row-action-btn {
          width: 100%; display: flex; align-items: center; gap: 9px;
          padding: 0.55rem 0.7rem; border-radius: 9px; border: none;
          background: transparent; cursor: pointer; font-family: var(--font-body);
          font-size: 0.85rem; font-weight: 500; color: var(--hms-navy);
          transition: background 0.15s;
        }
        .ipd-row-action-btn:hover { background: var(--hms-surface); }
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
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {wardFilter ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.5rem 0.875rem",
              borderRadius: 10,
              background: "var(--hms-blue-light)",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--hms-blue)",
              }}
            >
              Showing <strong>{wardFilter}</strong> ward admissions only
            </span>
            <button
              onClick={clearWardFilter}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                border: "none",
                background: "transparent",
                color: "var(--hms-blue)",
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: 700,
                fontFamily: "var(--font-body)",
              }}
            >
              <X size={13} /> Clear
            </button>
          </div>
        ) : (
          <div />
        )}
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
        subtitle="All inpatient admissions · Click a row's ⋮ menu for actions"
        pageSize={10}
        initialColumnFilters={initialColumnFilters}
        initialPageIndex={getPageIndex("ipd-admissions")}
        onPageIndexChange={(i) => setPageIndex("ipd-admissions", i)}
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

      <ViewDrawer
        admission={viewing}
        patient={
          viewing?.patientId
            ? patients.find((p) => p.id === viewing.patientId)
            : null
        }
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        navigate={navigate}
      />
    </div>
  );
};

export default IPDHome;
