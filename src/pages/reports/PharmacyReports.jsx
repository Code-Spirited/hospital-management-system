// ─────────────────────────────────────────────────────────────────────────────
// PharmacyReports.jsx — Week 7, Wednesday
//
// Covers the three genuinely-timestamped Pharmacy events: Sales
// (sale.soldOn), new Batch receipts (batch.purchaseDate), and Stock
// Movements (movement.timestamp — manual adjustments from Stock
// Management, plus Removed/Disposed status changes from Expiry Alerts).
//
// SCOPE NOTE — read before trusting "New Batches Received": a Batch
// record's purchaseDate is set once, at creation, and is NEVER updated
// when that same batch is later restocked (recordPurchase only
// increments quantity on an existing batch — see PharmacyContext). So
// filtering batches by purchaseDate correctly finds batches newly
// CREATED in this range, but silently misses quantity added to an
// already-existing batch via a later restock, since that event has no
// timestamp of its own in the current data model. Purchase Cost below
// is likewise an estimate using each new batch's CURRENTLY recorded
// quantity (the app doesn't separately preserve "originally received
// quantity" apart from "quantity on hand now") — very close to exact
// for batches created recently, but can drift for one that's since been
// heavily sold down. Flagged explicitly, the same honesty standard
// applied to IPD's occupancy scope note yesterday.
//
// Gross Profit deliberately EXCLUDES GST — collected on behalf of the
// government, not pharmacy income. Revenue for margin purposes is each
// sale's subtotal minus its discount (net of discount, before tax); COGS
// looks up each sold item's ORIGINAL batch unitCost, safe because a
// batch's unitCost is immutable after creation (a restock never
// overwrites it) and batches are never deleted, only status-changed —
// this lookup always resolves even for old sales.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
  TICK_STYLE,
  TOOLTIP_STYLE,
  TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE,
} from "./reportUtils";
import { ChartCard, EmptyChartNote } from "./ReportComponents";

// Reuses real, already-established colors rather than inventing new ones
// for this chart — same precedent as IPD Reports reusing
// CONDITION_AT_DISCHARGE_CONFIG unmodified.
const MOVEMENT_TYPE_STYLES = {
  ...ADJUSTMENT_TYPE_CONFIG,
  Removed: BATCH_STATUS_CONFIG.Removed,
  Disposed: BATCH_STATUS_CONFIG.Disposed,
};

// How many units a single stock movement removed from active
// circulation. Damage/Loss/Transfer are always decreases (quantityChange
// is already negative). Correction can go either way — only a DECREASE
// counts as "lost" (an increase found extra stock, not missing stock).
// Removed/Disposed carry quantityChange: 0 by design (a status change,
// not a quantity edit — see updateBatchStatus), so units actually pulled
// from Active circulation is quantityBefore instead: the batch's full
// quantity at the moment it left Active status.
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
  // Only correctly captures NEWLY CREATED batches — see file header.
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

  // Top-selling medicines by gross line revenue (quantity × unitPrice,
  // before cart-level discount is allocated — discount applies to the
  // whole cart, not per line, in this data model, so ranking pre-
  // discount is the simplest honest measure).
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

  // Supplier-wise: NEW batches only, matching the same purchaseDate
  // caveat as the summary cards above — a supplier who only restocked
  // existing batches in this range won't show additional cost here.
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
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={trendData}
                margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="pharmTrendGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  formatter={(v) => [`${v} sales`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#pharmTrendGrad)"
                  dot={{ r: 3, fill: "#0d9488" }}
                />
              </AreaChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topMedicines}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => fmtCurrency(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={TICK_STYLE}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(v) => [fmtCurrency(v), "Revenue"]}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Stock Adjustments by Type"
          subtitle="Damage, Loss, Correction, Transfer, Removed, Disposed"
        >
          {adjustmentTypeData.length === 0 ? (
            <EmptyChartNote label="No stock adjustments in this range." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={adjustmentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {adjustmentTypeData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
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
