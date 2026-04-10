import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ca");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const loginName = activeTab === "ca" ? name : staffId;
    const loginPass = activeTab === "ca" ? password : staffPassword;
    const role = activeTab === "ca" ? "CA" : "Staff";
    if (!loginName.trim() || !loginPass.trim()) {
      setError("Please enter your name and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/login`, { name: loginName, password: loginPass, role });
      localStorage.setItem("cao_user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        @media (max-width: 480px) {
          .login-container { padding: 0 12px !important; gap: 16px !important; }
          .login-logo { font-size: 34px !important; }
          .login-card { padding: 20px 16px !important; }
          .login-tab { font-size: 14px !important; }
          .login-btn { font-size: 15px !important; padding: 13px !important; }
        }
      `}</style>
      <div style={styles.bgOverlay} />
      <div style={styles.container} className="login-container">
        <div style={styles.header}>
          <h1 style={styles.logo} className="login-logo">
            <span style={styles.logoCA}>CA </span>
            <span style={styles.logoOffice}>Office</span>
          </h1>
          <p style={styles.subtitle}>Work Tracker · Tamil Nadu</p>
          <p style={styles.developer}>DEVELOPED BY Karthika SS</p>
        </div>
        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tab, ...(activeTab === "ca" ? styles.tabActive : styles.tabInactive) }}
            className="login-tab"
            onClick={() => { setActiveTab("ca"); setError(""); }}
          >CA Login</button>
          <button
            style={{ ...styles.tab, ...(activeTab === "staff" ? styles.tabActive : styles.tabInactive) }}
            className="login-tab"
            onClick={() => { setActiveTab("staff"); setError(""); }}
          >Staff Login</button>
        </div>
        <div style={styles.card} className="login-card">
          {activeTab === "ca" ? (
            <>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>CA NAME</label>
                <input style={styles.input} type="text" placeholder="e.g. SK KavinRaj"
                  value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>PASSWORD</label>
                <input style={styles.input} type="password" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)} />
              </div>
            </>
          ) : (
            <>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>STAFF NAME</label>
                <input style={styles.input} type="text" placeholder="Enter your name"
                  value={staffId} onChange={(e) => setStaffId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>PASSWORD</label>
                <input style={styles.input} type="password" placeholder="Enter your password"
                  value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)} />
              </div>
            </>
          )}
          {error && <p style={styles.error}>{error}</p>}
          <button style={{ ...styles.signInBtn, opacity: loading ? 0.7 : 1 }} className="login-btn" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : `Sign In as ${activeTab === "ca" ? "CA" : "Staff"}`}
          </button>
          <p style={styles.hint}>
            {activeTab === "ca" ? "Contact the admin CA if you forgot your password." : "Contact your CA admin if you forgot your password."}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", background: "linear-gradient(135deg, #0d1b2a 0%, #1a2a3a 50%, #0d1b2a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" },
  bgOverlay: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" },
  container: { width: "100%", maxWidth: "480px", padding: "0 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", zIndex: 1 },
  header: { textAlign: "center" },
  logo: { fontSize: "42px", fontWeight: "700", margin: "0 0 4px 0", letterSpacing: "1px" },
  logoCA: { color: "#ffffff" },
  logoOffice: { color: "#4da8da" },
  subtitle: { color: "#a0b4c8", fontSize: "14px", margin: "0 0 4px 0" },
  developer: { color: "#4da8da", fontSize: "11px", fontWeight: "600", letterSpacing: "1.5px", margin: 0 },
  tabContainer: { display: "flex", background: "rgba(255,255,255,0.07)", borderRadius: "10px", padding: "4px", width: "100%" },
  tab: { flex: 1, padding: "10px 0", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" },
  tabActive: { background: "#ffffff", color: "#0d1b2a" },
  tabInactive: { background: "transparent", color: "#a0b4c8" },
  card: { width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: "16px", padding: "28px 24px", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "#c0d0e0", fontSize: "11px", fontWeight: "600", letterSpacing: "1px" },
  input: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "12px 14px", color: "#e0eaf4", fontSize: "16px", outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.2s" },
  signInBtn: { width: "100%", padding: "14px", background: "linear-gradient(90deg, #4da8da, #2e86c1)", border: "none", borderRadius: "8px", color: "#ffffff", fontSize: "16px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px", marginTop: "4px" },
  hint: { color: "#7090a0", fontSize: "12px", textAlign: "center", margin: 0, lineHeight: "1.6" },
  error: { color: "#ff6b6b", fontSize: "13px", textAlign: "center", margin: 0 },
};
