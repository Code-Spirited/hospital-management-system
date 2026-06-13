import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

const Header = ({ sidebarOpen, toggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  const notifications = [
    { id: 1, text: "New patient registered", time: "2 min ago", unread: true },
    {
      id: 2,
      text: "Appointment #1042 confirmed",
      time: "15 min ago",
      unread: true,
    },
    {
      id: 3,
      text: "Medicine stock low: Paracetamol",
      time: "1 hr ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={`
      fixed top-0 right-0 h-16 bg-white border-b border-gray-200
      z-30 flex items-center px-4 gap-4
      transition-all duration-300
      ${sidebarOpen ? "left-64" : "left-16"}
    `}
    >
      {/* ── Search bar ── */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <SearchIcon fontSize="small" className="text-gray-400" />
          <input
            type="text"
            placeholder="Search patients, doctors..."
            className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* ── Notifications bell ── */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <NotificationsIcon fontSize="small" className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <h4 className="font-semibold text-gray-800 text-sm">
                  Notifications
                </h4>
              </div>
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${n.unread ? "bg-blue-50" : ""}`}
                  >
                    <p className="text-sm text-gray-700">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Profile menu ── */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <AccountCircleIcon className="text-gray-600" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-800 leading-none">
                Admin User
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Administrator</p>
            </div>
            <KeyboardArrowDownIcon fontSize="small" className="text-gray-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1">
              <button
                onClick={() => navigate("/users/profile")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <PersonIcon fontSize="small" />
                My Profile
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => navigate("/login")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogoutIcon fontSize="small" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
