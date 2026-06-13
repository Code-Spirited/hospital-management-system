const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        fontFamily: "'Inter', sans-serif",
        borderTop: "1px solid #f1f5f9",
        padding: "0.875rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
        background: "#fff",
      }}
    >
      <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
        © {year} Auctech Marketing Communication Pvt. Ltd. All rights reserved.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <span style={{ fontSize: "0.72rem", color: "#cbd5e1" }}>
          HMS v1.0.0
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.72rem",
            color: "#10b981",
            fontWeight: 600,
          }}
        >
          {/* Green dot = system status indicator */}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10b981",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          All systems operational
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
