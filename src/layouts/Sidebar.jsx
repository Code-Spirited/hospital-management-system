import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BedroomParentIcon from "@mui/icons-material/BedroomParent";
import MedicationIcon from "@mui/icons-material/Medication";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";

const menuItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon fontSize="small" />,
    path: "/dashboard",
  },
  { label: "OPD", icon: <PeopleIcon fontSize="small" />, path: "/opd" },
  { label: "IPD", icon: <BedroomParentIcon fontSize="small" />, path: "/ipd" },
  {
    label: "Pharmacy",
    icon: <LocalPharmacyIcon fontSize="small" />,
    path: "/pharmacy",
  },
  {
    label: "Users",
    icon: <ManageAccountsIcon fontSize="small" />,
    path: "/users",
  },
  {
    label: "Reports",
    icon: <AssessmentIcon fontSize="small" />,
    path: "/reports",
  },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-gray-900 text-white z-40
        flex flex-col transition-all duration-300
        ${isOpen ? "w-64" : "w-16"}
      `}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 min-h-[64px]">
        {isOpen && (
          <div className="flex items-center gap-2">
            <LocalHospitalIcon className="text-blue-400" />
            <span className="font-bold text-sm text-white leading-tight">
              Auctech <br />
              <span className="text-blue-400 font-normal text-xs">HMS</span>
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-700 transition-colors ml-auto"
        >
          {isOpen ? (
            <ChevronLeftIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-1 px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 text-sm font-medium
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isOpen && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Version Tag */}
      {isOpen && (
        <div className="px-4 py-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">HMS v1.0.0</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
