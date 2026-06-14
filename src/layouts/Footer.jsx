const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: "1px solid var(--hms-border)",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
        background: "#fff",
        fontFamily: "var(--font-body)",
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          color: "#94a3b8",
          margin: 0,
          fontWeight: 500,
        }}
      >
        © {year} Auctech Marketing Communication Pvt. Ltd.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span
          style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: 600 }}
        >
          HMS v1.0.0
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22c55e",
              display: "inline-block",
              animation: "pulse 2s infinite",
              boxShadow: "0 0 0 0 rgba(34,197,94,0.4)",
            }}
          />
          <span
            style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 600 }}
          >
            All systems operational
          </span>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70%  { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
