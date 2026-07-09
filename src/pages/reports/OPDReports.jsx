// ─────────────────────────────────────────────────────────────────────────────
// OPDReports.jsx — redesigned (chart.js)
//
// Same underlying computation logic as before, unchanged — only the
// RENDERING library changed. Recharts' AreaChart/PieChart/BarChart are
// replaced with chart.js equivalents (Line with gradient fill, a
// center-labeled Doughnut, a horizontal Bar), matching the visual
// language established in Revenue Reports. Doctor-wise table gains small
// avatar-initial circles, matching the pattern already used in User
// Directory.
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
  ClipboardList,
  CalendarCheck,
  XCircle,
  Users,
  IndianRupee,
  FileBarChart,
} from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { STATUS_CONFIG, VISIT_TYPE_CONFIG } from "../opd/appointmentsData";
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

const OPDReports = () => {
  const { appointments } = useAppointments();
  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { start, end } = getPresetRange(preset, customStart, customEnd);

  const appointmentsInRange = useMemo(
    () => appointments.filter((a) => isWithinRange(a.date, start, end)),
    [appointments, start, end],
  );
  const billedInRange = useMemo(
    () =>
      appointments.filter(
        (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
      ),
    [appointments, start, end],
  );

  const totalAppointments = appointmentsInRange.length;
  const completedCount = appointmentsInRange.filter(
    (a) => a.status === "Completed",
  ).length;
  const cancelledNoShowCount = appointmentsInRange.filter(
    (a) => a.status === "Cancelled" || a.status === "No-Show",
  ).length;
  const uniquePatients = new Set(
    appointmentsInRange.map((a) => a.patientId).filter(Boolean),
  ).size;
  const totalRevenue = billedInRange.reduce(
    (sum, a) => sum + (a.billing?.total || 0),
    0,
  );

  const trendData = useMemo(
    () => buildTrend(appointmentsInRange, "date"),
    [appointmentsInRange],
  );

  const statusData = useMemo(
    () =>
      Object.keys(STATUS_CONFIG)
        .map((s) => ({
          name: s,
          value: appointmentsInRange.filter((a) => a.status === s).length,
          color: STATUS_CONFIG[s].color,
        }))
        .filter((d) => d.value > 0),
    [appointmentsInRange],
  );

  const visitTypeData = useMemo(
    () =>
      Object.keys(VISIT_TYPE_CONFIG)
        .map((t) => ({
          name: t,
          value: appointmentsInRange.filter((a) => a.visitType === t).length,
          color: VISIT_TYPE_CONFIG[t].color,
        }))
        .filter((d) => d.value > 0),
    [appointmentsInRange],
  );

  const doctorStats = useMemo(() => {
    const map = new Map();
    appointmentsInRange.forEach((a) => {
      if (!map.has(a.doctor))
        map.set(a.doctor, {
          doctor: a.doctor,
          appointments: 0,
          completed: 0,
          revenue: 0,
        });
      const entry = map.get(a.doctor);
      entry.appointments += 1;
      if (a.status === "Completed") entry.completed += 1;
      if (a.billing) entry.revenue += a.billing.total;
    });
    return [...map.values()].sort((a, b) => b.appointments - a.appointments);
  }, [appointmentsInRange]);

  const trendChartData = {
    labels: trendData.map((d) => d.label),
    datasets: [
      {
        label: "Appointments",
        data: trendData.map((d) => d.count),
        borderColor: "#2563eb",
        backgroundColor: gradientFill("#2563eb"),
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "#2563eb",
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
        callbacks: { label: (ctx) => `${ctx.parsed.y} appointments` },
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

  const statusDoughnutData = {
    labels: statusData.map((d) => d.name),
    datasets: [
      {
        data: statusData.map((d) => d.value),
        backgroundColor: statusData.map((d) => d.color),
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

  const visitTypeBarData = {
    labels: visitTypeData.map((d) => d.name),
    datasets: [
      {
        data: visitTypeData.map((d) => d.value),
        backgroundColor: visitTypeData.map((d) => d.color),
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
          <Abbr underline={false}>OPD</Abbr> Reports
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
            label: "Total Appointments",
            value: totalAppointments,
            Icon: ClipboardList,
            color: "var(--hms-blue)",
            bg: "var(--hms-blue-light)",
          },
          {
            label: "Completed",
            value: completedCount,
            Icon: CalendarCheck,
            color: "var(--hms-success)",
            bg: "var(--hms-success-bg)",
          },
          {
            label: "Cancelled / No-Show",
            value: cancelledNoShowCount,
            Icon: XCircle,
            color: "#dc2626",
            bg: "#fef2f2",
          },
          {
            label: "Unique Patients Seen",
            value: uniquePatients,
            Icon: Users,
            color: "#7c3aed",
            bg: "#f5f3ff",
          },
          {
            label: "Revenue Billed",
            value: fmtCurrency(totalRevenue),
            Icon: IndianRupee,
            color: "#d97706",
            bg: "#fffbeb",
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
        Appointment counts reflect visit dates within the selected range;
        Revenue Billed reflects bills actually raised within it — a visit near
        the range boundary may be billed slightly after it happened, so these
        can reference slightly different sets of appointments.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <ChartCard
          title="Appointment Trend"
          subtitle={`${totalAppointments} visits in the selected range`}
        >
          {trendData.length === 0 ? (
            <EmptyChartNote label="No appointments in this range." />
          ) : (
            <div style={{ height: 220 }}>
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          )}
        </ChartCard>
      </div>

      <div
        className="opd-reports-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <style>{`
          @media (min-width: 760px) { .opd-reports-grid-2 { grid-template-columns: 1fr 1fr; } }
        `}</style>
        <ChartCard
          title="Status Breakdown"
          subtitle="Appointments by workflow stage"
        >
          {statusData.length === 0 ? (
            <EmptyChartNote label="No data in this range." />
          ) : (
            <>
              <DoughnutWithCenter
                data={statusDoughnutData}
                options={doughnutOptions}
                centerValue={totalAppointments}
                centerLabel="Total"
                height={200}
              />
              <ChartLegendRow
                items={statusData.map((d) => ({
                  label: d.name,
                  color: d.color,
                  value: d.value,
                }))}
              />
            </>
          )}
        </ChartCard>

        <ChartCard
          title="Visit Type Breakdown"
          subtitle="OPD, Follow-up, Emergency"
        >
          {visitTypeData.length === 0 ? (
            <EmptyChartNote label="No data in this range." />
          ) : (
            <div style={{ height: 220 }}>
              <Bar data={visitTypeBarData} options={barOptions} />
            </div>
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
            margin: "0 0 1rem",
          }}
        >
          Doctor-wise Performance
        </h3>
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
            No appointments in this range.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 540,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1.5px solid var(--hms-border)" }}>
                  {[
                    "Doctor",
                    "Appointments",
                    "Completed",
                    "Completion Rate",
                    "Revenue",
                  ].map((h) => (
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
                  ))}
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
                      {d.appointments}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {d.completed}
                    </td>
                    <td
                      style={{
                        padding: "0.65rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "var(--hms-success)",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      {d.appointments > 0
                        ? `${Math.round((d.completed / d.appointments) * 100)}%`
                        : "—"}
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

export default OPDReports;
