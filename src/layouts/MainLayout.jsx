import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import useSmoothScroll from "../hooks/useSmoothScroll";
import { NotificationsProvider } from "../context/NotificationsContext";
import { PatientsProvider } from "../context/PatientsContext";
import { AppointmentsProvider } from "../context/AppointmentsContext";
import NotificationsDrawer from "../components/common/Drawer/NotificationsDrawer";
import CalendarDrawer from "../components/common/Drawer/CalendarDrawer";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const location = useLocation();
  useSmoothScroll();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setNotifOpen(false);
        setCalendarOpen(false);
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <NotificationsProvider>
      <PatientsProvider>
        <AppointmentsProvider>
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

            <Header
              onMobileMenuClick={() => setMobileMenuOpen(true)}
              onOpenNotifications={() => setNotifOpen(true)}
              onOpenCalendar={() => setCalendarOpen(true)}
              paletteOpen={paletteOpen}
              onPaletteOpenChange={setPaletteOpen}
            />

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

            <NotificationsDrawer open={notifOpen} onOpenChange={setNotifOpen} />
            <CalendarDrawer
              open={calendarOpen}
              onOpenChange={setCalendarOpen}
            />
          </div>
        </AppointmentsProvider>
      </PatientsProvider>
    </NotificationsProvider>
  );
};

export default MainLayout;
