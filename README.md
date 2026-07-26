# Auctech HMS — Hospital Management System

A hospital management admin panel built with React as part of a React Internship project at **Auctech Marketing Communication Pvt. Ltd.**

This project is a complete front-end hospital administration system that brings together patient registration, appointment management, inpatient admissions, pharmacy inventory and billing, user management, and reporting into a single, connected application.

---

## Status

This is a fully developed **front-end** application.

The application currently runs entirely on realistic mock data and does not require a backend server. The project has already been structured for future backend integration through the `src/services/` layer, allowing real APIs to be connected later without rebuilding the UI.

---

## Built With

- **React 19** — UI library
- **Vite** — Build tool and development server
- **React Router DOM** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **React Hook Form + Zod** — Form handling and validation
- **Context API** — Shared application state
- **TanStack Table** — Advanced data tables
- **Chart.js / Recharts** — Charts and analytics
- **Axios** — Prepared for future API communication
- **Radix UI**
- **Framer Motion**
- **Lenis**
- **Sonner**
- **vaul**

These libraries provide accessible UI components, animations, smooth scrolling, toast notifications, and slide-over panels.

---

## Features

### Dashboard

- Live KPI cards (Patients, Appointments, Revenue, Bed Occupancy)
- Trend sparklines
- Revenue and appointment charts
- Recent activity feed generated from appointment data
- Appointment analytics including:
  - Weekly appointment trends
  - Doctor workload
  - Peak consultation hours

### OPD (Outpatient Department)

- Multi-step patient registration
- Patient management
  - Search
  - Filter
  - View
  - Edit
  - Delete
- Appointment booking
- Appointment rescheduling
- Appointment cancellation
- Consultation workflow
- Prescription management
- Billing workflow

### IPD (Inpatient Department)

- Patient admission
- Ward management
- Bed allocation
- Treatment record management
- Discharge summary generation
- Room-based billing with additional charges

### Pharmacy

- Medicine catalog
- Batch-based inventory management
- Purchase entry with automatic batch updates
- FEFO (First Expiry First Out) dispensing
- Sales billing with:
  - Live cart
  - Tax calculation
  - Discounts
- Manual stock adjustments with audit reason
- Expiry alert management

### User Management

- User directory
- Add/Edit users
- Role-based permission matrix
- Per-user permission overrides
- Profile management
- User settings

### Reports & Analytics

- OPD reports
- IPD reports
- Pharmacy reports
- Revenue reports
- Date-range filtering
- Cross-module analytics dashboard
- Export reports to:
  - PDF
  - Excel

---

## Project Structure

```text
src/
├── components/
│   └── common/          # Reusable UI components
├── context/             # Shared application state
├── hooks/               # Custom React hooks
├── layouts/             # Sidebar, header, footer, layouts
├── pages/               # Feature modules
│   ├── dashboard/
│   ├── opd/
│   ├── ipd/
│   ├── pharmacy/
│   ├── reports/
│   ├── users/
│   └── auth/
├── routes/              # Application routing
├── services/            # Mock services (ready for API integration)
└── utils/               # Helper utilities
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **npm** (installed with Node.js)

### Installation

Clone the repository:

```bash
git clone https://github.com/Code-Spirited/hospital-management-system
```

Navigate into the project directory:

```bash
cd hospital-management-system
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`) in your browser.

---

## Available Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Starts the development server         |
| `npm run build`   | Builds the application for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint`    | Runs the linter                       |

---

## Environment Variables

To connect the application to a real backend in the future, create a `.env` file by copying `.env.example` and set:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

This is **not required** for the current version of the application, as it already runs completely on mock data.

---

## Author

**Pravesh Kumar Patel**

React Intern  
**Auctech Marketing Communication Pvt. Ltd.**

Reporting to: **Ankit Kumar**  
GM – HR and Admin
