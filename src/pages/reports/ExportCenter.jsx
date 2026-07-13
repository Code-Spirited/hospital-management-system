// ─────────────────────────────────────────────────────────────────────────────
// ExportCenter.jsx — Week 7, Saturday
//
// One dedicated page for downloading any report as a real PDF or Excel
// file, generated entirely client-side. Each build*Data() function below
// re-derives its numbers using the EXACT SAME filtering logic already
// proven correct on that domain's own dedicated Report page this week —
// no new business rules invented here, only reshaped for export.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FileText,
  FileSpreadsheet,
  History,
  Eye,
  CheckCircle2,
  Stethoscope,
  BedDouble,
  Pill,
  IndianRupee,
  LayoutDashboard,
  FileBarChart,
} from "lucide-react";
import { useAppointments } from "../../context/AppointmentsContext";
import { useIPD } from "../../context/IPDContext";
import { usePharmacy } from "../../context/PharmacyContext";
import { useUsers } from "../../context/UsersContext";
import { WARD_CAPACITY } from "../ipd/ipdData";
import { getStockStatus } from "../pharmacy/pharmacyUtils";
import DateRangeFilter from "./DateRangeFilter";
import { getPresetRange, isWithinRange, fmtCurrency } from "./reportUtils";
import { exportToPDF, exportToExcel } from "./exportUtils";

const REPORT_TYPES = [
  { key: "OPD", label: "OPD Report", Icon: Stethoscope, color: "#2563eb" },
  { key: "IPD", label: "IPD Report", Icon: BedDouble, color: "#7c3aed" },
  { key: "Pharmacy", label: "Pharmacy Report", Icon: Pill, color: "#0d9488" },
  {
    key: "Revenue",
    label: "Revenue Report",
    Icon: IndianRupee,
    color: "#d97706",
  },
  {
    key: "Summary",
    label: "Full Hospital Summary",
    Icon: LayoutDashboard,
    color: "#dc2626",
  },
];

const formatRangeLabel = (preset, start, end) => {
  if (preset === "All Time") return "All Time";
  if (!start || !end) return preset;
  return `${preset} (${start.format("D MMM YYYY")} – ${end.format("D MMM YYYY")})`;
};

const ExportCenter = () => {
  const { appointments } = useAppointments();
  const { admissions } = useIPD();
  const { medicines, batches, sales } = usePharmacy();
  const { users } = useUsers();

  const [reportType, setReportType] = useState("OPD");
  const [preset, setPreset] = useState("This Month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [recentExports, setRecentExports] = useState([]);

  const { start, end } = getPresetRange(preset, customStart, customEnd);
  const dateRangeLabel = formatRangeLabel(preset, start, end);

  const buildOPDData = () => {
    const appointmentsInRange = appointments.filter((a) =>
      isWithinRange(a.date, start, end),
    );
    const billedInRange = appointments.filter(
      (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
    );
    const totalRevenue = billedInRange.reduce((s, a) => s + a.billing.total, 0);
    const completedCount = appointmentsInRange.filter(
      (a) => a.status === "Completed",
    ).length;
    const cancelledNoShow = appointmentsInRange.filter(
      (a) => a.status === "Cancelled" || a.status === "No-Show",
    ).length;
    const uniquePatients = new Set(
      appointmentsInRange.map((a) => a.patientId).filter(Boolean),
    ).size;

    const doctorMap = new Map();
    appointmentsInRange.forEach((a) => {
      if (!doctorMap.has(a.doctor))
        doctorMap.set(a.doctor, {
          doctor: a.doctor,
          appointments: 0,
          completed: 0,
          revenue: 0,
        });
      const e = doctorMap.get(a.doctor);
      e.appointments += 1;
      if (a.status === "Completed") e.completed += 1;
      if (a.billing) e.revenue += a.billing.total;
    });
    const doctorRows = [...doctorMap.values()]
      .sort((a, b) => b.appointments - a.appointments)
      .map((d) => ({
        doctor: d.doctor,
        appointments: d.appointments,
        completed: d.completed,
        completionRate:
          d.appointments > 0
            ? `${Math.round((d.completed / d.appointments) * 100)}%`
            : "—",
        revenue: fmtCurrency(d.revenue),
      }));

    return {
      title: "OPD Report",
      filenameBase: `OPD-Report-${dayjs().format("YYYY-MM-DD")}`,
      dateRangeLabel,
      kpis: [
        { label: "Total Appointments", value: appointmentsInRange.length },
        { label: "Completed", value: completedCount },
        { label: "Cancelled / No-Show", value: cancelledNoShow },
        { label: "Unique Patients Seen", value: uniquePatients },
        { label: "Revenue Billed", value: fmtCurrency(totalRevenue) },
      ],
      tables: [
        {
          title: "Doctor-wise Performance",
          columns: [
            { key: "doctor", header: "Doctor" },
            { key: "appointments", header: "Appointments" },
            { key: "completed", header: "Completed" },
            { key: "completionRate", header: "Completion Rate" },
            { key: "revenue", header: "Revenue" },
          ],
          rows: doctorRows,
        },
      ],
      notes: [
        "Appointment counts reflect visit dates within the selected range; Revenue Billed reflects bills actually raised within it — these can reference slightly different sets of appointments.",
      ],
    };
  };

  const buildIPDData = () => {
    const admissionsInRange = admissions.filter((a) =>
      isWithinRange(a.admissionDate, start, end),
    );
    const dischargesInRange = admissions.filter(
      (a) =>
        a.status === "Discharged" &&
        a.dischargeDate &&
        isWithinRange(a.dischargeDate, start, end),
    );
    const billedInRange = admissions.filter(
      (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
    );
    const totalRevenue = billedInRange.reduce((s, a) => s + a.billing.total, 0);
    const currentlyAdmitted = admissions.filter(
      (a) => a.status === "Admitted",
    ).length;
    const avgLOS =
      dischargesInRange.length > 0
        ? dischargesInRange.reduce(
            (s, a) =>
              s + dayjs(a.dischargeDate).diff(dayjs(a.admissionDate), "day"),
            0,
          ) / dischargesInRange.length
        : null;

    const doctorMap = new Map();
    const ensure = (doc) => {
      if (!doctorMap.has(doc))
        doctorMap.set(doc, {
          doctor: doc,
          admissions: 0,
          discharges: 0,
          revenue: 0,
        });
      return doctorMap.get(doc);
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
    const doctorRows = [...doctorMap.values()]
      .sort(
        (a, b) => b.admissions + b.discharges - (a.admissions + a.discharges),
      )
      .map((d) => ({
        doctor: d.doctor,
        admissions: d.admissions,
        discharges: d.discharges,
        revenue: fmtCurrency(d.revenue),
      }));

    return {
      title: "IPD Report",
      filenameBase: `IPD-Report-${dayjs().format("YYYY-MM-DD")}`,
      dateRangeLabel,
      kpis: [
        { label: "Currently Admitted (live)", value: currentlyAdmitted },
        { label: "New Admissions", value: admissionsInRange.length },
        { label: "Discharges", value: dischargesInRange.length },
        {
          label: "Avg. Length of Stay",
          value: avgLOS === null ? "—" : `${avgLOS.toFixed(1)} days`,
        },
        { label: "Revenue Billed", value: fmtCurrency(totalRevenue) },
      ],
      tables: [
        {
          title: "Doctor-wise Performance",
          columns: [
            { key: "doctor", header: "Doctor" },
            { key: "admissions", header: "Admissions" },
            { key: "discharges", header: "Discharges" },
            { key: "revenue", header: "Revenue" },
          ],
          rows: doctorRows,
        },
      ],
      notes: [
        "New Admissions, Discharges, and Revenue Billed are three independently-dated facts — a patient discharged in this period may have been admitted well before it. Currently Admitted is a live count, not affected by the date range.",
      ],
    };
  };

  const buildPharmacyData = () => {
    const salesInRange = sales.filter((s) =>
      isWithinRange(s.soldOn, start, end),
    );
    const newBatchesInRange = batches.filter((b) =>
      isWithinRange(b.purchaseDate, start, end),
    );
    const totalRevenue = salesInRange.reduce((s, sale) => s + sale.total, 0);
    const grossProfit = salesInRange.reduce((sum, s) => {
      const netRevenue = s.subtotal - s.discountAmount;
      const cogs = s.items.reduce((isum, item) => {
        const batch = batches.find((b) => b.id === item.batchId);
        return isum + item.quantity * (batch?.unitCost ?? 0);
      }, 0);
      return sum + (netRevenue - cogs);
    }, 0);
    const purchaseCost = newBatchesInRange.reduce(
      (s, b) => s + b.quantity * b.unitCost,
      0,
    );

    const supplierMap = new Map();
    newBatchesInRange.forEach((b) => {
      if (!supplierMap.has(b.supplier))
        supplierMap.set(b.supplier, {
          supplier: b.supplier,
          newBatches: 0,
          cost: 0,
        });
      const e = supplierMap.get(b.supplier);
      e.newBatches += 1;
      e.cost += b.quantity * b.unitCost;
    });
    const supplierRows = [...supplierMap.values()]
      .sort((a, b) => b.cost - a.cost)
      .map((s) => ({
        supplier: s.supplier,
        newBatches: s.newBatches,
        cost: fmtCurrency(s.cost),
      }));

    return {
      title: "Pharmacy Report",
      filenameBase: `Pharmacy-Report-${dayjs().format("YYYY-MM-DD")}`,
      dateRangeLabel,
      kpis: [
        { label: "Total Sales Revenue", value: fmtCurrency(totalRevenue) },
        { label: "Transactions", value: salesInRange.length },
        { label: "Gross Profit (excl. GST)", value: fmtCurrency(grossProfit) },
        { label: "New Batches Received", value: newBatchesInRange.length },
        {
          label: "Purchase Cost (new batches)",
          value: fmtCurrency(purchaseCost),
        },
      ],
      tables: [
        {
          title: "Supplier-wise Purchases",
          columns: [
            { key: "supplier", header: "Supplier" },
            { key: "newBatches", header: "New Batches" },
            { key: "cost", header: "Cost" },
          ],
          rows: supplierRows,
        },
      ],
      notes: [
        "New Batches Received and Purchase Cost only reflect batches newly created in this range — restocks of already-existing batches aren't separately timestamped in the current data model. Gross Profit excludes GST.",
      ],
    };
  };

  const buildRevenueData = () => {
    const opdBilled = appointments.filter(
      (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
    );
    const ipdBilled = admissions.filter(
      (a) => a.billing && isWithinRange(a.billing.billedOn, start, end),
    );
    const pharmSold = sales.filter((s) => isWithinRange(s.soldOn, start, end));
    const opdRevenue = opdBilled.reduce((s, a) => s + a.billing.total, 0);
    const ipdRevenue = ipdBilled.reduce((s, a) => s + a.billing.total, 0);
    const pharmacyRevenue = pharmSold.reduce((s, sale) => s + sale.total, 0);
    const totalRevenue = opdRevenue + ipdRevenue + pharmacyRevenue;

    return {
      title: "Revenue Report",
      filenameBase: `Revenue-Report-${dayjs().format("YYYY-MM-DD")}`,
      dateRangeLabel,
      kpis: [
        {
          label: "Total Hospital-Wide Revenue",
          value: fmtCurrency(totalRevenue),
        },
        { label: "OPD Revenue", value: fmtCurrency(opdRevenue) },
        { label: "IPD Revenue", value: fmtCurrency(ipdRevenue) },
        { label: "Pharmacy Revenue", value: fmtCurrency(pharmacyRevenue) },
      ],
      tables: [
        {
          title: "Revenue by Module",
          columns: [
            { key: "module", header: "Module" },
            { key: "amount", header: "Amount" },
            { key: "share", header: "Share" },
          ],
          rows: [
            {
              module: "OPD",
              amount: fmtCurrency(opdRevenue),
              share:
                totalRevenue > 0
                  ? `${((opdRevenue / totalRevenue) * 100).toFixed(1)}%`
                  : "—",
            },
            {
              module: "IPD",
              amount: fmtCurrency(ipdRevenue),
              share:
                totalRevenue > 0
                  ? `${((ipdRevenue / totalRevenue) * 100).toFixed(1)}%`
                  : "—",
            },
            {
              module: "Pharmacy",
              amount: fmtCurrency(pharmacyRevenue),
              share:
                totalRevenue > 0
                  ? `${((pharmacyRevenue / totalRevenue) * 100).toFixed(1)}%`
                  : "—",
            },
          ],
        },
      ],
      notes: [
        "OPD/IPD revenue reflect billing date; Pharmacy reflects sale date. All three draw from separate, non-overlapping record types, so the total is a direct, non-overlapping sum.",
      ],
    };
  };

  const buildSummaryData = () => {
    const appointmentsInRange = appointments.filter((a) =>
      isWithinRange(a.date, start, end),
    );
    const admissionsInRange = admissions.filter((a) =>
      isWithinRange(a.admissionDate, start, end),
    );
    const pharmSold = sales.filter((s) => isWithinRange(s.soldOn, start, end));
    const opdRevenue = appointments
      .filter((a) => a.billing && isWithinRange(a.billing.billedOn, start, end))
      .reduce((s, a) => s + a.billing.total, 0);
    const ipdRevenue = admissions
      .filter((a) => a.billing && isWithinRange(a.billing.billedOn, start, end))
      .reduce((s, a) => s + a.billing.total, 0);
    const pharmacyRevenue = pharmSold.reduce((s, sale) => s + sale.total, 0);
    const totalRevenue = opdRevenue + ipdRevenue + pharmacyRevenue;

    const uniquePatients = new Set(
      [
        ...appointmentsInRange.map((a) => a.patientId),
        ...admissionsInRange.map((a) => a.patientId),
      ].filter(Boolean),
    ).size;

    const currentlyAdmitted = admissions.filter(
      (a) => a.status === "Admitted",
    ).length;
    const totalBedCapacity = Object.values(WARD_CAPACITY).reduce(
      (a, b) => a + b,
      0,
    );
    const lowStock = medicines.filter(
      (m) => getStockStatus(m, batches) === "Low Stock",
    ).length;
    const outOfStock = medicines.filter(
      (m) => getStockStatus(m, batches) === "Out of Stock",
    ).length;
    const activeStaff = users.filter((u) => u.status === "Active").length;

    return {
      title: "Full Hospital Summary",
      filenameBase: `Hospital-Summary-${dayjs().format("YYYY-MM-DD")}`,
      dateRangeLabel,
      kpis: [
        { label: "Total Revenue", value: fmtCurrency(totalRevenue) },
        { label: "Patients Served (unique, OPD + IPD)", value: uniquePatients },
        { label: "OPD Appointments", value: appointmentsInRange.length },
        { label: "IPD Admissions", value: admissionsInRange.length },
        { label: "Pharmacy Sales", value: pharmSold.length },
        {
          label: "Currently Admitted (live)",
          value: `${currentlyAdmitted} / ${totalBedCapacity}`,
        },
        { label: "Pharmacy Stock Alerts (live)", value: lowStock + outOfStock },
        { label: "Active Staff (live)", value: activeStaff },
      ],
      tables: [],
      notes: [
        "A consolidated snapshot across OPD, IPD, and Pharmacy. Fields marked (live) reflect right now and aren't affected by the date range above.",
      ],
    };
  };

  const reportData = useMemo(() => {
    switch (reportType) {
      case "OPD":
        return buildOPDData();
      case "IPD":
        return buildIPDData();
      case "Pharmacy":
        return buildPharmacyData();
      case "Revenue":
        return buildRevenueData();
      case "Summary":
        return buildSummaryData();
      default:
        return buildOPDData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reportType,
    appointments,
    admissions,
    sales,
    batches,
    medicines,
    users,
    start,
    end,
  ]);

  const activeType = REPORT_TYPES.find((t) => t.key === reportType);

  const logExport = (format) => {
    setRecentExports((prev) => [
      {
        id: `${Date.now()}`,
        reportType: activeType.label,
        format,
        dateRangeLabel,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleDownloadPDF = () => {
    exportToPDF(reportData);
    logExport("PDF");
    toast.success("PDF downloaded", {
      description: `${reportData.title} · ${dateRangeLabel}`,
    });
  };
  const handleDownloadExcel = () => {
    exportToExcel(reportData);
    logExport("Excel");
    toast.success("Excel downloaded", {
      description: `${reportData.title} · ${dateRangeLabel}`,
    });
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
          Export Center
        </h1>
        <p
          style={{
            fontSize: "0.82rem",
            color: "#64748b",
            margin: "0.35rem 0 0",
          }}
        >
          Download any report as a real PDF or Excel file — generated entirely
          in your browser from the same live data every Reports page reads from.
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <p
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "var(--hms-navy)",
            margin: "0 0 0.75rem",
          }}
        >
          Report
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {REPORT_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setReportType(t.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "0.55rem 1rem",
                borderRadius: 10,
                border: `1.5px solid ${reportType === t.key ? t.color : "var(--hms-border)"}`,
                background: reportType === t.key ? `${t.color}0d` : "#fff",
                color: reportType === t.key ? t.color : "#64748b",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                fontWeight: 700,
                transition: "all 0.15s",
              }}
            >
              <t.Icon size={15} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <DateRangeFilter
        preset={preset}
        onPresetChange={setPreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <motion.div
        key={`${reportType}-${dateRangeLabel}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--hms-border)",
          boxShadow: "var(--shadow-xs)",
          padding: "1.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: "1rem",
          }}
        >
          <Eye size={15} style={{ color: "var(--hms-blue)" }} />
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "0.92rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: 0,
            }}
          >
            Preview — {reportData.title}
          </h3>
        </div>
        <p
          style={{
            fontSize: "0.78rem",
            color: "#94a3b8",
            margin: "0 0 1rem",
            fontWeight: 500,
          }}
        >
          {dateRangeLabel}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: reportData.tables.length > 0 ? "1rem" : 0,
          }}
        >
          {reportData.kpis.map((k) => (
            <div
              key={k.label}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                background: "var(--hms-surface)",
                fontSize: "0.76rem",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              {k.label}:{" "}
              <span style={{ color: "var(--hms-navy)", fontWeight: 800 }}>
                {k.value}
              </span>
            </div>
          ))}
        </div>

        {reportData.tables.map((t) => (
          <p
            key={t.title}
            style={{
              fontSize: "0.78rem",
              color: "#64748b",
              margin: "0 0 4px",
              fontWeight: 500,
            }}
          >
            📄 {t.title} — {t.rows.length}{" "}
            {t.rows.length === 1 ? "row" : "rows"}
          </p>
        ))}
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          onClick={handleDownloadPDF}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            padding: "0.9rem 1rem",
            border: "none",
            borderRadius: 13,
            background: "linear-gradient(135deg, #dc2626, #ef4444)",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(220,38,38,0.28)",
          }}
        >
          <FileText size={18} /> Download as PDF
        </button>
        <button
          type="button"
          onClick={handleDownloadExcel}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            padding: "0.9rem 1rem",
            border: "none",
            borderRadius: 13,
            background: "linear-gradient(135deg, #059669, #10b981)",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(5,150,105,0.28)",
          }}
        >
          <FileSpreadsheet size={18} /> Download as Excel
        </button>
      </div>

      <div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: "0 0 0.875rem",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <History size={16} style={{ color: "var(--hms-blue)" }} /> Recent
          Exports
        </h3>
        {recentExports.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid var(--hms-border)",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                margin: 0,
                fontWeight: 500,
              }}
            >
              No exports yet this session.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            {recentExports.map((e) => (
              <div
                key={e.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid var(--hms-border)",
                  padding: "0.75rem 1.125rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <CheckCircle2
                    size={15}
                    style={{ color: "var(--hms-success)", flexShrink: 0 }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.83rem",
                      fontWeight: 700,
                      color: "var(--hms-navy)",
                    }}
                  >
                    {e.reportType}{" "}
                    <span style={{ fontWeight: 500, color: "#94a3b8" }}>
                      · {e.dateRangeLabel}
                    </span>
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      padding: "2px 9px",
                      borderRadius: 20,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background:
                        e.format === "PDF"
                          ? "#fef2f2"
                          : "var(--hms-success-bg)",
                      color:
                        e.format === "PDF" ? "#dc2626" : "var(--hms-success)",
                    }}
                  >
                    {e.format}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                    {dayjs(e.timestamp).fromNow()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportCenter;
