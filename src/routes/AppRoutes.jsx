import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import AppointmentList from "../pages/opd/AppointmentList";
import Consultation from "../pages/opd/Consultation";

// Auth pages
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

import OPD from "../pages/opd/OPD";
import PatientList from "../pages/opd/PatientList";
import PatientRegistration from "../pages/opd/PatientRegistration";

// Placeholder for pages not yet built
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 mt-2">This page is under construction</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/opd" element={<OPD />}>
          <Route index element={<PatientList />} />
          <Route path="register" element={<PatientRegistration />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route
            path="consultation/:appointmentId"
            element={<Consultation />}
          />
        </Route>
        <Route path="/ipd" element={<PlaceholderPage title="IPD Module" />} />
        <Route
          path="/pharmacy"
          element={<PlaceholderPage title="Pharmacy" />}
        />
        <Route
          path="/users"
          element={<PlaceholderPage title="User Management" />}
        />
        <Route
          path="/reports"
          element={<PlaceholderPage title="Reports & Analytics" />}
        />
      </Route>

      <Route
        path="*"
        element={<PlaceholderPage title="404 - Page Not Found" />}
      />
    </Routes>
  );
};

export default AppRoutes;
