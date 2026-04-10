import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate ,useLocation } from "react-router-dom";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  :root {
    --navy: #0f2744; --navy2: #1a3f6f; --navy3: #2e5f9a;
    --blue: #3b82f6; --blue-l: #eff6ff;
    --green: #166534; --green2: #16a34a; --green-l: #dcfce7;
    --red: #991b1b; --red2: #dc2626; --red-l: #fee2e2;
    --amber: #d97706; --amber-l: #fef3c7;
    --purple: #7c3aed; --purple-l: #ede9fe;
    --gray-l: #f8fafc; --border: #e2e8f0;
    --text: #0f172a; --text2: #334155; --text3: #64748b;
    --white: #ffffff; --radius: 14px; --shadow: 0 2px 16px rgba(15,39,68,0.08);
    --font: 'Sora', sans-serif; --mono: 'JetBrains Mono', monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .att-body { font-family: var(--font); background: var(--gray-l); min-height: 100vh; color: var(--text); }
  .att-topbar { background: var(--navy); height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(0,0,0,0.25); }
  .att-logo { font-size: 16px; font-weight: 700; }
  .att-logo span { color: #7ab8f5; }
  .att-role-pill { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 99px; background: #c9933a22; color: #f0c060; border: 1px solid #c9933a44; }
  .att-ist-badge { font-family: var(--mono); font-size: 11px; color: #94a3b8; background: #1e293b; padding: 4px 10px; border-radius: 6px; }
  .att-tabs { display: flex; background: var(--white); border-bottom: 2px solid var(--border); padding: 0 20px; }
  .att-tab { padding: 13px 18px; font-size: 13px; font-weight: 600; border: none; background: none; cursor: pointer; color: var(--text3); font-family: var(--font); border-bottom: 3px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
  .att-tab.active { color: var(--navy2); border-bottom-color: var(--navy2); }
  .att-page { padding: 20px; max-width: 900px; margin: 0 auto; }
  .att-card { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; margin-bottom: 16px; }
  .att-clock { text-align: center; padding: 8px 0 16px; }
  .att-clock-time { font-family: var(--mono); font-size: 52px; font-weight: 600; color: var(--navy); letter-spacing: 2px; line-height: 1; }
  .att-clock-date { font-size: 13px; color: var(--text3); margin-top: 6px; }
  .att-clock-ist { font-size: 11px; color: var(--blue); font-weight: 600; background: var(--blue-l); padding: 2px 10px; border-radius: 20px; display: inline-block; margin-top: 4px; }
  .att-check-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .att-btn-checkin { padding: 14px; border-radius: 10px; border: none; background: var(--green2); color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; }
  .att-btn-checkin:hover { background: var(--green); }
  .att-btn-checkin:disabled { background: #86efac; cursor: not-allowed; }
  .att-btn-checkout { padding: 14px; border-radius: 10px; border: none; background: var(--red2); color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--font); display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; }
  .att-btn-checkout:hover { background: var(--red); }
  .att-btn-checkout:disabled { background: #fca5a5; cursor: not-allowed; }
  .att-sessions-title { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin: 16px 0 8px; }
  .att-session-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--gray-l); border-radius: 8px; margin-bottom: 6px; font-size: 13px; }
  .att-session-num { font-weight: 700; color: var(--navy2); min-width: 66px; }
  .att-session-times { color: var(--text2); font-family: var(--mono); font-size: 12px; }
  .att-session-dur { margin-left: auto; font-size: 11px; font-weight: 700; color: var(--green2); background: var(--green-l); padding: 2px 8px; border-radius: 10px; }
  .att-total-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--navy); border-radius: 8px; margin-top: 8px; }
  .att-total-label { font-size: 12px; color: #94a3b8; font-weight: 600; }
  .att-total-val { font-family: var(--mono); font-size: 15px; color: white; font-weight: 700; }
  .att-section-title { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }
  .att-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .att-form-lbl { font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 6px; }
  .att-form-inp, .att-form-sel { width: 100%; padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 9px; font-family: var(--font); font-size: 13px; color: var(--text); background: white; outline: none; transition: border-color 0.2s; -webkit-appearance: none; appearance: none; }
  .att-form-inp:focus, .att-form-sel:focus { border-color: var(--navy2); box-shadow: 0 0 0 3px rgba(42,95,154,0.1); }
  .att-submit-btn { width: 100%; padding: 12px; border-radius: 9px; border: none; background: var(--navy); color: white; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: all 0.15s; margin-top: 4px; }
  .att-submit-btn:hover { background: var(--navy2); }
  .att-hist-table { width: 100%; border-collapse: collapse; }
  .att-hist-table th { padding: 9px 14px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text3); background: var(--gray-l); border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.06em; }
  .att-hist-table td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #f8fafc; color: var(--text2); }
  .att-hist-table tr:hover td { background: #f0f9ff; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 10px; }
  .badge-present  { background: var(--green-l); color: var(--green); }
  .badge-absent   { background: var(--red-l);   color: var(--red); }
  .badge-leave    { background: var(--amber-l);  color: var(--amber); }
  .badge-halfday  { background: var(--purple-l); color: var(--purple); }
  .att-summary-table { width: 100%; border-collapse: collapse; }
  .att-summary-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #e2e8f0; background: var(--navy); border-bottom: 2px solid var(--navy2); white-space: nowrap; }
  .att-summary-table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  .att-summary-table tr:nth-child(even) td { background: #f8fafc; }
  .att-export-btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; background: var(--green2); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: var(--font); transition: all 0.15s; }
  .att-month-sel { padding: 8px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-family: var(--font); font-size: 13px; color: var(--text); background: white; outline: none; cursor: pointer; }
  .att-salary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
  .att-salary-card { border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; background: white; }
  .att-salary-name { font-weight: 700; font-size: 13px; color: var(--navy); margin-bottom: 8px; }
  .att-salary-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: var(--text3); }
  .att-salary-row span:last-child { font-weight: 700; color: var(--text); }
  .att-salary-total { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: var(--navy); }
  
  @media (max-width: 600px) {
    .att-check-row { grid-template-columns: 1fr; }
    .att-form-row { grid-template-columns: 1fr; }
    .att-clock-time { font-size: 36px !important; }
    .att-salary-grid { grid-template-columns: 1fr !important; }
    .att-page { padding: 12px !important; }
    .att-tabs { padding: 0 10px !important; }
    .att-tab { padding: 10px 10px !important; font-size: 12px !important; }
    .att-topbar { padding: 0 12px !important; }
    .att-ist-badge { display: none; }
    .att-topbar-name { font-size: 12px !important; }
    .att-summary-table th, .att-summary-table td { padding: 8px 8px !important; font-size: 11px !important; }
  }
  @media (max-width: 400px) {
    .att-clock-time { font-size: 28px !important; }
    .att-tab { padding: 9px 8px !important; font-size: 11px !important; }
  }

`;

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getIST() { const now = new Date(); const utc = now.getTime() + now.getTimezoneOffset() * 60000; return new Date(utc + 5.5 * 3600000); }
function fmtTime(d) { return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`; }
function fmtTimeShort(d) { return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }
function fmtDate(d) { return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function fmtDateKey(d) { return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`; }
function diffMins(start, end) { return Math.max(0, Math.round((end - start) / 60000)); }
function minsToHM(m) { return `${Math.floor(m/60)}h ${m%60}m`; }

function Avatar({ name = "?", size = 30 }) {
  const COLS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899"];
  const bg = COLS[(String(name).charCodeAt(0)||0) % COLS.length];
  return <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size*0.4, fontWeight: 700 }}>{String(name)[0]?.toUpperCase()}</div>;
}

export default function Attendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("cao_user") || '{"name":"Guest","role":"Staff"}');
  const isAdmin = currentUser.role === "CA";

  const [tab, setTab] = useState("my");
  const [ist, setIst] = useState(getIST());
  const [sessions, setSessions] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "Full Day", date: fmtDateKey(getIST()), reason: "" });
  const [leaveMsg, setLeaveMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [histMonth, setHistMonth] = useState(`${MONTHS[getIST().getMonth()]} ${getIST().getFullYear()}`);
  const [allStaff, setAllStaff] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [adminMonth, setAdminMonth] = useState(`${MONTHS[getIST().getMonth()]} ${getIST().getFullYear()}`);
  const [salarySettings, setSalarySettings] = useState({});
  
  useEffect(() => { const t = setInterval(() => setIst(getIST()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { 
  loadTodaySessions(); 
  loadHistory(); 
  if (isAdmin) loadAdminData(); 
}, [location]);

  async function loadTodaySessions() {
    try {
      const res = await axios.get(`${API}/attendance/today`, { params: { name: currentUser.name, date: fmtDateKey(getIST()) } });
      const rows = res.data || [];
      const parsed = rows.map(r => ({ checkIn: r.checkIn ? new Date(r.checkIn) : null, checkOut: r.checkOut ? new Date(r.checkOut) : null }));
      setSessions(parsed);
      if (parsed.length > 0 && !parsed[parsed.length - 1].checkOut) setCheckedIn(true);
    } catch { /* no sessions */ }
  }

  async function loadHistory() {
    try {
      const res = await axios.get(`${API}/attendance/history`, { params: { name: currentUser.name } });
      setHistory(res.data || []);
    } catch { setHistory([]); }
  }

  async function loadAdminData() {
    try {
      const [usersRes, attRes] = await Promise.all([
        axios.get(`${API}/api/users`),
        axios.get(`${API}/attendance/all`),
      ]);
      setAllStaff(usersRes.data || []);
      setAllAttendance(attRes.data || []);
    } catch { setAllStaff([]); }
  }

  async function handleCheckIn() {
    const now = getIST();
    const newSession = { checkIn: now, checkOut: null };
    const updated = [...sessions, newSession];
    setSessions(updated); setCheckedIn(true);
    try {
      await axios.post(`${API}/attendance/checkin`, { name: currentUser.name, role: currentUser.role, date: fmtDateKey(now), checkIn: now.toISOString(), session: updated.length });
    } catch (e) { console.error("Check-in save failed", e); }
  }

  async function handleCheckOut() {
    const now = getIST();
    const updated = sessions.map((s, i) => i === sessions.length - 1 && !s.checkOut ? { ...s, checkOut: now } : s);
    setSessions(updated); setCheckedIn(false);
    const totalMins = updated.reduce((sum, s) => s.checkOut ? sum + diffMins(s.checkIn, s.checkOut) : sum, 0);
    try {
      await axios.post(`${API}/attendance/checkout`, { name: currentUser.name, role: currentUser.role, date: fmtDateKey(now), checkOut: now.toISOString(), session: updated.length, totalMins });
    } catch (e) { console.error("Check-out save failed", e); }
  }

  async function handleLeaveSubmit() {
    if (!leaveForm.reason.trim()) { setLeaveMsg("Please enter a reason."); return; }
    try {
      await axios.post(`${API}/attendance/leave`, { name: currentUser.name, role: currentUser.role, date: leaveForm.date, leaveType: leaveForm.type, reason: leaveForm.reason });
      setLeaveMsg("✅ Leave request submitted successfully.");
      setLeaveForm(p => ({ ...p, reason: "" }));
      loadHistory();
      setTimeout(() => setLeaveMsg(""), 3000);
    } catch { setLeaveMsg("❌ Failed to submit leave. Try again."); }
  }

  const totalMinsToday = sessions.reduce((sum, s) => {
    const out = s.checkOut || getIST();
    return s.checkIn ? sum + diffMins(s.checkIn, out) : sum;
  }, 0);

  const filteredHistory = history.filter(h => {
    if (!h.date) return false;
    const [d, m, y] = h.date.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}` === histMonth;
  });

  function buildAdminSummary() {
    return allStaff.map(staff => {
      const rows = allAttendance.filter(r => r.name === staff.name && r.month === adminMonth);
      const presentDays  = rows.filter(r => r.status === "Present").length;
      const fullLeaves   = rows.filter(r => r.leaveType === "Full Day").length;
      const halfLeaves   = rows.filter(r => r.leaveType === "Half Day (AM)" || r.leaveType === "Half Day (PM)").length;
      const permissions  = rows.filter(r => r.leaveType === "Permission").length;
      const absentDays   = rows.filter(r => r.status === "Absent").length;
      const perDay = salarySettings[staff.name]?.perDay || 0;
      const deductDays = fullLeaves + halfLeaves * 0.5;
      const netDays = Math.max(0, presentDays - deductDays);
      const salary = Math.round(perDay * netDays);
      return { ...staff, presentDays, fullLeaves, halfLeaves, permissions, absentDays, deductDays, netDays, salary, perDay };
    });
  }

  function exportCSV(type) {
    let rows, filename;
    if (type === "my") {
      rows = [["Date","Status","Sessions","Total Hours","Leave Type","Reason"],
        ...filteredHistory.map(h => [h.date||"", h.status||"", (h.sessions||[]).map(s=>`${s.checkIn||""}→${s.checkOut||""}`).join("|"), h.totalMins ? minsToHM(h.totalMins) : "—", h.leaveType||"", h.reason||""])];
      filename = `attendance_${currentUser.name}_${histMonth.replace(" ","_")}.csv`;
    } else {
      const summary = buildAdminSummary();
      rows = [["Name","Role","Present Days","Full Leaves","Half Leaves","Permissions","Absent","Per Day (₹)","Net Payable Days","Salary (₹)"],
        ...summary.map(s => [s.name, s.role, s.presentDays, s.fullLeaves, s.halfLeaves, s.permissions, s.absentDays, s.perDay, s.netDays, s.salary])];
      filename = `attendance_summary_${adminMonth.replace(" ","_")}.csv`;
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }

  const monthOptions = [];
  const now2 = getIST();
  for (let i = 0; i < 12; i++) { const d = new Date(now2.getFullYear(), now2.getMonth() - i, 1); monthOptions.push(`${MONTHS[d.getMonth()]} ${d.getFullYear()}`); }

  const adminSummary = buildAdminSummary();

  return (
    <>
      <style>{S}</style>
      <div className="att-body">
        <div className="att-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#7ab8f5", cursor: "pointer", fontSize: 18, display: "flex" }}>←</button>
            <div className="att-logo">CA <span>Office</span></div>
            <span className="att-role-pill">{currentUser.role}</span>
            <span className="att-topbar-name" style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{currentUser.name}</span>
          </div>
          <div className="att-ist-badge">IST {fmtTime(ist)}</div>
        </div>

        <div className="att-tabs">
          <button className={`att-tab ${tab === "my" ? "active" : ""}`} onClick={() => setTab("my")}>My Attendance</button>
          {isAdmin && <button className={`att-tab ${tab === "admin" ? "active" : ""}`} onClick={() => setTab("admin")}>All Staff Summary</button>}
          {isAdmin && <button className={`att-tab ${tab === "salary" ? "active" : ""}`} onClick={() => setTab("salary")}>Salary Calculator</button>}
        </div>

        {tab === "my" && (
          <div className="att-page">
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Attendance</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>Today's attendance — IST</div>

            <div className="att-card">
              <div className="att-clock">
                <div className="att-clock-time">{fmtTime(ist)}</div>
                <div className="att-clock-date">{fmtDate(ist)}</div>
                <div className="att-clock-ist">India Standard Time (IST · UTC+5:30)</div>
              </div>
              <div className="att-check-row">
                <button className="att-btn-checkin" onClick={handleCheckIn} disabled={checkedIn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Check In
                </button>
                <button className="att-btn-checkout" onClick={handleCheckOut} disabled={!checkedIn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Check Out
                </button>
              </div>
              {sessions.length > 0 ? (
                <>
                  <div className="att-sessions-title">Today Sessions</div>
                  {sessions.map((s, i) => {
                    const dur = s.checkIn && s.checkOut ? diffMins(s.checkIn, s.checkOut) : null;
                    return (
                      <div className="att-session-row" key={i}>
                        <span className="att-session-num">Session {i + 1}</span>
                        <span className="att-session-times">
                          {s.checkIn ? fmtTimeShort(s.checkIn) : "—"} → {s.checkOut ? fmtTimeShort(s.checkOut) : (checkedIn && i === sessions.length - 1 ? <span style={{ color: "#10b981", fontWeight: 700 }}>Ongoing</span> : "—")}
                        </span>
                        {dur !== null && <span className="att-session-dur">{minsToHM(dur)}</span>}
                      </div>
                    );
                  })}
                  <div className="att-total-row">
                    <span className="att-total-label">Total time today</span>
                    <span className="att-total-val">{minsToHM(totalMinsToday)}</span>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "12px 0 4px" }}>No sessions recorded today. Click Check In to start.</div>
              )}
            </div>

            <div className="att-card">
              <div className="att-section-title">Request Leave</div>
              <div className="att-form-row">
                <div>
                  <label className="att-form-lbl">Type</label>
                  <select className="att-form-sel" value={leaveForm.type} onChange={e => setLeaveForm(p => ({ ...p, type: e.target.value }))}>
                    <option>Full Day</option><option>Half Day (AM)</option><option>Half Day (PM)</option><option>Permission</option>
                  </select>
                </div>
                <div>
                  <label className="att-form-lbl">Date</label>
                  <input type="date" className="att-form-inp" value={leaveForm.date.split("-").reverse().join("-")}
                    onChange={e => { const [y,m,d] = e.target.value.split("-"); setLeaveForm(p => ({ ...p, date: `${d}-${m}-${y}` })); }} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="att-form-lbl">Reason</label>
                <input className="att-form-inp" placeholder="Brief reason…" value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
              <button className="att-submit-btn" onClick={handleLeaveSubmit}>Submit Leave Request</button>
              {leaveMsg && <div style={{ marginTop: 10, fontSize: 13, color: leaveMsg.startsWith("✅") ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{leaveMsg}</div>}
            </div>

            <div className="att-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div className="att-section-title" style={{ marginBottom: 0 }}>My Attendance History</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <select className="att-month-sel" value={histMonth} onChange={e => setHistMonth(e.target.value)}>
                    {monthOptions.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <button className="att-export-btn" onClick={() => exportCSV("my")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export CSV
                  </button>
                </div>
              </div>
              {filteredHistory.length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "24px 0" }}>No history for {histMonth}</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="att-hist-table">
                    <thead><tr><th>Date</th><th>Status</th><th>Sessions</th><th>Total Hours</th><th>Leave / Reason</th></tr></thead>
                    <tbody>
                      {filteredHistory.map((h, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: "#1e293b" }}>{h.date}</td>
                          <td><span className={`badge ${h.status === "Present" ? "badge-present" : h.leaveType ? "badge-leave" : "badge-absent"}`}>{h.leaveType || h.status || "—"}</span></td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                            {(h.sessions || []).length > 0 ? (h.sessions||[]).map((s,j) => <div key={j}>{s.checkIn} → {s.checkOut || "ongoing"}</div>) : "—"}
                          </td>
                          <td style={{ fontFamily: "var(--mono)", fontWeight: 600, color: "#1e293b" }}>{h.totalMins ? minsToHM(h.totalMins) : "—"}</td>
                          <td style={{ color: "#64748b", fontSize: 12 }}>{h.reason || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "admin" && isAdmin && (
          <div className="att-page">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>All Staff Attendance</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Leave count & attendance summary</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <select className="att-month-sel" value={adminMonth} onChange={e => setAdminMonth(e.target.value)}>
                  {monthOptions.map(m => <option key={m}>{m}</option>)}
                </select>
                <button className="att-export-btn" onClick={() => exportCSV("admin")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="att-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="att-summary-table">
                  <thead><tr><th>S.No</th><th>Name</th><th>Role</th><th>Present Days</th><th>Full Leaves</th><th>Half Days</th><th>Permissions</th><th>Absent</th><th>Total Leaves</th></tr></thead>
                  <tbody>
                    {adminSummary.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>No data for {adminMonth}</td></tr>
                    ) : adminSummary.map((s, i) => {
                      const totalLeaves = s.fullLeaves + s.halfLeaves * 0.5 + s.permissions * 0.25;
                      return (
                        <tr key={i}>
                          <td style={{ color: "#94a3b8", fontWeight: 600 }}>{i+1}</td>
                          <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={s.name} size={26} /><span style={{ fontWeight: 700, color: "#1e293b" }}>{s.name}</span></div></td>
                          <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: s.role === "CA" ? "#fef3c7" : "#dbeafe", color: s.role === "CA" ? "#d97706" : "#2563eb" }}>{s.role}</span></td>
                          <td><span style={{ fontWeight: 700, color: "#16a34a" }}>{s.presentDays}</span></td>
                          <td><span style={{ fontWeight: 700, color: s.fullLeaves > 0 ? "#d97706" : "#94a3b8" }}>{s.fullLeaves}</span></td>
                          <td><span style={{ fontWeight: 700, color: s.halfLeaves > 0 ? "#7c3aed" : "#94a3b8" }}>{s.halfLeaves}</span></td>
                          <td><span style={{ fontWeight: 700, color: s.permissions > 0 ? "#0284c7" : "#94a3b8" }}>{s.permissions}</span></td>
                          <td><span style={{ fontWeight: 700, color: s.absentDays > 0 ? "#dc2626" : "#94a3b8" }}>{s.absentDays}</span></td>
                          <td><span style={{ fontWeight: 800, fontSize: 14, color: totalLeaves > 3 ? "#dc2626" : "#1e293b" }}>{totalLeaves % 1 === 0 ? totalLeaves : totalLeaves.toFixed(1)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "salary" && isAdmin && (
          <div className="att-page">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Salary Calculator</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Based on attendance for {adminMonth}</div>
              </div>
              <select className="att-month-sel" value={adminMonth} onChange={e => setAdminMonth(e.target.value)}>
                {monthOptions.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="att-card">
              <div className="att-section-title">Set Per-Day Salary (₹)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 10 }}>
                {adminSummary.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 9 }}>
                    <Avatar name={s.name} size={26} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{s.name}</span>
                    <input type="number" placeholder="₹/day" value={salarySettings[s.name]?.perDay || ""}
                      onChange={e => setSalarySettings(p => ({ ...p, [s.name]: { perDay: Number(e.target.value) } }))}
                      style={{ width: 80, padding: "6px 10px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 13, outline: "none", textAlign: "right" }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="att-salary-grid">
              {adminSummary.map(s => {
                const perDay = salarySettings[s.name]?.perDay || 0;
                const deduct = s.fullLeaves + s.halfLeaves * 0.5;
                const net = Math.max(0, s.presentDays - deduct);
                const salary = Math.round(perDay * net);
                return (
                  <div className="att-salary-card" key={s.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Avatar name={s.name} size={30} />
                      <div><div className="att-salary-name" style={{ marginBottom: 0 }}>{s.name}</div><div style={{ fontSize: 10, color: "#64748b" }}>{s.role} · {adminMonth}</div></div>
                    </div>
                    <div className="att-salary-row"><span>Present days</span><span>{s.presentDays}</span></div>
                    <div className="att-salary-row"><span>Full leaves</span><span style={{ color: s.fullLeaves > 0 ? "#d97706" : "inherit" }}>{s.fullLeaves}</span></div>
                    <div className="att-salary-row"><span>Half days</span><span style={{ color: s.halfLeaves > 0 ? "#7c3aed" : "inherit" }}>{s.halfLeaves}</span></div>
                    <div className="att-salary-row"><span>Net working days</span><span style={{ fontWeight: 700 }}>{net}</span></div>
                    <div className="att-salary-row"><span>Per day rate</span><span>₹{perDay.toLocaleString("en-IN")}</span></div>
                    <div className="att-salary-total"><span>Net Salary</span><span style={{ color: salary > 0 ? "#166534" : "#94a3b8" }}>{salary > 0 ? `₹${salary.toLocaleString("en-IN")}` : perDay === 0 ? "Set rate ↑" : "₹0"}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
