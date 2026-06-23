// ─────────────────────────────────────────────────────────────────────────────
// BedAllocation.jsx — Week 4, Wednesday
//
// Assigns a SPECIFIC bed number within a ward to an admitted patient — the
// granular complement to Tuesday's category-level Ward Management.
//
// Interaction: select a patient from "Needs Bed Assignment", then click an
// empty bed square in that same ward to place them there. Click an
// occupied bed instead to see who's there and optionally Release it
// (frees the bed without discharging the patient — e.g. an in-ward
// transfer).
//
// Note: the bed grid reflects SPECIFIC bed assignments only. A ward's true
// occupied count (shown in its header badge, matching Ward Management)
// may be higher than the number of filled grid squares whenever patients
// are admitted but not yet assigned a specific bed — exactly the backlog
// this page exists to resolve, not a bug.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import * as Popover from "@radix-ui/react-popover";
import {
  BedDouble,
  Users,
  Lock,
  Activity,
  User2,
  Check,
  X,
} from "lucide-react";
import { useIPD } from "../../context/IPDContext";
import { WARD_TYPE_CONFIG, WARD_CAPACITY } from "./ipdData";

const WARD_ICONS = {
  General: BedDouble,
  "Semi-Private": Users,
  Private: Lock,
  ICU: Activity,
};

const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const BedAllocation = () => {
  const { admissions, updateAdmission } = useIPD();
  const [selectedId, setSelectedId] = useState(null);
  const selected = admissions.find((a) => a.id === selectedId) || null;

  const wards = Object.keys(WARD_TYPE_CONFIG).map((type) => {
    const wardAdmitted = admissions.filter(
      (a) => a.status === "Admitted" && a.wardType === type,
    );
    const unassigned = wardAdmitted.filter((a) => !a.bedNumber);
    const bedMap = {};
    wardAdmitted.forEach((a) => {
      if (a.bedNumber) bedMap[a.bedNumber] = a;
    });
    return {
      ward: type,
      capacity: WARD_CAPACITY[type],
      occupiedTotal: wardAdmitted.length,
      assignedCount: Object.keys(bedMap).length,
      unassigned,
      bedMap,
      color: WARD_TYPE_CONFIG[type].color,
      bg: WARD_TYPE_CONFIG[type].bg,
      Icon: WARD_ICONS[type],
    };
  });

  const totalCapacity = Object.values(WARD_CAPACITY).reduce((a, b) => a + b, 0);
  const totalAssigned = wards.reduce((sum, w) => sum + w.assignedCount, 0);
  const totalAwaiting = wards.reduce((sum, w) => sum + w.unassigned.length, 0);

  const togglePick = (admission) =>
    setSelectedId((prev) => (prev === admission.id ? null : admission.id));

  const handleAssign = (ward, bedNum) => {
    if (!selected) {
      toast("Select a patient first", {
        description:
          'Pick someone from "Needs Bed Assignment" below, then click an available bed.',
      });
      return;
    }
    if (selected.wardType !== ward) {
      toast.error("Wrong ward", {
        description: `${selected.patientName} is admitted in ${selected.wardType}, not ${ward}.`,
      });
      return;
    }
    updateAdmission({ ...selected, bedNumber: bedNum });
    toast.success("Bed assigned", {
      description: `${selected.patientName} → ${ward} Bed ${bedNum}`,
    });
    setSelectedId(null);
  };

  const handleRelease = (admission, ward) => {
    updateAdmission({ ...admission, bedNumber: null });
    toast(`Bed released`, {
      description: `${admission.patientName} no longer has a specific ${ward} bed assigned.`,
    });
  };

  return (
    <div className="bed-page" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .bed-page { container-type: inline-size; container-name: bed-page; }

        .bed-stats-grid { display: grid; grid-template-columns: 1fr; gap: 0.875rem; margin-bottom: 1.25rem; }
        @container bed-page (min-width: 480px) { .bed-stats-grid { grid-template-columns: repeat(3, 1fr); } }

        .bed-wards-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        @container bed-page (min-width: 760px) { .bed-wards-grid { grid-template-columns: repeat(2, 1fr); } }

        .bed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); gap: 6px; }

        .bed-cell-available {
          aspect-ratio: 1; border-radius: 7px; background: #fff;
          border: 1.5px dashed #cbd5e1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem; font-weight: 700; color: #94a3b8;
          transition: all 0.15s;
        }
        .bed-cell-available:hover { background: var(--hms-surface); transform: scale(1.06); }

        .bed-cell-occupied {
          aspect-ratio: 1; border-radius: 7px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.62rem; font-weight: 800; color: #fff;
          transition: transform 0.15s;
        }
        .bed-cell-occupied:hover { transform: scale(1.08); }

        .bed-patient-chip {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 11px; border-radius: 20px; cursor: pointer;
          font-size: 0.78rem; font-weight: 600; transition: all 0.15s;
          border: 1.5px solid var(--hms-border); background: #fff; color: var(--hms-navy);
        }
      `}</style>

      {/* ── Selection banner ── */}
      {selected && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            padding: "0.75rem 1.125rem",
            borderRadius: 12,
            background: "var(--hms-blue-light)",
            border: "1px solid rgba(37,99,235,0.25)",
            marginBottom: "1.25rem",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--hms-blue)",
              fontWeight: 600,
            }}
          >
            Assigning bed for <strong>{selected.patientName}</strong> (
            {selected.wardType}) — click an available bed below.
          </span>
          <button
            onClick={() => setSelectedId(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: "transparent",
              color: "var(--hms-blue)",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
            }}
          >
            <X size={13} /> Cancel
          </button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div className="bed-stats-grid">
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
              {totalCapacity}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Total Beds
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
            <Check size={18} style={{ color: "var(--hms-success)" }} />
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
              {totalAssigned}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Beds Assigned
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
              background: "#fffbeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={18} style={{ color: "#d97706" }} />
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
              {totalAwaiting}
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Awaiting Bed Assignment
            </p>
          </div>
        </div>
      </div>

      {/* ── Per-ward bed maps ── */}
      <div className="bed-wards-grid">
        {wards.map((w) => {
          const Icon = w.Icon;
          return (
            <div
              key={w.ward}
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
                  gap: 12,
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: w.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={19} style={{ color: w.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: "var(--hms-navy)",
                      margin: 0,
                    }}
                  >
                    {w.ward} Ward
                  </h3>
                  <p
                    style={{
                      fontSize: "0.71rem",
                      color: "#94a3b8",
                      margin: "1px 0 0",
                      fontWeight: 500,
                    }}
                  >
                    {w.assignedCount} beds assigned · {w.unassigned.length}{" "}
                    awaiting
                  </p>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    background: w.bg,
                    color: w.color,
                    flexShrink: 0,
                  }}
                >
                  {w.occupiedTotal} / {w.capacity} occupied
                </span>
              </div>

              {w.unassigned.length > 0 && (
                <div style={{ marginBottom: "1.125rem" }}>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 0.5rem",
                    }}
                  >
                    Needs Bed Assignment
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {w.unassigned.map((a) => {
                      const isSelected = selected?.id === a.id;
                      return (
                        <button
                          key={a.id}
                          className="bed-patient-chip"
                          onClick={() => togglePick(a)}
                          style={
                            isSelected
                              ? {
                                  background: w.color,
                                  borderColor: w.color,
                                  color: "#fff",
                                }
                              : {}
                          }
                        >
                          {isSelected ? (
                            <Check size={13} />
                          ) : (
                            <User2 size={13} style={{ color: "#94a3b8" }} />
                          )}
                          {a.patientName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bed-grid">
                {Array.from({ length: w.capacity }).map((_, i) => {
                  const bedNum = i + 1;
                  const occupant = w.bedMap[bedNum];

                  if (occupant) {
                    return (
                      <Popover.Root key={bedNum}>
                        <Popover.Trigger asChild>
                          <button
                            className="bed-cell-occupied"
                            style={{ background: w.color }}
                            title={`Bed ${bedNum} · ${occupant.patientName}`}
                          >
                            {getInitials(occupant.patientName)}
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            align="center"
                            sideOffset={6}
                            className="hms-popover-content"
                            style={{
                              background: "#fff",
                              borderRadius: 12,
                              border: "1px solid var(--hms-border)",
                              boxShadow: "var(--shadow-lg)",
                              padding: "0.875rem",
                              minWidth: 190,
                              zIndex: 50,
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            <p
                              style={{
                                margin: "0 0 2px",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "var(--hms-navy)",
                              }}
                            >
                              {occupant.patientName}
                            </p>
                            <p
                              style={{
                                margin: "0 0 0.75rem",
                                fontSize: "0.72rem",
                                color: "#94a3b8",
                              }}
                            >
                              {w.ward} · Bed {bedNum}
                            </p>
                            <button
                              onClick={() => handleRelease(occupant, w.ward)}
                              style={{
                                width: "100%",
                                padding: "0.45rem 0.7rem",
                                border: "1.5px solid var(--hms-border)",
                                borderRadius: 8,
                                background: "#fff",
                                color: "#dc2626",
                                cursor: "pointer",
                                fontFamily: "var(--font-body)",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                              }}
                            >
                              Release Bed
                            </button>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    );
                  }

                  return (
                    <button
                      key={bedNum}
                      className="bed-cell-available"
                      onClick={() => handleAssign(w.ward, bedNum)}
                      title={`Bed ${bedNum} · Available`}
                    >
                      {bedNum}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BedAllocation;
