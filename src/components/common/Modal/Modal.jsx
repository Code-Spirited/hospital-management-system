import { useEffect } from "react";
import { X } from "lucide-react";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const Modal = ({ isOpen, onClose, title = "", size = "md", children }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Dark semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease both" }}
      />

      {/* Modal box */}
      <div
        className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
        style={{
          animation: "modalSlideUp 0.25s cubic-bezier(.22,.68,0,1.2) both",
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: "#64748b" }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn      { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

export default Modal;
