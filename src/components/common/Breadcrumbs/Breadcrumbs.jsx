// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumbs.jsx
//
// Rendered once in MainLayout, above every routed page, so it appears
// automatically across the whole app with no per-page wiring.
//
// Built as an explicit per-route trail map (below), NOT by splitting the
// URL into segments. Several pages are reached from a list page that
// doesn't appear anywhere in their own URL, which a naive segment-
// splitter would silently drop or misplace.
//
// PATIENT-SAFETY NOTE: any crumb identifying a specific patient shows
// their NAME together with their unique Patient ID, always.
// ─────────────────────────────────────────────────────────────────────────────

import { Link, useLocation, matchPath } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import Abbr from "../Abbr/Abbr";
import { useAppointments } from "../../../context/AppointmentsContext";
import { useIPD } from "../../../context/IPDContext";
import { usePharmacy } from "../../../context/PharmacyContext";

const patientCrumbFromAppointment = (appointmentId, appointments) => {
  const appt = appointments.find((a) => a.id === appointmentId);
  if (!appt) return { label: "Patient" };
  return {
    label: appt.patientName || "Patient",
    idLabel: appt.patientId || null,
  };
};

const patientCrumbFromAdmission = (admissionId, admissions) => {
  const adm = admissions.find((a) => a.id === admissionId);
  if (!adm) return { label: "Patient" };
  return {
    label: adm.patientName || "Patient",
    idLabel: adm.patientId || null,
  };
};

const ROUTES = [
  { pattern: "/dashboard", trail: () => [{ label: "Dashboard" }] },

  { pattern: "/opd", trail: () => [{ label: "OPD" }] },
  {
    pattern: "/opd/register",
    trail: () => [{ label: "OPD", to: "/opd" }, { label: "Register Patient" }],
  },
  {
    pattern: "/opd/appointments",
    trail: () => [{ label: "OPD", to: "/opd" }, { label: "Appointments" }],
  },
  {
    pattern: "/opd/consultation/:appointmentId",
    trail: (params, appointments) => [
      { label: "OPD", to: "/opd" },
      { label: "Appointments", to: "/opd/appointments" },
      patientCrumbFromAppointment(params.appointmentId, appointments),
      { label: "Consultation" },
    ],
  },
  {
    pattern: "/opd/prescription/:appointmentId",
    trail: (params, appointments) => [
      { label: "OPD", to: "/opd" },
      { label: "Appointments", to: "/opd/appointments" },
      patientCrumbFromAppointment(params.appointmentId, appointments),
      { label: "Prescription" },
    ],
  },
  {
    pattern: "/opd/billing/:appointmentId",
    trail: (params, appointments) => [
      { label: "OPD", to: "/opd" },
      { label: "Appointments", to: "/opd/appointments" },
      patientCrumbFromAppointment(params.appointmentId, appointments),
      { label: "Billing" },
    ],
  },

  { pattern: "/ipd", trail: () => [{ label: "IPD" }] },
  {
    pattern: "/ipd/admit",
    trail: () => [{ label: "IPD", to: "/ipd" }, { label: "New Admission" }],
  },
  {
    pattern: "/ipd/wards",
    trail: () => [{ label: "IPD", to: "/ipd" }, { label: "Ward Management" }],
  },
  {
    pattern: "/ipd/beds",
    trail: () => [{ label: "IPD", to: "/ipd" }, { label: "Bed Allocation" }],
  },
  {
    pattern: "/ipd/treatment/:admissionId",
    trail: (params, _appts, admissions) => [
      { label: "IPD", to: "/ipd" },
      patientCrumbFromAdmission(params.admissionId, admissions),
      { label: "Treatment Records" },
    ],
  },
  {
    pattern: "/ipd/discharge/:admissionId",
    trail: (params, _appts, admissions) => [
      { label: "IPD", to: "/ipd" },
      patientCrumbFromAdmission(params.admissionId, admissions),
      { label: "Discharge Summary" },
    ],
  },
  {
    pattern: "/ipd/billing/:admissionId",
    trail: (params, _appts, admissions) => [
      { label: "IPD", to: "/ipd" },
      patientCrumbFromAdmission(params.admissionId, admissions),
      { label: "Billing" },
    ],
  },

  { pattern: "/pharmacy", trail: () => [{ label: "Pharmacy" }] },
  {
    pattern: "/pharmacy/add",
    trail: () => [
      { label: "Pharmacy", to: "/pharmacy" },
      { label: "Add Medicine" },
    ],
  },
  {
    pattern: "/pharmacy/purchase",
    trail: () => [
      { label: "Pharmacy", to: "/pharmacy" },
      { label: "Purchase Entry" },
    ],
  },
  {
    pattern: "/pharmacy/sell",
    trail: () => [
      { label: "Pharmacy", to: "/pharmacy" },
      { label: "Sales Billing" },
    ],
  },
  {
    pattern: "/pharmacy/stock",
    trail: () => [
      { label: "Pharmacy", to: "/pharmacy" },
      { label: "Stock Management" },
    ],
  },
  {
    pattern: "/pharmacy/expiry",
    trail: () => [
      { label: "Pharmacy", to: "/pharmacy" },
      { label: "Expiry Alerts" },
    ],
  },
  {
    pattern: "/pharmacy/medicine/:medicineId",
    trail: (params, _appts, _admissions, medicines) => {
      const medicine = medicines?.find((m) => m.id === params.medicineId);
      return [
        { label: "Pharmacy", to: "/pharmacy" },
        medicine
          ? { label: medicine.brandName, idLabel: medicine.id }
          : { label: "Medicine" },
      ];
    },
  },

  { pattern: "/users", trail: () => [{ label: "Users" }] },
  {
    pattern: "/users/add",
    trail: () => [{ label: "Users", to: "/users" }, { label: "Add User" }],
  },
  { pattern: "/reports", trail: () => [{ label: "Reports & Analytics" }] },
];

const Breadcrumbs = () => {
  const location = useLocation();
  const { appointments } = useAppointments();
  const { admissions } = useIPD();
  const { medicines } = usePharmacy();

  let trail = null;
  for (const route of ROUTES) {
    const match = matchPath(
      { path: route.pattern, end: true },
      location.pathname,
    );
    if (match) {
      trail = route.trail(match.params, appointments, admissions, medicines);
      break;
    }
  }

  if (!trail) return null;

  const renderCrumbContent = (crumb, isLast) => {
    if (crumb.idLabel) {
      return (
        <span className="hms-bc-patient">
          <span className="hms-bc-patient-name">{crumb.label}</span>
          <span className="hms-bc-patient-id">{crumb.idLabel}</span>
        </span>
      );
    }
    if (isLast) {
      return (
        <span className="hms-bc-current">
          <Abbr underline={false}>{crumb.label}</Abbr>
        </span>
      );
    }
    if (crumb.to) {
      return (
        <Link to={crumb.to} className="hms-bc-link">
          <Abbr underline={false}>{crumb.label}</Abbr>
        </Link>
      );
    }
    return (
      <span className="hms-bc-link">
        <Abbr underline={false}>{crumb.label}</Abbr>
      </span>
    );
  };

  const n = trail.length;
  const items = [
    <li key="home">
      <Link to="/dashboard" className="hms-bc-home" title="Dashboard">
        <Home size={15} />
      </Link>
    </li>,
  ];

  trail.forEach((crumb, i) => {
    const isLast = i === n - 1;
    const chevronAlwaysVisible = i === 0 || isLast;

    items.push(
      <li
        key={`chev-${i}`}
        aria-hidden="true"
        className={`hms-bc-chev${chevronAlwaysVisible ? "" : " hms-bc-collapsible"}`}
      >
        <ChevronRight size={13} />
      </li>,
    );

    if (i === 0 && n > 1) {
      items.push(
        <li key="ellipsis" className="hms-bc-ellipsis">
          …
        </li>,
      );
    }

    items.push(
      <li
        key={`crumb-${i}`}
        className={isLast ? undefined : "hms-bc-collapsible"}
      >
        {renderCrumbContent(crumb, isLast)}
      </li>,
    );
  });

  return (
    <nav aria-label="Breadcrumb" className="hms-breadcrumb-nav">
      <style>{`
        .hms-breadcrumb-nav {
          container-type: inline-size;
          container-name: hms-breadcrumb;
          padding: 0.75rem 1.5rem 0;
        }
        @media (max-width: 767px) { .hms-breadcrumb-nav { padding: 0.625rem 0.875rem 0; } }
        @media (max-width: 479px) { .hms-breadcrumb-nav { padding: 0.5rem 0.625rem 0; } }

        .hms-breadcrumb-list {
          display: flex; align-items: center; gap: 4px; flex-wrap: nowrap;
          overflow: hidden; list-style: none; margin: 0; padding: 0; min-height: 22px;
        }
        .hms-breadcrumb-list li { display: flex; align-items: center; flex-shrink: 0; }

        .hms-bc-home { display: flex; color: #94a3b8; transition: color 0.15s; }
        .hms-bc-home:hover { color: var(--hms-blue); }

        .hms-bc-chev svg { color: #cbd5e1; }

        .hms-bc-link {
          font-family: var(--font-body); font-size: 0.8rem; font-weight: 600;
          color: #64748b; text-decoration: none; white-space: nowrap;
          transition: color 0.15s;
        }
        .hms-bc-link:hover { color: var(--hms-blue); }

        .hms-bc-current {
          font-family: var(--font-body); font-size: 0.8rem; font-weight: 800;
          color: var(--hms-navy); white-space: nowrap;
        }

        .hms-bc-patient { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .hms-bc-patient-name {
          font-family: var(--font-body); font-size: 0.8rem; font-weight: 600; color: #64748b;
        }
        .hms-bc-patient-id {
          font-family: var(--font-body); font-size: 0.66rem; font-weight: 700;
          color: var(--hms-blue); background: var(--hms-blue-light);
          padding: 1.5px 7px; border-radius: 20px; letter-spacing: 0.02em;
        }

        .hms-bc-ellipsis {
          font-size: 0.85rem; font-weight: 700; color: #cbd5e1; padding: 0 2px;
        }

        .hms-bc-collapsible { display: none !important; }
        @container hms-breadcrumb (min-width: 480px) {
          .hms-bc-collapsible { display: flex !important; }
          .hms-bc-ellipsis { display: none !important; }
        }
      `}</style>
      <ol className="hms-breadcrumb-list">{items}</ol>
    </nav>
  );
};

export default Breadcrumbs;
