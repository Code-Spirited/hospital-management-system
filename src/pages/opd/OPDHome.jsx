// Temporary landing state for /opd — replaced by the full PatientList on Week 3 Tuesday.
import { useNavigate } from "react-router-dom";
import { UserPlus, Users } from "lucide-react";

const OPDHome = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid var(--hms-border)",
        boxShadow: "var(--shadow-xs)",
        padding: "3rem 2rem",
        textAlign: "center",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "var(--hms-blue-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1rem",
        }}
      >
        <Users size={26} style={{ color: "var(--hms-blue)" }} />
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.25rem",
          fontWeight: 800,
          color: "var(--hms-navy)",
          margin: "0 0 0.5rem",
        }}
      >
        OPD Patient List
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#64748b",
          margin: "0 0 1.5rem",
          maxWidth: 360,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        The full patient list and CRUD table is coming in Week 3, Tuesday. For
        now, you can register new patients.
      </p>
      <button
        onClick={() => navigate("/opd/register")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "0.625rem 1.5rem",
          borderRadius: 10,
          border: "none",
          background: "var(--hms-blue)",
          color: "#fff",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          fontWeight: 700,
          boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
        }}
      >
        <UserPlus size={16} /> Register New Patient
      </button>
    </div>
  );
};

export default OPDHome;
