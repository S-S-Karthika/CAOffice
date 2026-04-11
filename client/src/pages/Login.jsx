import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ─────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }

  body, #root {
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif !important;
    background: #07090F !important;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  /* ── Splash screen ── */
  .fd-splash {
    position: fixed; inset: 0; z-index: 999;
    background: #07090F;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 0;
  }
  .fd-splash.exit {
    animation: splashExit 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  @keyframes splashExit {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.08); pointer-events: none; }
  }

  /* rings behind the logo */
  .fd-rings {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .fd-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(99,102,241,0.12);
    animation: ringPulse 3s ease-in-out infinite;
  }
  .fd-ring:nth-child(1) { width: 140px; height: 140px; animation-delay: 0s; }
  .fd-ring:nth-child(2) { width: 220px; height: 220px; animation-delay: 0.4s; border-color: rgba(99,102,241,0.08); }
  .fd-ring:nth-child(3) { width: 320px; height: 320px; animation-delay: 0.8s; border-color: rgba(99,102,241,0.05); }
  .fd-ring:nth-child(4) { width: 440px; height: 440px; animation-delay: 1.2s; border-color: rgba(99,102,241,0.03); }
  @keyframes ringPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.06); opacity: 0.6; }
  }

  /* logo icon box */
  .fd-splash-icon {
    width: 80px; height: 80px; border-radius: 22px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
    animation: iconPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
    box-shadow: 0 0 40px rgba(99,102,241,0.35);
  }
  @keyframes iconPop {
    0%   { opacity: 0; transform: scale(0.4) rotate(-10deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  /* app name text on splash */
  .fd-splash-name {
    margin-top: 20px;
    font-size: 34px; font-weight: 800; letter-spacing: -1px;
    color: #fff; position: relative; z-index: 2;
    animation: fadeUp 0.5s ease 0.7s both;
  }
  .fd-splash-name span { color: #818CF8; }

  .fd-splash-tagline {
    margin-top: 6px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.35);
    letter-spacing: 2px; text-transform: uppercase;
    animation: fadeUp 0.5s ease 0.9s both;
    position: relative; z-index: 2;
  }

  /* loading bar */
  .fd-progress-wrap {
    position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%);
    width: 120px; height: 2px; background: rgba(255,255,255,0.07);
    border-radius: 2px; overflow: hidden;
    animation: fadeUp 0.4s ease 1s both;
  }
  .fd-progress-bar {
    height: 100%; border-radius: 2px;
    background: linear-gradient(90deg, #6366F1, #A78BFA);
    animation: progressFill 1.8s cubic-bezier(0.4,0,0.2,1) 1s forwards;
    width: 0%;
  }
  @keyframes progressFill { to { width: 100%; } }

  .fd-progress-label {
    position: absolute; bottom: 44px; left: 50%; transform: translateX(-50%);
    font-size: 11px; color: rgba(255,255,255,0.2);
    font-weight: 500; letter-spacing: 1px; white-space: nowrap;
    animation: fadeUp 0.4s ease 1s both;
  }

  /* ── Login page ── */
  .fd-login {
    position: fixed; inset: 0; z-index: 100;
    background: #07090F;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 0 24px;
    overflow-y: auto;
  }
  .fd-login.entering {
    animation: loginEnter 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
  }
  @keyframes loginEnter {
    0%   { opacity: 0; transform: translateY(32px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* ambient blobs */
  .fd-blob {
    position: fixed; border-radius: 50%;
    filter: blur(80px); pointer-events: none; z-index: 0;
  }
  .fd-blob-1 {
    width: 300px; height: 300px;
    background: rgba(99,102,241,0.12);
    top: -60px; right: -60px;
    animation: blobDrift 8s ease-in-out infinite alternate;
  }
  .fd-blob-2 {
    width: 250px; height: 250px;
    background: rgba(139,92,246,0.08);
    bottom: -40px; left: -40px;
    animation: blobDrift 10s ease-in-out infinite alternate-reverse;
  }
  @keyframes blobDrift {
    0%   { transform: translate(0,0) scale(1); }
    100% { transform: translate(20px,20px) scale(1.1); }
  }

  /* dots grid pattern */
  .fd-dots {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* login inner container */
  .fd-inner {
    width: 100%; max-width: 400px;
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    gap: 0;
  }

  /* logo mark on login page */
  .fd-mark {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 24px rgba(99,102,241,0.3);
    margin-bottom: 14px;
    flex-shrink: 0;
  }

  .fd-login-title {
    font-size: 28px; font-weight: 800; letter-spacing: -0.5px;
    color: #fff; text-align: center; line-height: 1.1;
  }
  .fd-login-title span { color: #818CF8; }

  .fd-login-sub {
    font-size: 13px; color: rgba(255,255,255,0.3);
    text-align: center; margin-top: 6px; font-weight: 400;
    letter-spacing: 0.3px;
  }

  /* role pill selector */
  .fd-roles {
    display: flex; gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; padding: 5px;
    width: 100%; margin-top: 28px;
  }
  .fd-role-btn {
    flex: 1; padding: 10px 0;
    border: none; border-radius: 10px;
    font-family: inherit; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.2px;
  }
  .fd-role-btn.active {
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    color: #fff;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  }
  .fd-role-btn.inactive {
    background: transparent;
    color: rgba(255,255,255,0.3);
  }
  .fd-role-btn.inactive:active { background: rgba(255,255,255,0.04); }

  /* card */
  .fd-card {
    width: 100%; margin-top: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 22px;
    padding: 24px 22px 22px;
    display: flex; flex-direction: column; gap: 14px;
    backdrop-filter: blur(20px);
  }

  /* field */
  .fd-field { display: flex; flex-direction: column; gap: 7px; }
  .fd-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.8px;
    color: rgba(255,255,255,0.35); text-transform: uppercase;
  }
  .fd-input-wrap { position: relative; }
  .fd-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 13px;
    padding: 13px 16px 13px 44px;
    color: #fff; font-family: inherit;
    font-size: 15px; font-weight: 500;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    -webkit-appearance: none;
  }
  .fd-input::placeholder { color: rgba(255,255,255,0.18); font-weight: 400; }
  .fd-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.06);
  }
  .fd-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.2); pointer-events: none;
    transition: color 0.2s;
    display: flex; align-items: center;
  }
  .fd-input:focus ~ .fd-input-icon,
  .fd-input-wrap:focus-within .fd-input-icon { color: #818CF8; }

  /* eye toggle for password */
  .fd-eye {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.2); padding: 0;
    display: flex; align-items: center;
    transition: color 0.2s;
  }
  .fd-eye:hover { color: rgba(255,255,255,0.5); }

  /* error */
  .fd-error {
    display: flex; align-items: center; gap: 8px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px; padding: 10px 13px;
    font-size: 13px; color: #FCA5A5; font-weight: 500;
    animation: shake 0.35s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    60%      { transform: translateX(6px); }
    80%      { transform: translateX(-3px); }
  }

  /* sign-in button */
  .fd-btn {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, #6366F1, #8B5CF6);
    border: none; border-radius: 14px;
    color: #fff; font-family: inherit;
    font-size: 15px; font-weight: 800;
    cursor: pointer; letter-spacing: 0.3px;
    transition: opacity 0.15s, transform 0.1s;
    position: relative; overflow: hidden;
  }
  .fd-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    border-radius: inherit;
  }
  .fd-btn:active { transform: scale(0.98); opacity: 0.9; }
  .fd-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .fd-btn.loading { pointer-events: none; }

  /* spinner inside button */
  .fd-spinner {
    display: inline-block; width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fd-hint {
    font-size: 12px; color: rgba(255,255,255,0.18);
    text-align: center; line-height: 1.6; font-weight: 400;
  }

  /* developer tag */
  .fd-dev {
    margin-top: 20px;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    color: rgba(255,255,255,0.12); text-transform: uppercase;
    text-align: center;
  }
  .fd-dev span { color: rgba(129,140,248,0.4); }

  /* field animation */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fd-field:nth-child(1) { animation: fadeUp 0.4s ease 0.1s both; }
  .fd-field:nth-child(2) { animation: fadeUp 0.4s ease 0.2s both; }
`;

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

/* Logo mark SVG */
const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="3" y="8" width="18" height="14" rx="3" fill="rgba(255,255,255,0.9)"/>
    <rect x="7" y="4" width="18" height="14" rx="3" fill="rgba(255,255,255,0.5)"/>
    <rect x="11" y="12" width="14" height="2" rx="1" fill="rgba(99,102,241,0.8)"/>
    <rect x="11" y="16" width="10" height="2" rx="1" fill="rgba(99,102,241,0.5)"/>
    <circle cx="24" cy="22" r="6" fill="#6366F1"/>
    <path d="M21 22l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─────────────────────────────────────────
   SPLASH SCREEN
───────────────────────────────────────── */
function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Progress bar takes 1.8s, then we wait 0.3s, then exit
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 700);
    }, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`fd-splash ${exiting ? "exit" : ""}`}>
      <div className="fd-rings">
        <div className="fd-ring" />
        <div className="fd-ring" />
        <div className="fd-ring" />
        <div className="fd-ring" />
      </div>

      <div className="fd-splash-icon">
        <LogoMark size={40} />
      </div>

      <div className="fd-splash-name">
        Fin<span>Desk</span>
      </div>
      <div className="fd-splash-tagline">Work Tracker · Tamil Nadu</div>

      <div className="fd-progress-wrap">
        <div className="fd-progress-bar" />
      </div>
      <div className="fd-progress-label">Initialising…</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   INPUT FIELD
───────────────────────────────────────── */
function Field({ label, type = "text", placeholder, value, onChange, onKeyDown, icon, autoFocus }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="fd-field">
      <div className="fd-label">{label}</div>
      <div className="fd-input-wrap">
        <input
          autoFocus={autoFocus}
          className="fd-input"
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoComplete={isPassword ? "current-password" : "name"}
          spellCheck={false}
        />
        <div className="fd-input-icon">{icon}</div>
        {isPassword && (
          <button className="fd-eye" type="button" onClick={() => setShow(s => !s)}>
            <EyeIcon open={show} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────── */
function LoginForm() {
  const navigate     = useNavigate();
  const [tab, setTab]         = useState("ca");
  const [name, setName]       = useState("");
  const [pass, setPass]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 800);
    return () => clearTimeout(t);
  }, []);

  function switchTab(t) { setTab(t); setError(""); setName(""); setPass(""); }

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError("");
    if (!name.trim() || !pass.trim()) {
      setError("Please enter your name and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/login`, {
        name: name.trim(),
        password: pass,
        role: tab === "ca" ? "CA" : "Staff",
      });
      localStorage.setItem("cao_user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const onKey = e => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className={`fd-login ${entering ? "entering" : ""}`}>
      {/* ambient */}
      <div className="fd-blob fd-blob-1" />
      <div className="fd-blob fd-blob-2" />
      <div className="fd-dots" />

      <div className="fd-inner">
        {/* Logo */}
        <div className="fd-mark">
          <LogoMark size={32} />
        </div>

        <div className="fd-login-title">
          Fin<span>Desk</span>
        </div>
        <div className="fd-login-sub">Sign in to your workspace</div>

        {/* Role toggle */}
        <div className="fd-roles">
          <button
            className={`fd-role-btn ${tab === "ca" ? "active" : "inactive"}`}
            onClick={() => switchTab("ca")}
          >
            CA
          </button>
          <button
            className={`fd-role-btn ${tab === "staff" ? "active" : "inactive"}`}
            onClick={() => switchTab("staff")}
          >
            Staff
          </button>
        </div>

        {/* Card */}
        <div className="fd-card">
          <Field
            label={tab === "ca" ? "CA Name" : "Staff Name"}
            type="text"
            placeholder={tab === "ca" ? "e.g. SK KavinRaj" : "Enter your name"}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={onKey}
            icon={<PersonIcon />}
            autoFocus
          />
          <Field
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={onKey}
            icon={<LockIcon />}
          />

          {error && (
            <div className="fd-error" key={error}>
              <AlertIcon />
              {error}
            </div>
          )}

          <button
            className={`fd-btn ${loading ? "loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading && <span className="fd-spinner" />}
            {loading ? "Signing in…" : `Sign in as ${tab === "ca" ? "CA" : "Staff"}`}
          </button>

          <div className="fd-hint">
            {tab === "ca"
              ? "Contact the admin if you forgot your password."
              : "Contact your CA admin if you forgot your password."}
          </div>
        </div>

        <div className="fd-dev">
          Developed by <span>Karthika SS</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────── */
export default function Login() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      {splashDone && <LoginForm />}
    </>
  );
}
