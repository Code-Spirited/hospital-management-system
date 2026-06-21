import { Toaster } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <AppRoutes />

      <style>{`
        [data-sonner-toaster] [data-sonner-toast] {
          position: relative !important;
          border-radius: 20px !important;
          padding: 1rem 2.5rem 1rem 1.125rem !important;
          background: #fff !important;
          font-family: var(--font-body) !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-type="success"] {
          border: 1.5px solid #22c55e !important;
          box-shadow: 0 0 14px 2px rgba(34,197,94,0.28), 0 4px 16px rgba(15,23,42,0.08) !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-type="error"] {
          border: 1.5px solid #ef4444 !important;
          box-shadow: 0 0 14px 2px rgba(239,68,68,0.28), 0 4px 16px rgba(15,23,42,0.08) !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-type="info"] {
          border: 1.5px solid #2563eb !important;
          box-shadow: 0 0 14px 2px rgba(37,99,235,0.28), 0 4px 16px rgba(15,23,42,0.08) !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-type="warning"] {
          border: 1.5px solid #d97706 !important;
          box-shadow: 0 0 14px 2px rgba(217,119,6,0.28), 0 4px 16px rgba(15,23,42,0.08) !important;
        }
        [data-sonner-toaster] [data-sonner-toast] [data-icon] {
          width: 36px !important; height: 36px !important;
          border-radius: 50% !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          flex-shrink: 0 !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-type="success"] [data-icon] { background: #22c55e !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="error"]   [data-icon] { background: #ef4444 !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="info"]    [data-icon] { background: #2563eb !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="warning"] [data-icon] { background: #d97706 !important; }
        [data-sonner-toaster] [data-sonner-toast] [data-title] {
          font-family: var(--font-display) !important;
          font-weight: 800 !important;
          font-size: 0.92rem !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-type="success"] [data-title] { color: #059669 !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="error"]   [data-title] { color: #dc2626 !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="info"]    [data-title] { color: #2563eb !important; }
        [data-sonner-toaster] [data-sonner-toast][data-type="warning"] [data-title] { color: #d97706 !important; }
        [data-sonner-toaster] [data-sonner-toast] [data-description] {
          font-family: var(--font-body) !important;
          color: #64748b !important;
          font-size: 0.8rem !important;
          margin-top: 2px !important;
        }

        /* Close button: forced into the card's own top-right corner,
           never hanging off an edge. */
        [data-sonner-toaster] [data-sonner-toast] [data-close-button] {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          left: auto !important;
          bottom: auto !important;
          transform: none !important;
          width: 20px !important;
          height: 20px !important;
          border-radius: 50% !important;
          border: none !important;
          background: var(--hms-surface) !important;
          color: #94a3b8 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        [data-sonner-toaster] [data-sonner-toast] [data-close-button]:hover {
          background: #e2e8f0 !important;
          color: #475569 !important;
        }
      `}</style>

      <Toaster
        position="top-right"
        expand
        duration={4000}
        closeButton
        icons={{
          success: <CheckCircle2 size={19} color="#fff" />,
          error: <XCircle size={19} color="#fff" />,
          info: <Info size={19} color="#fff" />,
          warning: <AlertTriangle size={19} color="#fff" />,
          loading: <Loader2 size={19} color="#fff" className="animate-spin" />,
        }}
      />
    </>
  );
}

export default App;
