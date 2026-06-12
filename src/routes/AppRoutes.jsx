import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// Placeholder pages — we'll build real ones later
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
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Main layout wraps all pages */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={<PlaceholderPage title="Dashboard" />}
        />
        <Route path="/opd" element={<PlaceholderPage title="OPD Module" />} />
        <Route path="/ipd" element={<PlaceholderPage title="IPD Module" />} />
        <Route
          path="/pharmacy"
          element={<PlaceholderPage title="Pharmacy Module" />}
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

      {/* 404 page */}
      <Route
        path="*"
        element={<PlaceholderPage title="404 - Page Not Found" />}
      />
    </Routes>
  );
};

export default AppRoutes;
