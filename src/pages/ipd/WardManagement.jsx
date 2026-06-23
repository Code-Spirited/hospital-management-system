// ─────────────────────────────────────────────────────────────────────────────
// WardManagement.jsx — Week 4, Tuesday (redesigned again)
//
// Each ward — and the hospital overall — gets one self-contained circular
// widget: a ring (fill = occupancy %), with the actual COUNT (not a
// percentage) and a "View All Patients" button both rendered as a custom
// overlay inside the ring itself, not the library's own text. No bed-grid
// squares — those carried no information beyond what the count already
// says, so they were pure redundancy.
//
// NOTE: "View All Patients" currently navigates to /ipd without a pre-
// applied ward filter yet. Wiring that requires knowing DataTable.jsx's
// exact filter-control API, which hasn't been re-confirmed since this
// project's many rounds of edits — that wiring is a deliberate follow-up,
// not an oversight.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { BedDouble, Users, Lock, Activity, ArrowRight } from "lucide-react";
import { useIPD } from "../../context/IPDContext";
import { WARD_TYPE_CONFIG, WARD_CAPACITY } from "./ipdData";

const WARD_ICONS = {
  General: BedDouble,
  "Semi-Private": Users,
  Private: Lock,
  ICU: Activity,
};

// One self-contained circular widget: ring + custom overlay (count +
// button), entirely independent of react-circular-progressbar's own text
// rendering so we have full control over layout.
const OccupancyCircle = ({
  size,
  color,
  pct,
  occupied,
  capacity,
  label,
  Icon,
  onViewAll,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
  >
    <CircularProgressbar
      value={pct}
      strokeWidth={5}
      styles={{
        path: {
          stroke: color,
          strokeLinecap: "round",
          transition: "stroke-dashoffset 0.8s ease",
        },
        trail: { stroke: "#eef2f7" },
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "0 12%",
      }}
    >
      {Icon && (
        <div
          style={{
            width: size * 0.16,
            height: size * 0.16,
            borderRadius: "50%",
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
          }}
        >
          <Icon size={size * 0.09} style={{ color }} />
        </div>
      )}
      <p
        style={{
          margin: 0,
          fontSize: size * 0.06,
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textAlign: "center",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: size * 0.155,
          fontWeight: 800,
          color: "var(--hms-navy)",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {occupied}
        <span style={{ color: "#cbd5e1", fontWeight: 600 }}> / {capacity}</span>
      </p>
      <p
        style={{
          margin: 0,
          fontSize: size * 0.052,
          color: "#94a3b8",
          fontWeight: 500,
        }}
      >
        beds occupied
      </p>
      <button
        onClick={onViewAll}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 6,
          padding: `${size * 0.022}px ${size * 0.055}px`,
          borderRadius: 99,
          border: "none",
          background: color,
          color: "#fff",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: size * 0.052,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        View All <ArrowRight size={size * 0.06} />
      </button>
    </div>
  </motion.div>
);

const WardManagement = () => {
  const navigate = useNavigate();
  const { admissions } = useIPD();

  const wardStats = Object.keys(WARD_TYPE_CONFIG).map((type) => {
    const occupied = admissions.filter(
      (a) => a.status === "Admitted" && a.wardType === type,
    ).length;
    const capacity = WARD_CAPACITY[type];
    return {
      ward: type,
      occupied,
      capacity,
      pct: capacity ? Math.min((occupied / capacity) * 100, 100) : 0,
      color: WARD_TYPE_CONFIG[type].color,
      Icon: WARD_ICONS[type],
    };
  });

  const totalCapacity = Object.values(WARD_CAPACITY).reduce((a, b) => a + b, 0);
  const totalOccupied = admissions.filter(
    (a) => a.status === "Admitted",
  ).length;
  const overallPct = totalCapacity ? (totalOccupied / totalCapacity) * 100 : 0;

  // Until DataTable's filter API is confirmed, this just navigates to the
  // admissions list — ward-type pre-filtering is the deliberate follow-up
  // noted at the top of this file.
  // Navigates to the Admissions list, optionally pre-filtered to one ward
  // via a ?ward=<type> query param — IPDHome.jsx reads this on mount and
  // hands it to DataTable as an initial filter.
  const goToAdmissions = (wardType) => {
    navigate(wardType ? `/ipd?ward=${encodeURIComponent(wardType)}` : "/ipd");
  };
  return (
    <div className="ward-page" style={{ fontFamily: "var(--font-body)" }}>
      <style>{`
        .ward-page { container-type: inline-size; container-name: ward-page; }

        .ward-overall-card {
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
          padding: 2rem 1.5rem; margin-bottom: 1.25rem;
        }
        @container ward-page (min-width: 560px) {
          .ward-overall-card { flex-direction: row; justify-content: center; gap: 2rem; }
        }

        .ward-circles-grid {
          display: grid; grid-template-columns: 1fr; gap: 1.5rem;
          justify-items: center; padding: 1.75rem 1rem;
        }
        @container ward-page (min-width: 460px) {
          .ward-circles-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @container ward-page (min-width: 900px) {
          .ward-circles-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* ── Overall hospital occupancy ── */}
      <div
        className="ward-overall-card"
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <OccupancyCircle
          size={210}
          color="#2563eb"
          pct={overallPct}
          occupied={totalOccupied}
          capacity={totalCapacity}
          label="Hospital-wide"
          onViewAll={() => goToAdmissions()}
        />
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 4px",
            }}
          >
            Hospital Bed Occupancy
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#64748b",
              margin: 0,
              fontWeight: 500,
              maxWidth: 280,
            }}
          >
            {totalOccupied} patients currently admitted across {totalCapacity}{" "}
            total beds, all ward types combined
          </p>
        </div>
      </div>

      {/* ── Per-ward occupancy circles ── */}
      <div
        className="ward-circles-grid"
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        {wardStats.map((ward) => (
          <OccupancyCircle
            key={ward.ward}
            size={170}
            color={ward.color}
            pct={ward.pct}
            occupied={ward.occupied}
            capacity={ward.capacity}
            label={ward.ward}
            Icon={ward.Icon}
            onViewAll={() => goToAdmissions(ward.ward)}
          />
        ))}
      </div>
    </div>
  );
};

export default WardManagement;
