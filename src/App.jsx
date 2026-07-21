import { Toaster } from "sonner";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";

function App() {
  return (
    <>
      <Tooltip.Provider delayDuration={150}>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Tooltip.Provider>

      <style>{`
        [data-sonner-toaster] [data-sonner-toast] {
          position: relative !important;
          border-radius: 16px !important;
          border: 1.5px solid var(--hms-border) !important;
          border-left: 4px solid #94a3b8 !important;
          padding: 1rem 2.25rem 1rem 1rem !important;
          background: #fff !important;
          font-family: var(--font-body) !important;
          box-shadow: 0 12px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.05) !important;
        }

        [data-sonner-toaster] [data-sonner-toast][data-type="success"] { border-left-color: #059669 !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="error"]   { border-left-color: #dc2626 !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="info"]    { border-left-color: #2563eb !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="warning"] { border-left-color: #d97706 !important; }
        [data-sonner-toaster] [data-sonner-toast].hms-toast-violet     { border-left-color: #7c3aed !important; }

        [data-sonner-toaster] [data-sonner-toast] [data-icon] {
          width: 38px !important; height: 38px !important;
          border-radius: 11px !important;
          background: var(--hms-surface) !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          flex-shrink: 0 !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-type="success"] [data-icon] { background: #ecfdf5 !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="error"]   [data-icon] { background: #fef2f2 !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="info"]    [data-icon] { background: #eff6ff !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="warning"] [data-icon] { background: #fffbeb !important; }
        [data-sonner-toaster] [data-sonner-toast].hms-toast-violet     [data-icon] { background: #f5f3ff !important; }

        [data-sonner-toaster] [data-sonner-toast] [data-title] {
          font-family: var(--font-display) !important;
          font-weight: 800 !important;
          font-size: 0.92rem !important;
          color: var(--hms-navy) !important;
        }
        [data-sonner-toaster] [data-sonner-toast] [data-description] {
          font-family: var(--font-body) !important;
          color: #64748b !important;
          font-size: 0.8rem !important;
          margin-top: 3px !important;
          line-height: 1.45 !important;
        }

        /* Close button: a small bordered icon button, matching the same
           style already used for every other small icon button in the
           app (NotificationsDrawer, CalendarDrawer, row-action menus),
           instead of the old plain filled circle. */
        [data-sonner-toaster] [data-sonner-toast] [data-close-button] {
          position: absolute !important;
          top: 10px !important;
          right: 10px !important;
          left: auto !important;
          bottom: auto !important;
          transform: none !important;
          width: 22px !important;
          height: 22px !important;
          border-radius: 7px !important;
          border: 1.5px solid var(--hms-border) !important;
          background: #fff !important;
          color: #94a3b8 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.15s !important;
        }
        [data-sonner-toaster] [data-sonner-toast] [data-close-button]:hover {
          background: #fef2f2 !important;
          color: #ef4444 !important;
          border-color: #fca5a5 !important;
        }
      `}</style>

      <Toaster
        position="top-right"
        expand
        duration={4000}
        closeButton
        icons={{
          success: <CheckCircle2 size={18} color="#059669" />,
          error: <XCircle size={18} color="#dc2626" />,
          info: <Info size={18} color="#2563eb" />,
          warning: <AlertTriangle size={18} color="#d97706" />,
          loading: (
            <Loader2 size={18} color="#64748b" className="animate-spin" />
          ),
        }}
      />
    </>
  );
}

export default App;
