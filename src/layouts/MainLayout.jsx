import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Sidebar — fixed left, always visible */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Header — fixed top, shifts left based on sidebar width */}
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content wrapper */}
      <div
        className={`transition-all duration-300 pt-16 flex flex-col min-h-screen ${sidebarOpen ? "ml-64" : "ml-16"}`}
      >
        <main className="flex-1 p-6">
          {/* Outlet renders the current route's page component here */}
          <Outlet />
        </main>

        {/* Footer — always at the bottom */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
