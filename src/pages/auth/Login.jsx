import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const PasswordRule = ({ valid, text }) => (
  <div className="flex items-center gap-2 transition-all duration-300">
    {valid ? (
      <CheckCircle
        className="h-3.5 w-3.5 flex-shrink-0"
        style={{ color: "#0ea5e9" }}
      />
    ) : (
      <Circle
        className="h-3.5 w-3.5 flex-shrink-0"
        style={{ color: "#cbd5e1" }}
      />
    )}
    <span
      style={{
        fontSize: "0.8rem",
        transition: "color 0.3s",
        color: valid ? "#0ea5e9" : "#94a3b8",
      }}
    >
      {text}
    </span>
  </div>
);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const validate = () => {
    const e = {};

    if (!email.trim()) e.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      e.email = "Enter a valid email address";

    const passwordRules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (!password) e.password = "Password is required";
    else if (!passwordRules.length)
      e.password = "Password must be at least 8 characters";
    else if (!passwordRules.uppercase)
      e.password = "Add at least one uppercase letter (A–Z)";
    else if (!passwordRules.lowercase)
      e.password = "Add at least one lowercase letter (a–z)";
    else if (!passwordRules.number)
      e.password = "Add at least one number (0–9)";
    else if (!passwordRules.special)
      e.password = "Add at least one special character (!@#$...)";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .login-root * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideR {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .au  { animation: fadeUp 0.6s cubic-bezier(.22,.68,0,1.15) both; }
        .ai  { animation: fadeIn 0.7s ease both; }
        .ar  { animation: slideR 0.65s cubic-bezier(.22,.68,0,1.15) both; }

        .d1 { animation-delay: .06s; }
        .d2 { animation-delay: .13s; }
        .d3 { animation-delay: .20s; }
        .d4 { animation-delay: .27s; }
        .d5 { animation-delay: .34s; }
        .d6 { animation-delay: .41s; }

        .lf-input {
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
        .lf-input::placeholder { color: #94a3b8; }
        .lf-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3.5px rgba(14,165,233,.13);
          background: #fff;
        }
        .lf-input.err { border-color: #f87171; background: #fff5f5; }
        .lf-input.err:focus { box-shadow: 0 0 0 3.5px rgba(248,113,113,.12); }

        .lf-btn {
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
        .lf-btn:hover:not(:disabled) {
          background: #1e3a5f;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(15,23,42,.22);
        }
        .lf-btn:active:not(:disabled) { transform: translateY(0); }
        .lf-btn:disabled { opacity: .6; cursor: not-allowed; }

        .lf-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
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
        .lf-google:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .lf-right {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .lf-right::-webkit-scrollbar { display: none; }

        .lf-label {
          display: block;
          margin-bottom: .35rem;
          font-size: .72rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div className="login-root h-screen overflow-hidden flex">
        {/* ── LEFT PANEL ── */}
        <div className="ai hidden lg:block w-1/2 relative overflow-hidden flex-shrink-0">
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
          <div className="ar absolute top-0 right-0 p-10 text-right max-w-xs">
            {/* Frosted glass brand badge */}
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
              Hospital
              <br />
              Management
              <br />
              System
            </h1>

            <p
              style={{
                fontSize: ".875rem",
                color: "#334155",
                lineHeight: 1.75,
                marginBottom: "2.25rem",
              }}
            >
              Streamline patient care, appointments, pharmacy, billing and
              reporting — all in one unified platform.
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
                  className={`au d${i + 1}`}
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
          className="lf-right w-full lg:w-1/2 flex items-center justify-center px-8 py-8"
          style={{ background: "#f8fafc" }}
        >
          <div className="au w-full max-w-md">
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

            {/* Heading */}
            <div className="au d1 mb-8">
              <h2
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-.03em",
                }}
              >
                Welcome back
              </h2>
              <p
                style={{
                  fontSize: ".875rem",
                  color: "#64748b",
                  marginTop: ".4rem",
                  fontWeight: 400,
                }}
              >
                Sign in to your account to continue
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
              {/* Email */}
              <div className="au d2">
                <label className="lf-label">Email Address</label>
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
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`lf-input ${errors.email ? "err" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p
                    style={{
                      marginTop: ".3rem",
                      fontSize: ".75rem",
                      color: "#ef4444",
                      fontWeight: 500,
                    }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="au d3">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: ".35rem",
                  }}
                >
                  <label className="lf-label" style={{ margin: 0 }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    style={{
                      fontSize: ".78rem",
                      fontWeight: 600,
                      color: "#0ea5e9",
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
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`lf-input ${errors.password ? "err" : ""}`}
                    style={{ paddingRight: "2.8rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 13,
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
                      fontSize: ".75rem",
                      color: "#ef4444",
                      fontWeight: 500,
                    }}
                  >
                    {errors.password}
                  </p>
                )}

                {/* Live password rules — only shown when user starts typing */}
                {password.length > 0 && (
                  <div
                    style={{
                      marginTop: ".7rem",
                      padding: ".875rem 1rem",
                      background: "#fff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: ".4rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: ".65rem",
                        fontWeight: 700,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        marginBottom: ".3rem",
                      }}
                    >
                      Password Requirements
                    </p>
                    <PasswordRule
                      valid={rules.length}
                      text="At least 8 characters"
                    />
                    <PasswordRule
                      valid={rules.uppercase}
                      text="One uppercase letter (A–Z)"
                    />
                    <PasswordRule
                      valid={rules.lowercase}
                      text="One lowercase letter (a–z)"
                    />
                    <PasswordRule
                      valid={rules.number}
                      text="One number (0–9)"
                    />
                    <PasswordRule
                      valid={rules.special}
                      text="One special character (!@#$…)"
                    />
                  </div>
                )}
              </div>

              {/* Remember me */}
              <div className="au d4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 15,
                    height: 15,
                    accentColor: "#0ea5e9",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="remember"
                  style={{
                    fontSize: ".83rem",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <div className="au d5">
                <button type="submit" disabled={loading} className="lf-btn">
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
                      {" "}
                      Sign In <ArrowRight size={16} />{" "}
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="au d6 relative py-0.5">
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ width: "100%", borderTop: "1.5px solid #e2e8f0" }}
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
                      background: "#f8fafc",
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
              <div className="au d6">
                <button type="button" className="lf-google">
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    style={{ width: 18, height: 18 }}
                  />
                  Sign in with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
