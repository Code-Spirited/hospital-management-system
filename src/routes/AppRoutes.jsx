//src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import AppointmentList from "../pages/opd/AppointmentList";
import Consultation from "../pages/opd/Consultation";
import Prescription from "../pages/opd/Prescription";
import Billing from "../pages/opd/Billing";

// Auth pages
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

import OPD from "../pages/opd/OPD";
import PatientList from "../pages/opd/PatientList";
import PatientRegistration from "../pages/opd/PatientRegistration";

import IPD from "../pages/ipd/IPD";
import IPDHome from "../pages/ipd/IPDHome";
import AdmissionForm from "../pages/ipd/AdmissionForm";
import WardManagement from "../pages/ipd/WardManagement";
import BedAllocation from "../pages/ipd/BedAllocation";
import TreatmentRecords from "../pages/ipd/TreatmentRecords";
import DischargeSummary from "../pages/ipd/DischargeSummary";
import IPDBilling from "../pages/ipd/IPDBilling";

import Pharmacy from "../pages/pharmacy/Pharmacy";
import MedicineInventory from "../pages/pharmacy/MedicineInventory";
import AddMedicine from "../pages/pharmacy/AddMedicine";
import PurchaseEntry from "../pages/pharmacy/PurchaseEntry";
import MedicineDetails from "../pages/pharmacy/MedicineDetails";
import SalesBilling from "../pages/pharmacy/SalesBilling";
import StockManagement from "../pages/pharmacy/StockManagement";
import ExpiryAlerts from "../pages/pharmacy/ExpiryAlerts";

import Users from "../pages/users/Users";
import UserDirectory from "../pages/users/UserDirectory";
import AddUser from "../pages/users/AddUser";
import RolesPermissions from "../pages/users/RolesPermissions";
import UserPermissions from "../pages/users/UserPermissions";
import Profile from "../pages/users/Profile";
import Settings from "../pages/users/Settings";

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
          <Route
            path="prescription/:appointmentId"
            element={<Prescription />}
          />
          <Route path="billing/:appointmentId" element={<Billing />} />
        </Route>
        <Route path="/ipd" element={<IPD />}>
          <Route index element={<IPDHome />} />
          <Route path="admit" element={<AdmissionForm />} />
          <Route path="wards" element={<WardManagement />} />
          <Route path="beds" element={<BedAllocation />} />
          <Route path="treatment/:admissionId" element={<TreatmentRecords />} />
          <Route path="discharge/:admissionId" element={<DischargeSummary />} />
          <Route path="billing/:admissionId" element={<IPDBilling />} />
        </Route>
        <Route path="/pharmacy" element={<Pharmacy />}>
          <Route index element={<MedicineInventory />} />
          <Route path="add" element={<AddMedicine />} />
          <Route path="purchase" element={<PurchaseEntry />} />
          <Route path="medicine/:medicineId" element={<MedicineDetails />} />
          <Route path="sell" element={<SalesBilling />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="expiry" element={<ExpiryAlerts />} />
        </Route>
        <Route path="/users" element={<Users />}>
          <Route index element={<UserDirectory />} />
          <Route path="add" element={<AddUser />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="permissions" element={<UserPermissions />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
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
