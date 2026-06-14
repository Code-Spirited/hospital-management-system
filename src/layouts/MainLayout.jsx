import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      data-sidebar={sidebarOpen ? "open" : "closed"}
      style={{
        minHeight: "100vh",
        background: "var(--hms-surface)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Responsive content padding */}
      <style>{`
        .hms-page-content { padding: 1.5rem; }
        @media (max-width: 767px) {
          .hms-page-content { padding: 0.875rem; }
        }
        @media (max-width: 479px) {
          .hms-page-content { padding: 0.625rem; }
        }
      `}</style>

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((s) => !s)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <Header onMobileMenuClick={() => setMobileMenuOpen(true)} />

      <div
        className="hms-main"
        style={{
          paddingTop: 64,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main className="hms-page-content" style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
