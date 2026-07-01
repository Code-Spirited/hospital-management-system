import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from "lucide-react";
import loginImage from "../../assets/login-left-image.png";

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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1800);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes popIn { from { opacity:0; transform:scale(.75); } to { opacity:1; transform:scale(1); } }

        .fp-input {
          width: 100%; padding: .75rem 1rem .75rem 2.625rem;
          border: 1.5px solid #e2e8f0; border-radius: 11px;
          font-size: .9rem; font-family: 'Inter', sans-serif;
          outline: none; background: #fff; color: #0f172a;
          transition: border-color .2s, box-shadow .2s;
        }
        .fp-input::placeholder { color: #94a3b8; }
        .fp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3.5px rgba(37,99,235,.1); }
        .fp-input.err { border-color: #ef4444; }

        .fp-right {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; background: #fff; overflow-y: auto; scrollbar-width: none;
        }
        .fp-right::-webkit-scrollbar { display: none; }

        .fp-btn-primary {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: .9rem 1rem;
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          color: #fff; font-weight: 700; font-size: .95rem; font-family: 'Inter', sans-serif;
          border: none; border-radius: 11px; cursor: pointer;
          box-shadow: 0 4px 18px rgba(37,99,235,.38); letter-spacing: .015em;
          transition: opacity .2s, transform .15s, box-shadow .2s;
        }
        .fp-btn-primary:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 7px 26px rgba(37,99,235,.46); }
        .fp-btn-primary:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

        .fp-btn-outline {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: .78rem 1rem; background: #fff; border: 1.5px solid #e2e8f0;
          border-radius: 11px; font-size: .9rem; font-weight: 500; font-family: 'Inter', sans-serif;
          color: #334155; cursor: pointer; transition: background .15s, border-color .15s;
        }
        .fp-btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }

        .fp-pop { animation: popIn 0.55s cubic-bezier(.22,.68,0,1.4) both; }

        /* ── Left panel: pure image, zero overlay ── */
        .fp-left {
          width: 50%; position: sticky; top: 0; height: 100vh;
          flex-shrink: 0; overflow: hidden; background: #eef2f9;
        }
        .fp-left-image {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center;
        }
        .fp-headline {
          font-size: 2.6rem; font-weight: 800; color: #0f172a;
          line-height: 1.1; margin: 0 0 .9rem; letter-spacing: -.03em;
          text-align: right;
        }
        .fp-subcopy {
          font-size: .92rem; color: #475569; line-height: 1.7;
          max-width: 300px; margin: 0 0 0 auto;
          text-align: right;
        }

        /* ── Brand badge: pill with a true rotating conic-gradient
           border. We register --fp-angle as a real animatable <angle>
           custom property and animate the angle itself from 0deg to
           360deg — this is what makes the light genuinely sweep
           clockwise around the ring, rather than the whole gradient
           spinning in place via transform. ── */
        @property --fp-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes fp-rotate {
          to { --fp-angle: 360deg; }
        }
        .fp-brand-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 30px;
          border-radius: 999px;
          background: #ffffff;
          isolation: isolate;
          --fp-angle: 0deg;
        }
        /* Crisp ring sitting on the pill's own border, sweeping clockwise */
        .fp-brand-badge::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 999px;
          padding: 4px;
          background: conic-gradient(
            from var(--fp-angle),
            #ffffff 0deg,
            #bfdbfe 55deg,
            #60a5fa 115deg,
            #2563eb 175deg,
            #1e3a8a 235deg,
            #a78bfa 290deg,
            #c4b5fd 330deg,
            #ffffff 360deg
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: fp-rotate 4s linear infinite;
          z-index: -1;
        }
        .fp-brand-icon-wrap {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(96,165,250,0.5);
        }
        .fp-brand-text {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: .08em;
          text-transform: uppercase;
          white-space: nowrap;
        }
      `}</style>

      {/* LEFT PANEL — same layout as Login: no overlay, headline top-right, stats top-left */}
      <div className="hidden lg:block fp-left">
        <img src={loginImage} alt="Auctech HMS" className="fp-left-image" />

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
          <div className="fp-brand-badge">
            <div className="fp-brand-icon-wrap">
              <ShieldCheck size={16} style={{ color: "#fff" }} />
            </div>
            <span className="fp-brand-text">Auctech HMS</span>
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
          <motion.h1 variants={fadeUp} className="fp-headline">
            Account
            <br />
            Recovery
          </motion.h1>
          <motion.p variants={fadeUp} className="fp-subcopy">
            Don't worry — enter your registered email and we'll get you back in
            securely within minutes.
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="fp-right">
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

          {!submitted ? (
            <>
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
                  Password Reset
                </span>
              </div>

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
                Forgot password?
              </h2>
              <p
                style={{
                  fontSize: ".92rem",
                  color: "#64748b",
                  margin: "0 0 2rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Enter your registered email and we'll send a secure reset link.
              </p>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className={`fp-input ${error ? "err" : ""}`}
                    />
                  </div>
                  {error && (
                    <p
                      style={{
                        marginTop: ".3rem",
                        fontSize: ".76rem",
                        color: "#ef4444",
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="fp-btn-primary"
                >
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
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={() => navigate("/login")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: "1.25rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: ".84rem",
                  color: "#64748b",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  padding: 0,
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </button>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div
                className="fp-pop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #dbeafe, #93c5fd)",
                  marginBottom: "1.5rem",
                }}
              >
                <MailCheck
                  style={{ width: 36, height: 36, color: "#1d4ed8" }}
                />
              </div>

              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 .5rem",
                  letterSpacing: "-.03em",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Check your inbox
              </h2>
              <p
                style={{
                  fontSize: ".9rem",
                  color: "#64748b",
                  margin: "0 0 .3rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                We sent a password reset link to
              </p>
              <p
                style={{
                  fontSize: ".9rem",
                  fontWeight: 700,
                  color: "#2563eb",
                  margin: "0 0 1.25rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {email}
              </p>
              <p
                style={{
                  fontSize: ".8rem",
                  color: "#94a3b8",
                  margin: "0 0 2rem",
                  lineHeight: 1.6,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Didn't receive it? Check your spam folder, or wait a minute and
                try again.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: ".75rem",
                }}
              >
                <button
                  onClick={() => navigate("/login")}
                  className="fp-btn-primary"
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="fp-btn-outline"
                >
                  Try a different email
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
