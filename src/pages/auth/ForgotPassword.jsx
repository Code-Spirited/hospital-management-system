import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MailCheck,
} from "lucide-react";
import loginImage from "../../assets/login-left-image.png";

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .fp-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideR  {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .fp-au  { animation: fadeUp 0.6s cubic-bezier(.22,.68,0,1.15) both; }
        .fp-ai  { animation: fadeIn 0.7s ease both; }
        .fp-ar  { animation: slideR 0.65s cubic-bezier(.22,.68,0,1.15) both; }
        .fp-pop { animation: popIn  0.55s cubic-bezier(.22,.68,0,1.4) both; }

        .fp-d1 { animation-delay: .06s; }
        .fp-d2 { animation-delay: .13s; }
        .fp-d3 { animation-delay: .20s; }
        .fp-d4 { animation-delay: .27s; }
        .fp-d5 { animation-delay: .34s; }

        .fp-input {
          width: 100%;
          padding: .72rem 1rem .72rem 2.6rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: .875rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          background: #f8fafc;
          color: #0f172a;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .fp-input::placeholder { color: #94a3b8; }
        .fp-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3.5px rgba(14,165,233,.13);
          background: #fff;
        }
        .fp-input.err { border-color: #f87171; background: #fff5f5; }
        .fp-input.err:focus { box-shadow: 0 0 0 3.5px rgba(248,113,113,.12); }

        .fp-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: .8rem 1rem;
          background: #0f172a;
          color: #fff;
          font-weight: 600;
          font-size: .875rem;
          font-family: 'Inter', sans-serif;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          letter-spacing: .015em;
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .fp-btn:hover:not(:disabled) {
          background: #1e3a5f;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(15,23,42,.22);
        }
        .fp-btn:active:not(:disabled) { transform: translateY(0); }
        .fp-btn:disabled { opacity: .6; cursor: not-allowed; }

        .fp-btn-outline {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: .75rem 1rem;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: .875rem;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          color: #334155;
          cursor: pointer;
          transition: background .15s, border-color .15s, transform .15s;
        }
        .fp-btn-outline:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .fp-label {
          display: block;
          margin-bottom: .35rem;
          font-size: .72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-family: 'Inter', sans-serif;
        }

        .fp-right {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .fp-right::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="fp-root h-screen overflow-hidden flex">
        {/* ── LEFT PANEL — identical to Login ── */}
        <div className="fp-ai hidden lg:block w-1/2 relative overflow-hidden flex-shrink-0">
          <img
            src={loginImage}
            alt="Auctech HMS"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(219,234,254,0.35) 0%, rgba(255,255,255,0.08) 60%, rgba(14,165,233,0.12) 100%)",
            }}
          />

          {/* Top-right text block */}
          <div className="fp-ar absolute top-0 right-0 p-10 text-right max-w-xs">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 mb-7"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(14,165,233,0.3)",
                borderRadius: 50,
              }}
            >
              <ShieldCheck
                style={{ width: 14, height: 14, color: "#0ea5e9" }}
              />
              <span
                style={{
                  fontSize: ".7rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                }}
              >
                Auctech HMS
              </span>
            </div>

            <h1
              style={{
                fontSize: "2.1rem",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.2,
                marginBottom: "1rem",
                letterSpacing: "-.03em",
              }}
            >
              Account
              <br />
              Recovery
            </h1>

            <p
              style={{
                fontSize: ".875rem",
                color: "#334155",
                lineHeight: 1.75,
                marginBottom: "2.25rem",
              }}
            >
              Don't worry — enter your registered email and we'll get you back
              in securely within minutes.
            </p>

            <div
              style={{
                borderTop: "1.5px solid rgba(14,165,233,0.25)",
                paddingTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "1.1rem",
              }}
            >
              {[
                { value: "10,000+", label: "Patients Managed" },
                { value: "500+", label: "Doctors Onboarded" },
                { value: "99.9%", label: "System Uptime" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`fp-au fp-d${i + 1}`}
                  style={{ textAlign: "right" }}
                >
                  <p
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                      letterSpacing: "-.03em",
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: ".68rem",
                      fontWeight: 700,
                      color: "#0ea5e9",
                      marginTop: 2,
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div
          className="fp-right w-full lg:w-1/2 flex items-center justify-center px-8 py-8"
          style={{ background: "#f8fafc" }}
        >
          <div className="fp-au w-full max-w-md">
            {/* Mobile brand */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 10,
                  padding: "7px 9px",
                }}
              >
                <ShieldCheck
                  style={{ width: 18, height: 18, color: "#0ea5e9" }}
                />
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "#0f172a",
                }}
              >
                Auctech HMS
              </span>
            </div>

            {/* ── Stage 1: Form ── */}
            {!submitted ? (
              <>
                <div className="fp-au fp-d1 mb-8">
                  <h2
                    style={{
                      fontSize: "1.9rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                      letterSpacing: "-.03em",
                    }}
                  >
                    Forgot password?
                  </h2>
                  <p
                    style={{
                      fontSize: ".875rem",
                      color: "#64748b",
                      marginTop: ".4rem",
                    }}
                  >
                    Enter your registered email and we'll send a secure reset
                    link.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.15rem",
                  }}
                >
                  <div className="fp-au fp-d2">
                    <label className="fp-label">Email Address</label>
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
                          fontSize: ".75rem",
                          color: "#ef4444",
                          fontWeight: 500,
                        }}
                      >
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="fp-au fp-d3">
                    <button type="submit" disabled={loading} className="fp-btn">
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
                          {" "}
                          Send Reset Link <ArrowRight size={16} />{" "}
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <button
                  onClick={() => navigate("/login")}
                  className="fp-au fp-d4"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: "1.25rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: ".83rem",
                    color: "#64748b",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    padding: 0,
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#0f172a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#64748b")
                  }
                >
                  <ArrowLeft size={15} /> Back to Sign In
                </button>
              </>
            ) : (
              /* ── Stage 2: Success ── */
              <div className="text-center">
                <div
                  className="fp-pop inline-flex items-center justify-center mb-6"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                  }}
                >
                  <MailCheck
                    style={{ width: 36, height: 36, color: "#0ea5e9" }}
                  />
                </div>

                <h2
                  className="fp-au fp-d1"
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: ".5rem",
                    letterSpacing: "-.03em",
                  }}
                >
                  Check your inbox
                </h2>

                <p
                  className="fp-au fp-d2"
                  style={{
                    fontSize: ".875rem",
                    color: "#64748b",
                    marginBottom: ".3rem",
                  }}
                >
                  We sent a password reset link to
                </p>

                <p
                  className="fp-au fp-d2"
                  style={{
                    fontSize: ".9rem",
                    fontWeight: 700,
                    color: "#0ea5e9",
                    marginBottom: "1.25rem",
                  }}
                >
                  {email}
                </p>

                <p
                  className="fp-au fp-d3"
                  style={{
                    fontSize: ".78rem",
                    color: "#94a3b8",
                    marginBottom: "2rem",
                    lineHeight: 1.6,
                  }}
                >
                  Didn't receive it? Check your spam folder, or wait a minute
                  and try again.
                </p>

                <div className="fp-au fp-d4 flex flex-col gap-3">
                  <button onClick={() => navigate("/login")} className="fp-btn">
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
          </div>
        </div>
      </div>
    </>
  );
}
