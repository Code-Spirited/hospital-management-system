const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyText = "No records found",
}) => {
  return (
    <div
      className="w-full overflow-x-auto rounded-xl border border-gray-100"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <table className="w-full border-collapse">
        {/* Table Head */}
        <thead>
          <tr
            style={{
              background: "#f8fafc",
              borderBottom: "1.5px solid #e2e8f0",
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "0.75rem 1.25rem",
                  textAlign: "left",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {/* Loading state */}
          {loading &&
            Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "0.875rem 1.25rem" }}>
                    {/* Skeleton shimmer bar */}
                    <div
                      style={{
                        height: 12,
                        borderRadius: 6,
                        background:
                          "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.4s infinite",
                        width: `${60 + Math.random() * 30}%`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}

          {/* Empty state */}
          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                }}
              >
                {emptyText}
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!loading &&
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "0.875rem 1.25rem",
                      fontSize: "0.875rem",
                      color: "#334155",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Table;
