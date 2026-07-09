// ─────────────────────────────────────────────────────────────────────────────
// PharmacyReports.jsx — redesigned (chart.js)
//
// Same underlying computation logic as before, unchanged — including the
// explicit purchaseDate/restock scope note, Gross Profit excluding GST,
// and the quantityBefore-vs-quantityChange distinction for Stock Value
// Lost. Only the RENDERING library changed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  BarElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  IndianRupee,
  Receipt,
  TrendingUp,
  PackagePlus,
  ShoppingBag,
  AlertTriangle,
  FileBarChart,
} from "lucide-react";
import { usePharmacy } from "../../context/PharmacyContext";
import {
  ADJUSTMENT_TYPE_CONFIG,
  BATCH_STATUS_CONFIG,
} from "../pharmacy/pharmacyData";
import DateRangeFilter from "./DateRangeFilter";
import {
  getPresetRange,
  isWithinRange,
  buildTrend,
  fmtCurrency,
  gradientFill,
  CHART_TOOLTIP_BASE,
  CHART_TICK_BASE,
} from "./reportUtils";
import {
  ChartCard,
  EmptyChartNote,
  DoughnutWithCenter,
  ChartLegendRow,
} from "./ReportComponents";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  BarElement,
  ChartTooltip,
  ChartLegend,
);

const MOVEMENT_TYPE_STYLES = {
  ...ADJUSTMENT_TYPE_CONFIG,
  Removed: BATCH_STATUS_CONFIG.Removed,
  Disposed: BATCH_STATUS_CONFIG.Disposed,
};

const unitsRemovedByMovement = (mv) => {
  if (mv.type === "Removed" || mv.type === "Disposed") return mv.quantityBefore;
  if (mv.quantityChange < 0) return Math.abs(mv.quantityChange);
  return 0;
};

const PharmacyReports = () => {
  const { batches, sales, stockMovements } = usePharmacy();
  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getPresetRange(preset, customStart, customEnd);

  const salesInRange = useMemo(
    () => sales.filter((s) => isWithinRange(s.soldOn, start, end)),
    [sales, start, end],
  );
  const newBatchesInRange = useMemo(
    () => batches.filter((b) => isWithinRange(b.purchaseDate, start, end)),
    [batches, start, end],
  );
  const movementsInRange = useMemo(
    () => stockMovements.filter((m) => isWithinRange(m.timestamp, start, end)),
    [stockMovements, start, end],
  );

  const totalRevenue = salesInRange.reduce((sum, s) => sum + s.total, 0);
  const transactionCount = salesInRange.length;

  const grossProfit = useMemo(() => {
    return salesInRange.reduce((sum, s) => {
      const netRevenue = s.subtotal - s.discountAmount;
      const cogs = s.items.reduce((itemSum, item) => {
        const batch = batches.find((b) => b.id === item.batchId);
        return itemSum + item.quantity * (batch?.unitCost ?? 0);
      }, 0);
      return sum + (netRevenue - cogs);
    }, 0);
  }, [salesInRange, batches]);

  const purchaseCost = newBatchesInRange.reduce(
    (sum, b) => sum + b.quantity * b.unitCost,
    0,
  );

  const stockValueLost = useMemo(() => {
    return movementsInRange.reduce((sum, mv) => {
      const units = unitsRemovedByMovement(mv);
      if (units === 0) return sum;
      const batch = batches.find((b) => b.id === mv.batchId);
      return sum + units * (batch?.unitCost ?? 0);
    }, 0);
  }, [movementsInRange, batches]);

  const trendData = useMemo(
    () => buildTrend(salesInRange, "soldOn"),
    [salesInRange],
  );

  const topMedicines = useMemo(() => {
    const map = new Map();
    salesInRange.forEach((s) => {
      s.items.forEach((item) => {
        if (!map.has(item.brandName))
          map.set(item.brandName, { name: item.brandName, value: 0 });
        map.get(item.brandName).value += item.quantity * item.unitPrice;
      });
    });
    return [...map.values()].sort((a, b) => b.value - a.value).slice(0, 6);
  }, [salesInRange]);

  const adjustmentTypeData = useMemo(() => {
    const counts = {};
    movementsInRange.forEach((mv) => {
      counts[mv.type] = (counts[mv.type] || 0) + 1;
    });
    return Object.keys(counts)
      .map((type) => ({
        name: type,
        value: counts[type],
        color: MOVEMENT_TYPE_STYLES[type]?.color ?? "#94a3b8",
      }))
      .filter((d) => d.value > 0);
  }, [movementsInRange]);

  const adjustmentTotal = adjustmentTypeData.reduce(
    (sum, d) => sum + d.value,
    0,
  );

  const supplierStats = useMemo(() => {
    const map = new Map();
    newBatchesInRange.forEach((b) => {
      if (!map.has(b.supplier))
        map.set(b.supplier, { supplier: b.supplier, newBatches: 0, cost: 0 });
      const entry = map.get(b.supplier);
      entry.newBatches += 1;
      entry.cost += b.quantity * b.unitCost;
    });
    return [...map.values()].sort((a, b) => b.cost - a.cost);
  }, [newBatchesInRange]);

  const trendChartData = {
    labels: trendData.map((d) => d.label),
    datasets: [
      {
        label: "Sales",
        data: trendData.map((d) => d.count),
        borderColor: "#0d9488",
        backgroundColor: gradientFill("#0d9488"),
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#0d9488",
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        borderWidth: 2.5,
      },
    ],
  };
  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...CHART_TOOLTIP_BASE,
        callbacks: { label: (ctx) => `${ctx.parsed.y} sales` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: CHART_TICK_BASE },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { ...CHART_TICK_BASE, precision: 0 },
      },
    },
  };

  const topMedicinesBarData = {
    labels: topMedicines.map((d) => d.name),
    datasets: [
      {
        data: topMedicines.map((d) => d.value),
        backgroundColor: "#0d9488",
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };
  const topMedicinesBarOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...CHART_TOOLTIP_BASE,
        callbacks: { label: (ctx) => fmtCurrency(ctx.parsed.x) },
      },
    },
    scales: {
      x: {
        grid: { color: "#f1f5f9" },
        ticks: { ...CHART_TICK_BASE, callback: (v) => fmtCurrency(v) },
      },
      y: { grid: { display: false }, ticks: CHART_TICK_BASE },
    },
  };

  const adjustmentDoughnutData = {
    labels: adjustmentTypeData.map((d) => d.name),
    datasets: [
      {
        data: adjustmentTypeData.map((d) => d.value),
        backgroundColor: adjustmentTypeData.map((d) => d.color),
        borderWidth: 0,
      },
    ],
  };
  const doughnutOptions = {
    cutout: "68%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...CHART_TOOLTIP_BASE } },
  };

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--hms-blue-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileBarChart size={14} style={{ color: "var(--hms-blue)" }} />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--hms-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Reports & Analytics
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Pharmacy Reports
        </h1>
      </div>

      <DateRangeFilter
        preset={preset}
        onPresetChange={setPreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        {[
          {
            label: "Total Sales Revenue",
            value: fmtCurrency(totalRevenue),
            Icon: IndianRupee,
            color: "#0d9488",
            bg: "#f0fdfa",
          },
          {
            label: "Transactions",
            value: transactionCount,
            Icon: Receipt,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "Gross Profit",
            note: "(excl. GST)",
            value: fmtCurrency(grossProfit),
            Icon: TrendingUp,
            color: "var(--hms-success)",
            bg: "var(--hms-success-bg)",
          },
          {
            label: "New Batches Received",
            value: newBatchesInRange.length,
            Icon: PackagePlus,
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Purchase Cost",
            note: "(new batches only)",
            value: fmtCurrency(purchaseCost),
            Icon: ShoppingBag,
            color: "#0891b2",
            bg: "#ecfeff",
          },
          {
            label: "Stock Value Lost",
            value: fmtCurrency(stockValueLost),
            Icon: AlertTriangle,
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
              padding: "1rem 1.2rem",
              boxShadow: "var(--shadow-xs)",
              display: "flex",
              alignItems: "center",
              gap: 13,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.Icon size={19} style={{ color: s.color }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--hms-navy)",
                  margin: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: "#64748b",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </p>
              {s.note && (
                <p
                  style={{
                    fontSize: "0.66rem",
                    color: "#cbd5e1",
                    margin: "1px 0 0",
                    fontStyle: "italic",
                  }}
                >
                  {s.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: "#94a3b8",
          margin: "0 0 1.25rem",
          fontStyle: "italic",
        }}
      >
        New Batches Received and its Purchase Cost only reflect batches newly
        created in this range — a restock added to an already-existing batch has
        no separate timestamp in the current data model and won't appear here
        (see Purchase Entry / Medicine Details for that batch's full history
        instead). Gross Profit excludes GST, since that's collected on behalf of
        the government rather than pharmacy income.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <ChartCard
          title="Sales Trend"
          subtitle={`${transactionCount} transactions in the selected range`}
        >
          {trendData.length === 0 ? (
            <EmptyChartNote label="No sales in this range." />
          ) : (
            <div style={{ height: 220 }}>
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          )}
        </ChartCard>
      </div>

      <div
        className="pharm-reports-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <style>{`
          @media (min-width: 760px) { .pharm-reports-grid-2 { grid-template-columns: 1fr 1fr; } }
        `}</style>
        <ChartCard
          title="Top-Selling Medicines"
          subtitle="By gross revenue, this range"
        >
          {topMedicines.length === 0 ? (
            <EmptyChartNote label="No sales in this range." />
          ) : (
            <div style={{ height: 220 }}>
              <Bar
                data={topMedicinesBarData}
                options={topMedicinesBarOptions}
              />
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Stock Adjustments by Type"
          subtitle="Damage, Loss, Correction, Transfer, Removed, Disposed"
        >
          {adjustmentTypeData.length === 0 ? (
            <EmptyChartNote label="No stock adjustments in this range." />
          ) : (
            <>
              <DoughnutWithCenter
                data={adjustmentDoughnutData}
                options={doughnutOptions}
                centerValue={adjustmentTotal}
                centerLabel="Adjustments"
                height={200}
              />
              <ChartLegendRow
                items={adjustmentTypeData.map((d) => ({
                  label: d.name,
                  color: d.color,
                  value: d.value,
                }))}
              />
            </>
          )}
        </ChartCard>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.375rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: "0 0 0.375rem",
          }}
        >
          Supplier-wise Purchases
        </h3>
        <p
          style={{ fontSize: "0.74rem", color: "#94a3b8", margin: "0 0 1rem" }}
        >
          New batches only — see the scope note above regarding restocks.
        </p>
        {supplierStats.length === 0 ? (
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              textAlign: "center",
              padding: "1.5rem 0",
              margin: 0,
            }}
          >
            No new batches received in this range.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 420,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--hms-border)" }}>
                  {["Supplier", "New Batches", "Cost"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === "Supplier" ? "left" : "right",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supplierStats.map((s) => (
                  <tr
                    key={s.supplier}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--hms-navy)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.supplier}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {s.newBatches}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--hms-navy)",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtCurrency(s.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyReports;
