// ─────────────────────────────────────────────────────────────────────────────
// exportUtils.js
//
// Generic PDF/Excel renderers, shared by every report type in the Export
// Center. Each report-building function in ExportCenter.jsx produces the
// SAME plain shape — { title, filenameBase, dateRangeLabel, kpis, tables,
// notes } — regardless of which domain it came from, so these two
// functions are written once and never touch any domain-specific
// business logic themselves.
// ─────────────────────────────────────────────────────────────────────────────

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const HMS_BLUE = [37, 99, 235];
const HMS_NAVY = [15, 23, 42];
const HMS_MUTED = [100, 116, 139];
const HMS_FAINT = [148, 163, 184];

const sanitizeForPDF = (value) => String(value).replace(/₹/g, "Rs. ");

export const exportToPDF = (reportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.setTextColor(...HMS_NAVY);
  doc.text(sanitizeForPDF(reportData.title), 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(...HMS_MUTED);
  doc.text(sanitizeForPDF(reportData.dateRangeLabel), 14, 25);
  doc.setFontSize(8);
  doc.setTextColor(...HMS_FAINT);
  doc.text(
    `Generated ${dayjs().format("D MMMM YYYY, h:mm A")} · Auctech HMS`,
    14,
    30,
  );
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 34, pageWidth - 14, 34);

  let y = 42;

  if (reportData.kpis?.length) {
    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: reportData.kpis.map((k) => [
        sanitizeForPDF(k.label),
        sanitizeForPDF(k.value),
      ]),
      theme: "grid",
      headStyles: { fillColor: HMS_BLUE, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 12;
  }

  (reportData.tables || []).forEach((table) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setTextColor(...HMS_NAVY);
    doc.text(sanitizeForPDF(table.title), 14, y);
    y += 5;

    const rows =
      table.rows.length > 0
        ? table.rows.map((row) =>
            table.columns.map((c) => sanitizeForPDF(row[c.key] ?? "")),
          )
        : [
            table.columns.map((_, i) =>
              i === 0 ? "No data in this range" : "",
            ),
          ];

    autoTable(doc, {
      startY: y,
      head: [table.columns.map((c) => sanitizeForPDF(c.header))],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: HMS_BLUE, fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5 },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 12;
  });

  if (reportData.notes?.length) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(7.5);
    doc.setTextColor(...HMS_FAINT);
    reportData.notes.forEach((note) => {
      const lines = doc.splitTextToSize(sanitizeForPDF(note), pageWidth - 28);
      if (y + lines.length * 3.5 > 285) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, 14, y);
      y += lines.length * 3.5 + 4;
    });
  }

  doc.save(`${reportData.filenameBase}.pdf`);
};

export const exportToExcel = (reportData) => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryAoA = [
    [reportData.title],
    [reportData.dateRangeLabel],
    [`Generated ${dayjs().format("D MMMM YYYY, h:mm A")}`],
    [],
    ["Metric", "Value"],
    ...(reportData.kpis || []).map((k) => [k.label, k.value]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryAoA);
  summarySheet["!cols"] = [{ wch: 32 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  (reportData.tables || []).forEach((table) => {
    const header = table.columns.map((c) => c.header);
    const rows =
      table.rows.length > 0
        ? table.rows.map((row) => table.columns.map((c) => row[c.key] ?? ""))
        : [
            table.columns.map((_, i) =>
              i === 0 ? "No data in this range" : "",
            ),
          ];
    const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    sheet["!cols"] = table.columns.map(() => ({ wch: 20 }));
    // Excel sheet names: max 31 chars, no : \ / ? * [ ]
    const safeName =
      table.title.replace(/[:\\/?*[\]]/g, "").slice(0, 31) || "Detail";
    XLSX.utils.book_append_sheet(wb, sheet, safeName);
  });

  XLSX.writeFile(wb, `${reportData.filenameBase}.xlsx`);
};
