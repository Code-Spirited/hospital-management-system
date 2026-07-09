// ─────────────────────────────────────────────────────────────────────────────
// IPDReports.jsx — redesigned (chart.js)
//
// Same underlying computation logic as before, unchanged — including the
// three-independent-date-dimension modeling and the deliberate exclusion
// of a fabricated "average occupancy" metric. Only the RENDERING library
// changed. Discharge Outcomes' doughnut still uses
// CONDITION_AT_DISCHARGE_CONFIG's existing colors verbatim, including its
// neutral Deceased gray — unchanged, no re-emphasis added.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import dayjs from "dayjs";
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
  BedDouble,
  LogOut,
  Users,
  Clock,
  IndianRupee,
  FileBarChart,
} from "lucide-react";
import { useIPD } from "../../context/IPDContext";
import {
  WARD_TYPE_CONFIG,
  CONDITION_AT_DISCHARGE_CONFIG,
} from "../ipd/ipdData";
import DateRangeFilter from "./DateRangeFilter";
import Abbr from "../../components/common/Abbr/Abbr";
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

const getInitials = (name) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const IPDReports = () => {
  const { admissions } = useIPD();
  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getPresetRange(preset, customStart, customEnd);

  const admissionsInRange = useMemo(
    () => admissions.filter((a) => isWithinRange(a.admissionDate, start, end)),
    [admissions, start, end],
  );
  const dischargesInRange = useMemo(
    () =>
      admissions.filter(
        (a) =>
          a.status === "Discharged" &&
          a.dischargeDate &&
          isWithinRange(a.dischargeDate, start, end),
      ),
    [admissions, start, end],
  );
  const billedInRange = useMemo(
    () =>
      admissions.filter(
        (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
      ),
    [admissions, start, end],
  );

  const currentlyAdmitted = admissions.filter(
    (a) => a.status === "Admitted",
  ).length;
  const totalRevenue = billedInRange.reduce(
    (sum, a) => sum + (a.billing?.total || 0),
    0,
  );

  const avgLOS = useMemo(() => {
    if (dischargesInRange.length === 0) return null;
    const totalDays = dischargesInRange.reduce(
      (sum, a) =>
        sum + dayjs(a.dischargeDate).diff(dayjs(a.admissionDate), "day"),
      0,
    );
    return totalDays / dischargesInRange.length;
  }, [dischargesInRange]);

  const trendData = useMemo(
    () => buildTrend(admissionsInRange, "admissionDate"),
    [admissionsInRange],
  );

  const wardData = useMemo(
    () =>
      Object.keys(WARD_TYPE_CONFIG)
        .map((w) => ({
          name: w,
          value: admissionsInRange.filter((a) => a.wardType === w).length,
          color: WARD_TYPE_CONFIG[w].color,
        }))
        .filter((d) => d.value > 0),
    [admissionsInRange],
  );

  const outcomeData = useMemo(() => {
    const counts = {};
    dischargesInRange.forEach((a) => {
      const condition = a.dischargeSummary?.conditionAtDischarge;
      if (!condition) return;
      counts[condition] = (counts[condition] || 0) + 1;
    });
    return Object.keys(CONDITION_AT_DISCHARGE_CONFIG)
      .map((c) => ({
        name: c,
        value: counts[c] || 0,
        color: CONDITION_AT_DISCHARGE_CONFIG[c].color,
      }))
      .filter((d) => d.value > 0);
  }, [dischargesInRange]);

  const doctorStats = useMemo(() => {
    const map = new Map();
    const ensure = (doc) => {
      if (!map.has(doc))
        map.set(doc, { doctor: doc, admissions: 0, discharges: 0, revenue: 0 });
      return map.get(doc);
    };
    admissionsInRange.forEach((a) => {
      ensure(a.admittingDoctor).admissions += 1;
    });
    dischargesInRange.forEach((a) => {
      ensure(
        a.dischargeSummary?.dischargedBy || a.admittingDoctor,
      ).discharges += 1;
    });
    billedInRange.forEach((a) => {
      ensure(a.admittingDoctor).revenue += a.billing.total;
    });
    return [...map.values()].sort(
      (a, b) => b.admissions + b.discharges - (a.admissions + a.discharges),
    );
  }, [admissionsInRange, dischargesInRange, billedInRange]);

  const outcomeTotal = outcomeData.reduce((sum, d) => sum + d.value, 0);

  const trendChartData = {
    labels: trendData.map((d) => d.label),
    datasets: [
      {
        label: "Admissions",
        data: trendData.map((d) => d.count),
        borderColor: "#7c3aed",
        backgroundColor: gradientFill("#7c3aed"),
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#7c3aed",
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
        callbacks: { label: (ctx) => `${ctx.parsed.y} admissions` },
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

  const wardBarData = {
    labels: wardData.map((d) => d.name),
    datasets: [
      {
        data: wardData.map((d) => d.value),
        backgroundColor: wardData.map((d) => d.color),
        borderRadius: 6,
        barThickness: 26,
      },
    ],
  };
  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...CHART_TOOLTIP_BASE } },
    scales: {
      x: {
        grid: { color: "#f1f5f9" },
        ticks: { ...CHART_TICK_BASE, precision: 0 },
      },
      y: { grid: { display: false }, ticks: CHART_TICK_BASE },
    },
  };

  const outcomeDoughnutData = {
    labels: outcomeData.map((d) => d.name),
    datasets: [
      {
        data: outcomeData.map((d) => d.value),
        backgroundColor: outcomeData.map((d) => d.color),
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
          <Abbr underline={false}>IPD</Abbr> Reports
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
            label: "Currently Admitted",
            note: "(live, not range-filtered)",
            value: currentlyAdmitted,
            Icon: BedDouble,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "New Admissions",
            value: admissionsInRange.length,
            Icon: Users,
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Discharges",
            value: dischargesInRange.length,
            Icon: LogOut,
            color: "var(--hms-success)",
            bg: "var(--hms-success-bg)",
          },
          {
            label: "Avg. Length of Stay",
            value: avgLOS === null ? "—" : `${avgLOS.toFixed(1)} days`,
            Icon: Clock,
            color: "#d97706",
            bg: "#fffbeb",
          },
          {
            label: "Revenue Billed",
            value: fmtCurrency(totalRevenue),
            Icon: IndianRupee,
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
        New Admissions, Discharges, and Revenue Billed are three
        independently-dated facts (admission date, discharge date, and billing
        date respectively) — a patient discharged in this period may have been
        admitted well before it, so these don't necessarily describe the same
        set of people. Currently Admitted is today's live count and isn't
        affected by the date range above; see IPD → Ward Management for
        real-time occupancy detail.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <ChartCard
          title="New Admissions Trend"
          subtitle={`${admissionsInRange.length} admissions in the selected range`}
        >
          {trendData.length === 0 ? (
            <EmptyChartNote label="No admissions in this range." />
          ) : (
            <div style={{ height: 220 }}>
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          )}
        </ChartCard>
      </div>

      <div
        className="ipd-reports-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <style>{`
          @media (min-width: 760px) { .ipd-reports-grid-2 { grid-template-columns: 1fr 1fr; } }
        `}</style>
        <ChartCard
          title="New Admissions by Ward"
          subtitle="Where new admissions were assigned in this range"
        >
          {wardData.length === 0 ? (
            <EmptyChartNote label="No admissions in this range." />
          ) : (
            <div style={{ height: 220 }}>
              <Bar data={wardBarData} options={barOptions} />
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Discharge Outcomes"
          subtitle="Condition at discharge, this range"
        >
          {outcomeData.length === 0 ? (
            <EmptyChartNote label="No discharges recorded in this range." />
          ) : (
            <>
              <DoughnutWithCenter
                data={outcomeDoughnutData}
                options={doughnutOptions}
                centerValue={outcomeTotal}
                centerLabel="Discharges"
                height={200}
              />
              <ChartLegendRow
                items={outcomeData.map((d) => ({
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
          Doctor-wise Performance
        </h3>
        <p
          style={{ fontSize: "0.74rem", color: "#94a3b8", margin: "0 0 1rem" }}
        >
          Admissions, Discharges, and Revenue are independent tallies per doctor
          — not derived from one shared set of patients.
        </p>
        {doctorStats.length === 0 ? (
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              textAlign: "center",
              padding: "1.5rem 0",
              margin: 0,
            }}
          >
            No activity in this range.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 480,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--hms-border)" }}>
                  {["Doctor", "Admissions", "Discharges", "Revenue"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: h === "Doctor" ? "left" : "right",
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
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((d) => (
                  <tr
                    key={d.doctor}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "0.65rem 0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background:
                              "linear-gradient(135deg, var(--hms-blue), #3b82f6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.62rem",
                              fontWeight: 800,
                              color: "#fff",
                            }}
                          >
                            {getInitials(d.doctor)}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "var(--hms-navy)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {d.doctor}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {d.admissions}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {d.discharges}
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
                      {fmtCurrency(d.revenue)}
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

export default IPDReports;
