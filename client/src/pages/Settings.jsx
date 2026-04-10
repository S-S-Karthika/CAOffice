import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  dash:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  works:    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  clients:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  finance:  "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  add:      "M12 5v14M5 12h14",
  attend:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87",
  cal:      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  reimb:    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  trash:    "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
  key:      "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:   "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22",
  check:    "M20 6L9 17l-5-5",
  close:    "M18 6L6 18M6 6l12 12",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  upload:   "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  bank:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  plus:     "M12 5v14M5 12h14",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AV_COLORS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899"];
function Avatar({ name = "?", size = 38, bg }) {
  const color = bg || AV_COLORS[(String(name).charCodeAt(0) || 0) % AV_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.38, fontWeight: 700 }}>
      {String(name)[0]?.toUpperCase() || "?"}
    </div>
  );
}

function NavItem({ label, iconPath, active, onClick, dot }) {
  return (
    <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "9px 0", border: "none", background: "none", cursor: "pointer", width: "100%", position: "relative", color: active ? "#3b82f6" : "#94a3b8", fontFamily: "'Segoe UI', sans-serif" }}>
      {dot && <span style={{ position: "absolute", top: 8, right: 10, width: 7, height: 7, borderRadius: "50%", background: "#3b82f6" }} />}
      <Icon d={iconPath} size={21} stroke={active ? "#3b82f6" : "#94a3b8"} />
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
      {active && <div style={{ position: "absolute", left: 0, top: "15%", height: "70%", width: 3, borderRadius: "0 3px 3px 0", background: "#3b82f6" }} />}
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Section({ title, subtitle, icon, children, accent = "#3b82f6" }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: 20, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon d={icon} size={18} stroke={accent} sw={2} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

// ─── Form Row helper ──────────────────────────────────────────────────────────
const inp = { width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", color: "#1e293b", background: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" };
const lbl = { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 };

function SaveBtn({ onClick, saving, label = "Save", color = "#0f172a" }) {
  return (
    <button onClick={onClick} disabled={saving} style={{ padding: "11px 24px", borderRadius: 9, border: "none", background: color, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: 7, transition: "opacity 0.15s", opacity: saving ? 0.7 : 1 }}>
      {saving ? "Saving…" : <><Icon d={ICONS.check} size={14} stroke="#fff" sw={2.5} />{label}</>}
    </button>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  const isOk  = msg.startsWith("✅");
  const isErr = msg.startsWith("❌");
  return (
    <div style={{ marginTop: 10, padding: "9px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600,
      background: isOk ? "#d1fae5" : isErr ? "#fee2e2" : "#fef3c7",
      color:      isOk ? "#065f46" : isErr ? "#991b1b" : "#92400e",
      border:     `1px solid ${isOk ? "#6ee7b7" : isErr ? "#fca5a5" : "#fcd34d"}` }}>
      {msg}
    </div>
  );
}

// ─── Add User Modal ───────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSaved }) {
  const [form, setForm]     = useState({ name: "", password: "", role: "Staff" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");

  async function save() {
    if (!form.name.trim())     { setMsg("❌ Name is required");     return; }
    if (!form.password.trim()) { setMsg("❌ Password is required"); return; }
    if (form.password.length < 6) { setMsg("❌ Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
          await axios.post(`${API}/api/register`, form);
          onSaved();
      onClose();
    } catch (err) {
      setMsg(err.response?.data?.error || "❌ Failed to create user");
    } finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "min(420px, calc(100vw - 24px))", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>Add New User</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Create CA or Staff login account</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <Icon d={ICONS.close} size={20} />
          </button>
        </div>

        {/* Role toggle */}
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Role</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["CA", "Staff"].map(r => (
              <button key={r} type="button" onClick={() => setForm(p => ({ ...p, role: r }))} style={{ flex: 1, padding: "10px", borderRadius: 9, border: `2px solid ${form.role === r ? (r === "CA" ? "#f59e0b" : "#3b82f6") : "#e2e8f0"}`, background: form.role === r ? (r === "CA" ? "#fef3c7" : "#eff6ff") : "#fff", color: form.role === r ? (r === "CA" ? "#d97706" : "#2563eb") : "#64748b", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", transition: "all 0.15s" }}>
                {r === "CA" ? "🏅 CA" : "👤 Staff"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Full Name</label>
          <input style={inp} placeholder={form.role === "CA" ? "e.g. SK KavinRaj" : "e.g. Priya"} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 20, position: "relative" }}>
          <label style={lbl}>Password</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...inp, paddingRight: 42 }} type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
              <Icon d={showPw ? ICONS.eyeOff : ICONS.eye} size={16} />
            </button>
          </div>
        </div>

        <Toast msg={msg} />

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: 9, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon d={ICONS.plus} size={15} stroke="#fff" sw={2.5} />
            {saving ? "Creating…" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────
function ResetPasswordModal({ user: targetUser, onClose, onSaved }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  async function save() {
    if (!password.trim())      { setMsg("❌ Enter a new password"); return; }
    if (password.length < 6)   { setMsg("❌ Minimum 6 characters"); return; }
    setSaving(true);
    try {
      await axios.patch(`${API}/api/users/${targetUser.id}/password`, { password });
      onSaved();
      onClose();
    } catch (err) {
      setMsg(err.response?.data?.error || "❌ Failed to update password");
    } finally { setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "min(380px, calc(100vw - 24px))", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>Reset Password</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{targetUser.name} · {targetUser.role}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <Icon d={ICONS.close} size={20} />
          </button>
        </div>
        <div style={{ marginBottom: 18, position: "relative" }}>
          <label style={lbl}>New Password</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...inp, paddingRight: 42 }} type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
              <Icon d={showPw ? ICONS.eyeOff : ICONS.eye} size={16} />
            </button>
          </div>
        </div>
        <Toast msg={msg} />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: 9, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>
            {saving ? "Saving…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN Settings Page
// ═══════════════════════════════════════════════════════════════════════════════
export default function Settings() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("cao_user") || '{"name":"Guest","role":"Staff"}');
  const isCA      = user.role === "CA";

  // ── Settings state ─────────────────────────────────────────────────────────
  const [bank,    setBank]    = useState({ bankName: "", accountNo: "", ifsc: "", upiId: "" });
  const [balance, setBalance] = useState({ openingBalance: "0" });
  const [users,   setUsers]   = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [activeNav, setActiveNav] = useState("dash");
  // ── Saving/msg states ───────────────────────────────────────────────────────
  const [bankSaving,    setBankSaving]    = useState(false);
  const [balanceSaving, setBalanceSaving] = useState(false);
  const [bankMsg,    setBankMsg]    = useState("");
  const [balanceMsg, setBalanceMsg] = useState("");
  const [importSaving, setImportSaving]  = useState(false);

  // ── Modal states ────────────────────────────────────────────────────────────
  const [showAddUser,    setShowAddUser]    = useState(false);
  const [resetPwUser,    setResetPwUser]    = useState(null);   // user obj or null
  const [deletingId,     setDeletingId]     = useState(null);

  // ── Nav ─────────────────────────────────────────────────────────────────────
  const navItems = [
    { key: "dash",     label: "Dash",     icon: ICONS.dash },
    { key: "works",    label: "Works",    icon: ICONS.works },
    { key: "clients",  label: "Clients",  icon: ICONS.clients },
    { key: "finance",  label: "Finance",  icon: ICONS.finance },
    { key: "add",      label: "Add",      icon: ICONS.add },
    { key: "attend",   label: "Attend",   icon: ICONS.attend },
    { key: "cal",      label: "Cal",      icon: ICONS.cal },
    { key: "reimb",    label: "Reimb",    icon: ICONS.reimb },
    { key: "settings", label: "Settings", icon: ICONS.settings },
  ];
  const NAV_ROUTES = {
    dash:     "/dashboard",
    works:    "/works",
    clients:  "/clients",
    finance:  "/finance",
    add:      "/add-client",
    attend:   "/attendance",
    cal:      "/cal",
    reimb:    "/reimbursement",
    settings: "/settings",
  };

  function handleNav(key) {
    const route = NAV_ROUTES[key];
    if (route) navigate(route);
    setActiveNav(key);
  }

  // ── Load settings & users ───────────────────────────────────────────────────
  useEffect(() => {
    // Load settings
    axios.get(`${API}/api/settings`)
      .then(res => {
        const s = res.data || {};
        setBank({ bankName: s.bankName||"", accountNo: s.accountNo||"", ifsc: s.ifsc||"", upiId: s.upiId||"" });
        setBalance({ openingBalance: s.openingBalance||"0" });
      }).catch(() => {});

    // Load users (CA only)
    if (isCA) loadUsers();
  }, []);

  function loadUsers() {
    axios.get(`${API}/api/users/all`)
      .then(res => setUsers(res.data || []))
      .catch(() => {});
  }

  // ── Save bank details ───────────────────────────────────────────────────────
  async function saveBankDetails() {
    setBankSaving(true); setBankMsg("");
    try {
      await axios.post(`${API}/api/settings`, bank);
      setBankMsg("✅ Bank details saved successfully");
      setTimeout(() => setBankMsg(""), 3000);
    } catch { setBankMsg("❌ Failed to save bank details"); }
    finally { setBankSaving(false); }
  }

  // ── Save opening balance ────────────────────────────────────────────────────
  async function saveBalance() {
    setBalanceSaving(true); setBalanceMsg("");
    try {
      await axios.post(`${API}/api/settings`, balance);
      setBalanceMsg("✅ Opening balance saved");
      setTimeout(() => setBalanceMsg(""), 3000);
    } catch { setBalanceMsg("❌ Failed to save"); }
    finally { setBalanceSaving(false); }
  }

  // ── Delete user ─────────────────────────────────────────────────────────────
  async function deleteUser(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/users/${id}`);
      loadUsers();
    } catch { alert("Failed to delete user"); }
    finally { setDeletingId(null); }
  }

  // ── Bulk import ─────────────────────────────────────────────────────────────
  async function handleBulkImport() {
    if (!bulkText.trim()) { alert("Enter at least one client line"); return; }
    setImportSaving(true); setImportResult(null);
    try {
      const res = await axios.post(`${API}/api/bulk-import`, { text: bulkText });
      setImportResult(res.data);
      if (res.data.imported > 0) setBulkText("");
    } catch { setImportResult({ imported: 0, errors: ["Server error"] }); }
    finally { setImportSaving(false); }
  }

  // ── Export CSV ──────────────────────────────────────────────────────────────
  async function exportCSV(type) {
    try {
      const endpoint = type === "works" ? "/works" : "/reimbursements";
      const res = await axios.get(`${API}${endpoint}`);
      const rows = res.data || [];
      if (rows.length === 0) { alert("No data to export"); return; }
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${type}_export_${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { alert("Export failed"); }
  }

  // ── Sign out ────────────────────────────────────────────────────────────────
  function signOut() {
    localStorage.removeItem("cao_user");
    navigate("/");
  }

  // ── Role badge ──────────────────────────────────────────────────────────────
  function RoleBadge({ role }) {
    const isCARole = role === "CA";
    return (
      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: isCARole ? "#fef3c7" : "#dbeafe", color: isCARole ? "#d97706" : "#2563eb", border: `1px solid ${isCARole ? "#fcd34d" : "#93c5fd"}` }}>
        {role}
      </span>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
    <style>{`
  @media (max-width: 768px) {
    .ca-sidebar { display: none !important; }
    .ca-bottom-nav { display: flex !important; }
    .ca-main { padding-bottom: 68px !important; }
    .ca-header-name { display: none !important; }
  }
  @media (max-width: 520px) {
    .ca-header { padding: 0 12px !important; }
    .ca-page-pad { padding: 12px 10px !important; }
    .ca-modal-wide { width: calc(100vw - 24px) !important; max-height: 90vh !important; }
    .ca-row2 { grid-template-columns: 1fr !important; }
    .ca-summary-3 { grid-template-columns: 1fr 1fr !important; }
    .ca-client-drawer { width: 100% !important; }
  }
  .ca-bottom-nav {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #0f172a; height: 60px; z-index: 200;
    border-top: 1px solid #1e3a5f;
  }
  .ca-bnscroll {
    display: flex; width: 100%; height: 100%;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding: 0 2px; align-items: center;
  }
  .ca-bnscroll::-webkit-scrollbar { display: none; }
  .ca-bn-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; padding: 0 10px; border: none; background: none; cursor: pointer;
    color: #94a3b8; font-family: 'Segoe UI', sans-serif; min-width: 48px;
    flex-shrink: 0; position: relative; height: 100%;
  }
  .ca-bn-item.active { color: #3b82f6; }
  .ca-bn-item > span { font-size: 9px; font-weight: 600; white-space: nowrap; }
  .ca-bn-dot { position: absolute; top: 8px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; }
`}</style>
      <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f1f5f9", overflow: "hidden" }}>

      {/* Sidebar */}
      <aside className="ca-sidebar" style={{ width: 72, background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 2, flexShrink: 0, overflowY: "auto" }}>
        {navItems.map(n => (
          <NavItem key={n.key} label={n.label} iconPath={n.icon} active={activeNav === n.key && n.key === "settings"} onClick={() => handleNav(n.key)} />
        ))}
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header className="ca-header" style={{ height: 54, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div><span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>CA </span><span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>Office</span></div>
            <div style={{ background: "#1e3a5f", color: "#60a5fa", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>{user.role}</div>
            <div className="ca-header-name" style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{user.name.toUpperCase()}</div>
          </div>
        </header>

        {/* Page body */}
        <div className="ca-main" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Settings</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>App configuration &amp; preferences</div>

          <div style={{ maxWidth: 760 }}>

            {/* ── PROFILE ─────────────────────────────────────────────────── */}
            <Section title="Profile" subtitle="Your account information" icon={ICONS.user} accent="#3b82f6">
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <Avatar name={user.name} size={52} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#1e293b" }}>{user.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <RoleBadge role={user.role} />
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {isCA ? "Full access — CA administrator" : "Limited access — assigned works only"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={signOut} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </Section>

            {/* ── TEAM MANAGEMENT (CA only) ────────────────────────────────── */}
            {isCA && (
              <Section title="Team Management" subtitle="Add, remove or reset passwords for CA and Staff accounts" icon={ICONS.shield} accent="#8b5cf6">

                {/* Add user button */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{users.length} user{users.length !== 1 ? "s" : ""} in system</div>
                  <button onClick={() => setShowAddUser(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "#8b5cf6", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}>
                    <Icon d={ICONS.plus} size={15} stroke="#fff" sw={2.5} /> Add User
                  </button>
                </div>

                {/* Users table */}
                {users.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#94a3b8", padding: "24px 0", fontSize: 13 }}>No users found</div>
                ) : (
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                    {/* Table header */}
                    <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 90px 130px 90px", background: "#f8fafc", padding: "9px 14px", borderBottom: "1px solid #e2e8f0" }}>
                      {["#", "Name", "Role", "Created", "Actions"].map(h => (
                        <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                      ))}
                    </div>
                    {/* Table rows */}
                    {users.map((u, idx) => {
                      const isSelf    = u.name === user.name;
                      const isDeleting = deletingId === u.id;
                      const createdAt = u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—";
                      return (
                        <div key={u.id} style={{ display: "grid", gridTemplateColumns: "44px 1fr 90px 130px 90px", padding: "11px 14px", borderBottom: idx < users.length - 1 ? "1px solid #f8fafc" : "none", alignItems: "center", background: isSelf ? "#f8fafc" : "#fff", transition: "background 0.1s" }}
                          onMouseEnter={e => { if (!isSelf) e.currentTarget.style.background = "#f8fafc"; }}
                          onMouseLeave={e => { if (!isSelf) e.currentTarget.style.background = "#fff"; }}>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <Avatar name={u.name} size={28} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                                {u.name}
                                {isSelf && <span style={{ marginLeft: 6, fontSize: 10, color: "#3b82f6", fontWeight: 700 }}>You</span>}
                              </div>
                            </div>
                          </div>
                          <div><RoleBadge role={u.role} /></div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{createdAt}</div>
                          <div style={{ display: "flex", gap: 5 }}>
                            {/* Reset password */}
                            <button onClick={() => setResetPwUser(u)} title="Reset password" style={{ padding: "5px 7px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", color: "#7c3aed" }}>
                              <Icon d={ICONS.key} size={13} stroke="#7c3aed" />
                            </button>
                            {/* Delete — cannot delete yourself */}
                            {!isSelf && (
                              <button onClick={() => deleteUser(u.id, u.name)} disabled={isDeleting} title="Delete user" style={{ padding: "5px 7px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fef2f2", cursor: "pointer", display: "flex", color: "#dc2626", opacity: isDeleting ? 0.5 : 1 }}>
                                <Icon d={ICONS.trash} size={13} stroke="#dc2626" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Role permissions legend */}
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { role: "CA", color: "#d97706", bg: "#fef3c7", border: "#fcd34d", perms: ["View all works & clients", "Add / delete works", "Generate invoices", "Mark fees received", "Manage team members", "Export data"] },
                    { role: "Staff", color: "#2563eb", bg: "#eff6ff", border: "#93c5fd", perms: ["View own assigned works", "Update work status", "View own attendance", "Request leave", "Cannot add/delete works", "Cannot see other staff data"] },
                  ].map(({ role, color, bg, border, perms }) => (
                    <div key={role} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8 }}>{role} Permissions</div>
                      {perms.map(p => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "#475569" }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* ── BANK & UPI (CA only) ─────────────────────────────────────── */}
            {isCA && (
              <Section title="Bank & UPI Details" subtitle="Used in invoices and WhatsApp messages" icon={ICONS.bank} accent="#10b981">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={lbl}>Bank Name</label>
                    <input style={inp} placeholder="e.g. State Bank of India" value={bank.bankName} onChange={e => setBank(p => ({ ...p, bankName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>Account No.</label>
                    <input style={{ ...inp, fontFamily: "monospace" }} placeholder="Account number" value={bank.accountNo} onChange={e => setBank(p => ({ ...p, accountNo: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={lbl}>IFSC Code</label>
                    <input style={{ ...inp, fontFamily: "monospace", textTransform: "uppercase" }} placeholder="SBIN0001234" value={bank.ifsc} onChange={e => setBank(p => ({ ...p, ifsc: e.target.value.toUpperCase() }))} />
                  </div>
                  <div>
                    <label style={lbl}>UPI ID</label>
                    <input style={inp} placeholder="yourname@upi" value={bank.upiId} onChange={e => setBank(p => ({ ...p, upiId: e.target.value }))} />
                  </div>
                </div>
                <SaveBtn onClick={saveBankDetails} saving={bankSaving} label="Save Bank Details" color="#10b981" />
                <Toast msg={bankMsg} />
              </Section>
            )}

            {/* ── OPENING BALANCE (CA only) ────────────────────────────────── */}
            {isCA && (
              <Section title="Opening Balance" subtitle="Set the starting cash balance for Finance tracking" icon={ICONS.finance} accent="#f59e0b">
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>Opening Cash Balance (Rs.)</label>
                  <input style={{ ...inp, fontFamily: "monospace", fontSize: 16 }} type="number" placeholder="0" value={balance.openingBalance} onChange={e => setBalance({ openingBalance: e.target.value })} />
                </div>
                <SaveBtn onClick={saveBalance} saving={balanceSaving} label="Save Balance" color="#f59e0b" />
                <Toast msg={balanceMsg} />
              </Section>
            )}

            {/* ── BULK CLIENT IMPORT (CA only) ─────────────────────────────── */}
            {isCA && (
              <Section title="Bulk Client Import" subtitle="One per line: Name, PAN, Mobile, Referred By" icon={ICONS.upload} accent="#3b82f6">
                <div style={{ marginBottom: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 12, color: "#64748b", fontFamily: "monospace", border: "1px dashed #e2e8f0" }}>
                  Format example: Mohan Traders, ABCPM1234P, 9876543210, CA SK KavinRaj
                </div>
                <textarea
                  style={{ ...inp, resize: "vertical", minHeight: 100, fontFamily: "monospace", fontSize: 12, marginBottom: 14 }}
                  placeholder={"Ramesh Traders, AABCR1234F, 9876543210, CA SK KavinRaj\nVelu Textiles, AADFV5678K, 9123456789\nKumar & Co, AAHCK9012P, 9012345678, Ravi"}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                />
                <SaveBtn onClick={handleBulkImport} saving={importSaving} label="Import Clients" color="#3b82f6" />
                {importResult && (
                  <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: importResult.imported > 0 ? "#d1fae5" : "#fee2e2", border: `1px solid ${importResult.imported > 0 ? "#6ee7b7" : "#fca5a5"}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: importResult.imported > 0 ? "#065f46" : "#991b1b" }}>
                      {importResult.imported > 0 ? `✅ ${importResult.imported} client(s) imported successfully` : "❌ Import failed"}
                    </div>
                    {importResult.errors?.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 11, color: "#991b1b" }}>
                        {importResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </Section>
            )}

            {/* ── DATA EXPORT (CA only) ────────────────────────────────────── */}
            {isCA && (
              <Section title="Data Export" subtitle="Download your data as CSV for spreadsheet use" icon={ICONS.download} accent="#64748b">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button onClick={() => exportCSV("works")} style={{ padding: "14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#1e293b", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#93c5fd"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                    <Icon d={ICONS.download} size={16} stroke="#3b82f6" /> Export Works CSV
                  </button>
                  <button onClick={() => exportCSV("finance")} style={{ padding: "14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#1e293b", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#6ee7b7"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                    <Icon d={ICONS.download} size={16} stroke="#10b981" /> Export Finance CSV
                  </button>
                </div>
              </Section>
            )}

            {/* ── App info ─────────────────────────────────────────────────── */}
            <div style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8", fontSize: 12 }}>
              CA Office v4 · Developed by Karthika SS 
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddUser  && <AddUserModal onClose={() => setShowAddUser(false)} onSaved={loadUsers} />}
      {resetPwUser  && <ResetPasswordModal user={resetPwUser} onClose={() => setResetPwUser(null)} onSaved={loadUsers} />}
      {/* Mobile Bottom Nav */}
      <nav className="ca-bottom-nav">
        <div className="ca-bnscroll">
          {navItems.map(n => (
            <button key={n.key} className={`ca-bn-item ${activeNav === n.key ? "active" : ""}`} onClick={() => handleNav(n.key)}>
              {n.dot && <span className="ca-bn-dot" />}
              <Icon d={n.icon} size={20} stroke={activeNav === n.key ? "#3b82f6" : "#94a3b8"} />
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
    </>
  );
}
