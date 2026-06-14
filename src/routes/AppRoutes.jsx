import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";

// Auth pages — imported from their files
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

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
      {/* Redirect root URL to login page */}
      {/* A real app shows login first, not dashboard */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Auth routes — NO sidebar/header ── */}
      {/* These are standalone, outside MainLayout */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── Protected routes — WITH sidebar/header ── */}
      {/* Everything nested here renders inside MainLayout's <Outlet /> */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/opd" element={<PlaceholderPage title="OPD Module" />} />
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

      {/* Any unknown URL → 404 */}
      <Route
        path="*"
        element={<PlaceholderPage title="404 - Page Not Found" />}
      />
    </Routes>
  );
};

export default AppRoutes;
