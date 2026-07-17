// Login.js

import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle,
  Circle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import loginImage from "../../assets/login-left-image.png";
import { loginSchema } from "./authSchema";
import { PASSWORD_RULES } from "../../utils/validators";

// ── Stagger container + shared fade-up item ──────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const PasswordRule = ({ valid, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    {valid ? (
      <CheckCircle size={14} style={{ color: "#2563eb", flexShrink: 0 }} />
    ) : (
      <Circle size={14} style={{ color: "#cbd5e1", flexShrink: 0 }} />
    )}
    <span
      style={{
        fontSize: ".82rem",
        color: valid ? "#2563eb" : "#94a3b8",
        transition: "color .3s",
      }}
    >
      {text}
    </span>
  </div>
);

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });
  const password = useWatch({ control, name: "password", defaultValue: "" });

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Welcome back, Admin!", {
        description: "Signed in successfully.",
      });
      navigate("/dashboard");
    }, 1800);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        .lf-input {
          width: 100%; padding: .75rem 1rem .75rem 2.625rem;
          border: 1.5px solid #e2e8f0; border-radius: 11px;
          font-size: .9rem; font-family: 'Inter', sans-serif;
          outline: none; background: #fff; color: #0f172a;
          transition: border-color .2s, box-shadow .2s;
        }
        .lf-input::placeholder { color: #94a3b8; }
        .lf-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3.5px rgba(37,99,235,.1); }
        .lf-input.err { border-color: #ef4444; }
        .lf-input.err:focus { box-shadow: 0 0 0 3.5px rgba(239,68,68,.1); }

        .lf-right {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; background: #fff; overflow-y: auto; scrollbar-width: none;
        }
        .lf-right::-webkit-scrollbar { display: none; }

        .lf-sign-in-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: .9rem 1rem;
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          color: #fff; font-weight: 700; font-size: .95rem; font-family: 'Inter', sans-serif;
          border: none; border-radius: 11px; cursor: pointer;
          box-shadow: 0 4px 18px rgba(37,99,235,.38);
          transition: opacity .2s, transform .15s, box-shadow .2s;
          letter-spacing: .015em;
        }
        .lf-sign-in-btn:hover:not(:disabled) {
          opacity: .92; transform: translateY(-1px);
          box-shadow: 0 7px 26px rgba(37,99,235,.46);
        }
        .lf-sign-in-btn:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

        .lf-google-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: .78rem 1rem; background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 11px; font-size: .9rem; font-weight: 500; font-family: 'Inter', sans-serif;
          color: #334155; cursor: pointer;
          transition: background .15s, border-color .15s, transform .15s;
        }
        .lf-google-btn:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }

        /* ── Left panel: pure image, zero overlay ── */
        .lf-left {
          width: 50%; position: sticky; top: 0; height: 100vh;
          flex-shrink: 0; overflow: hidden; background: #eef2f9;
        }
        .lf-left-image {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center;
        }
        .lf-headline {
          font-size: 2.6rem; font-weight: 800; color: #0f172a;
          line-height: 1.1; margin: 0 0 .9rem; letter-spacing: -.03em;
          text-align: right;
        }
        .lf-subcopy {
          font-size: .92rem; color: #475569; line-height: 1.7;
          max-width: 300px; margin: 0 0 0 auto;
          text-align: right;
        }

        /* ── Brand badge: pill with a true rotating conic-gradient
           border. We register --lf-angle as a real animatable <angle>
           custom property and animate the angle itself from 0deg to
           360deg — this is what makes the light genuinely sweep
           clockwise around the ring, rather than the whole gradient
           spinning in place via transform. ── */
        @property --lf-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes lf-rotate {
          to { --lf-angle: 360deg; }
        }
        .lf-brand-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 30px;
          border-radius: 999px;
          background: #ffffff;
          isolation: isolate;
          --lf-angle: 0deg;
        }
        /* Crisp ring sitting on the pill's own border, sweeping clockwise */
        .lf-brand-badge::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 999px;
          padding: 4px;
          background: conic-gradient(
            from var(--lf-angle),
            #2563eb 0deg,
            #60a5fa 70deg,
            #ffffff 130deg,
            #c4b5fd 190deg,
            #a78bfa 250deg,
            #1e3a8a 310deg,
            #2563eb 360deg
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: lf-rotate 3.5s linear infinite;
          z-index: -1;
        }
        .lf-brand-icon-wrap {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(96,165,250,0.5);
        }
        .lf-brand-text {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          LEFT PANEL — image shown with no overlay at all.
          Headline sits top-right (open sky in the source image),
          stats are stacked top-left as small floating cards.
         ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block lf-left">
        <img src={loginImage} alt="Auctech HMS" className="lf-left-image" />

        {/* Brand badge — big, stylish, animated blue-hue border. Top-left. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "2.5rem",
          }}
        >
          <div className="lf-brand-badge">
            <div className="lf-brand-icon-wrap">
              <ShieldCheck size={16} style={{ color: "#fff" }} />
            </div>
            <span className="lf-brand-text">Auctech HMS</span>
          </div>
        </motion.div>

        {/* Headline + subcopy — top-right, over open sky */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{
            position: "absolute",
            top: "2.5rem",
            right: "2.5rem",
            textAlign: "right",
          }}
        >
          <motion.h1 variants={fadeUp} className="lf-headline">
            Hospital
            <br />
            Management
            <br />
            System
          </motion.h1>

          <motion.p variants={fadeUp} className="lf-subcopy">
            Streamline patient care, appointments, pharmacy, billing and
            reporting — all in one unified platform.
          </motion.p>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT PANEL — vibrant, high-contrast
         ══════════════════════════════════════════════════════════════ */}
      <div className="lf-right">
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
          style={{
            width: "100%",
            maxWidth: "22rem",
            margin: "auto",
            paddingTop: "3rem",
            paddingBottom: "3rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
          }}
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div
              style={{
                background: "#1e40af",
                borderRadius: 10,
                padding: "7px 9px",
              }}
            >
              <ShieldCheck
                style={{ width: 18, height: 18, color: "#93c5fd" }}
              />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "#0f172a",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Auctech HMS
            </span>
          </div>

          {/* Accent badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 13px",
              borderRadius: 20,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              marginBottom: ".9rem",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#2563eb",
              }}
            />
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 700,
                color: "#1d4ed8",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Secure Sign In
            </span>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: "2.1rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 .45rem",
              letterSpacing: "-.035em",
              lineHeight: 1.15,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              fontSize: ".92rem",
              color: "#64748b",
              margin: "0 0 2rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Sign in to your account to continue
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: ".4rem",
                  fontSize: ".74rem",
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="email"
                  placeholder="admin@hospital.com"
                  {...register("email")}
                  className={`lf-input ${errors.email ? "err" : ""}`}
                />
              </div>
              {errors.email && (
                <p
                  style={{
                    marginTop: ".3rem",
                    fontSize: ".76rem",
                    color: "#ef4444",
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: ".4rem",
                }}
              >
                <label
                  style={{
                    fontSize: ".74rem",
                    fontWeight: 700,
                    color: "#374151",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  style={{
                    fontSize: ".8rem",
                    fontWeight: 600,
                    color: "#2563eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Lock
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    color: "#94a3b8",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={`lf-input ${errors.password ? "err" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p
                  style={{
                    marginTop: ".3rem",
                    fontSize: ".76rem",
                    color: "#ef4444",
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {errors.password.message}
                </p>
              )}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: ".75rem",
                    padding: ".875rem 1rem",
                    background: "#f8fafc",
                    border: "1.5px solid #e8edf4",
                    borderRadius: 11,
                    display: "flex",
                    flexDirection: "column",
                    gap: ".45rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: ".65rem",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                      margin: "0 0 .25rem",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Password Requirements
                  </p>
                  {PASSWORD_RULES.map((rule) => (
                    <PasswordRule
                      key={rule.key}
                      valid={rule.test(password)}
                      text={rule.checklistLabel}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: 15,
                  height: 15,
                  accentColor: "#2563eb",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="remember"
                style={{
                  fontSize: ".875rem",
                  color: "#475569",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In */}
            <button type="submit" disabled={loading} className="lf-sign-in-btn">
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ position: "relative", padding: ".2rem 0" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ width: "100%", borderTop: "1.5px solid #f1f5f9" }}
                />
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    background: "#fff",
                    padding: "0 1rem",
                    fontSize: ".7rem",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  or continue with
                </span>
              </div>
            </div>

            {/* Google */}
            <button type="button" className="lf-google-btn">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                style={{ width: 18, height: 18 }}
              />
              Sign in with Google
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
