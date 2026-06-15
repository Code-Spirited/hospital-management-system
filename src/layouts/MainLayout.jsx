import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import useSmoothScroll from "../hooks/useSmoothScroll";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  useSmoothScroll();

  return (
    <div
      data-sidebar={sidebarOpen ? "open" : "closed"}
      style={{
        minHeight: "100vh",
        background: "var(--hms-surface)",
        fontFamily: "var(--font-body)",
      }}
    >
      <style>{`
        .hms-page-content { padding: 1.5rem; }
        @media (max-width: 767px) { .hms-page-content { padding: 0.875rem; } }
        @media (max-width: 479px) { .hms-page-content { padding: 0.625rem; } }
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
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="hms-page-content"
            style={{ flex: 1 }}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
