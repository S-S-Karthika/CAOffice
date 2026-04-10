import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
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
  phone:    "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  close:    "M18 6L6 18M6 6l12 12",
  clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  plus:     "M12 5v14M5 12h14",
};

const STATUS_CFG = {
  "Pending":     { color: "#f59e0b", bg: "#fef3c7", text: "#d97706" },
  "In Progress": { color: "#3b82f6", bg: "#dbeafe", text: "#2563eb" },
  "Completed":   { color: "#10b981", bg: "#d1fae5", text: "#059669" },
  "On Hold":     { color: "#8b5cf6", bg: "#ede9fe", text: "#7c3aed" },
  "Review":      { color: "#8b5cf6", bg: "#ede9fe", text: "#7c3aed" },
};
const PENDING_STATUSES = ["Pending", "In Progress", "On Hold", "Review"];

const WORK_TYPES = [
  "ITR Filing (Individual)","ITR Filing (Business)","ITR Filing (Firm/LLP)",
  "GST Return (GSTR-1)","GST Return (GSTR-3B)","GST Return (GSTR-9)","GST Registration",
  "Statutory Audit (TNCS)","Tax Audit (3CD)","MCA / ROC Filing","Company Incorporation",
  "TDS Return (24Q)","TDS Return (26Q)","Net Worth Certificate","Projected P&L",
  "Accounting / Bookkeeping","Loan Processing","Other",
];
const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function getCurrentMonthLabel() { const d = new Date(); return `${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}`; }

const AV_COLORS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
function Avatar({ name = "?", size = 32 }) {
  const bg = AV_COLORS[(String(name).charCodeAt(0) || 0) % AV_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.4, fontWeight: 700 }}>
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

// ─── Pending Works Popup ──────────────────────────────────────────────────────
function PendingWorksPopup({ clientName, works, onClose }) {
  const pending = works.filter(w => w.clientName?.toLowerCase() === clientName.toLowerCase() && PENDING_STATUSES.includes(w.status || "Pending"));
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400, cursor: "pointer" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 14, width: "min(480px, calc(100vw - 24px))", maxHeight: "80vh", display: "flex", flexDirection: "column", zIndex: 401, boxShadow: "0 16px 48px rgba(0,0,0,0.22)" }}>
        <div style={{ background: "#0f172a", borderRadius: "14px 14px 0 0", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Pending Works</div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{clientName} · {pending.length} pending</div>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#94a3b8", padding: 8, cursor: "pointer", display: "flex" }}><Icon d={ICONS.close} size={18} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: 16 }}>
          {pending.length === 0 ? <div style={{ textAlign: "center", color: "#94a3b8", padding: "30px 0", fontSize: 13 }}>No pending works</div>
          : pending.map((w, i) => {
            const cfg = STATUS_CFG[w.status] || STATUS_CFG["Pending"];
            return (
              <div key={i} style={{ border: "1px solid #f1f5f9", borderLeft: `3px solid ${cfg.color}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{w.workNature || "—"}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{w.month || ""}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: cfg.bg, color: cfg.text }}>{w.status}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  {w.assignedTo && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={w.assignedTo} size={18} /><span style={{ fontSize: 11, color: "#64748b" }}>{w.assignedTo}</span></div>}
                  {w.expectedCompletion && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon d={ICONS.clock} size={12} stroke="#94a3b8" /><span style={{ fontSize: 11, color: "#94a3b8" }}>Due {w.expectedCompletion}</span></div>}
                  {w.priority === "Urgent" && <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>🔴 URGENT</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Add Work Modal ───────────────────────────────────────────────────────────
function AddWorkModal({ clientRow, staffList, caList, onClose, onSaved }) {
  const [form, setForm] = useState({ workNature: "", month: getCurrentMonthLabel(), assignedTo: "", referredBy: "", startDate: "", dueDate: "", docObtained: "Yes", pendingRemarks: "", checklist: "Yes", priority: "Normal", notes: "", fees: "" });
  const [saving, setSaving] = useState(false);
  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const derivedStatus = form.docObtained === "Yes" ? "In Progress" : "Pending";
  const isUrgent = form.priority === "Urgent";
  const inp = { width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "'Segoe UI', sans-serif", color: "#1e293b", background: "#fff", outline: "none" };
  const lbl = { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 };
  const grp = { marginBottom: 12 };
  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };

  const handleSave = async () => {
    if (!form.workNature) { alert("Work Nature is required"); return; }
    if (!form.assignedTo) { alert("Assigned To is required"); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/add-client`, {
        clientName: clientRow.clientName, pan: clientRow.pan || "", contactNo: clientRow.contactNo || "",
        address: clientRow.address || "", referredBy: form.referredBy || clientRow.referredBy || "",
        workNature: form.workNature, month: form.month, assignedTo: form.assignedTo,
        workStartDate: form.startDate, expectedCompletion: form.dueDate,
        documentObtained: form.docObtained, pendingRemarks: form.pendingRemarks,
        checklist: form.checklist, priority: form.priority, notes: form.notes,
        fees: form.fees, status: derivedStatus,
      });
      onSaved(); onClose();
    } catch (err) { alert("Error saving work ❌"); console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400, cursor: "pointer" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 14, width: "min(520px, calc(100vw - 24px))", maxHeight: "88vh", display: "flex", flexDirection: "column", zIndex: 401, boxShadow: "0 16px 48px rgba(0,0,0,0.22)" }}>
        <div style={{ background: "#0f172a", borderRadius: "14px 14px 0 0", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={clientRow.clientName} size={36} />
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Add New Work</div>
              <div style={{ color: "#7ab8f5", fontSize: 12, marginTop: 1 }}>{clientRow.clientName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#94a3b8", padding: 8, cursor: "pointer", display: "flex" }}><Icon d={ICONS.close} size={18} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: 20 }}>
          <div style={grp}>
            <label style={lbl}>Work Nature <span style={{ color: "#ef4444" }}>*</span></label>
            <select name="workNature" value={form.workNature} onChange={handle} style={inp}>
              <option value="">+ Select work type</option>
              {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={row2}>
            <div style={grp}>
              <label style={lbl}>Assigned To <span style={{ color: "#ef4444" }}>*</span></label>
              <select name="assignedTo" value={form.assignedTo} onChange={handle} style={inp}>
                <option value="">— Select —</option>
                {caList.length > 0 && <optgroup label="CA">{caList.map(n => <option key={n}>{n}</option>)}</optgroup>}
                {staffList.length > 0 && <optgroup label="Staff">{staffList.map(n => <option key={n}>{n}</option>)}</optgroup>}
              </select>
            </div>
            <div style={grp}>
              <label style={lbl}>Referred By</label>
              <select name="referredBy" value={form.referredBy} onChange={handle} style={inp}>
                <option value="">— None —</option>
                {caList.length > 0 && <optgroup label="CA">{caList.map(n => <option key={n}>{n}</option>)}</optgroup>}
                {staffList.length > 0 && <optgroup label="Staff">{staffList.map(n => <option key={n}>{n}</option>)}</optgroup>}
              </select>
            </div>
          </div>
          <div style={row2}>
            <div style={grp}><label style={lbl}>Work Starts On</label><input type="date" name="startDate" value={form.startDate} onChange={handle} style={inp} /></div>
            <div style={grp}><label style={lbl}>Due Date</label><input type="date" name="dueDate" value={form.dueDate} onChange={handle} style={inp} /></div>
          </div>
          <div style={grp}>
            <label style={lbl}>Document Obtained?</label>
            <select name="docObtained" value={form.docObtained} onChange={handle} style={inp}>
              <option value="Yes">Yes — Documents received</option>
              <option value="No">No — Pending from client</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div style={row2}>
            <div style={grp}><label style={lbl}>Fees (₹)</label><input type="number" name="fees" placeholder="0" value={form.fees} onChange={handle} style={inp} /></div>
            <div style={grp}>
              <label style={lbl}>Priority</label>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={() => setForm(p => ({ ...p, priority: "Normal" }))} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "'Segoe UI', sans-serif", background: !isUrgent ? "#0f172a" : "#f1f5f9", color: !isUrgent ? "#fff" : "#475569" }}>Normal</button>
                <button type="button" onClick={() => setForm(p => ({ ...p, priority: "Urgent" }))} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "'Segoe UI', sans-serif", background: isUrgent ? "#dc2626" : "#fef2f2", color: isUrgent ? "#fff" : "#dc2626" }}>🔴 URGENT</button>
              </div>
            </div>
          </div>
          <div style={grp}><label style={lbl}>Notes</label><textarea name="notes" rows={2} placeholder="Any additional notes…" value={form.notes} onChange={handle} style={{ ...inp, resize: "vertical", minHeight: 60 }} /></div>
        </div>
        <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: 8, border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {saving ? "Saving…" : <><Icon d={ICONS.plus} size={16} stroke="#fff" /> Save Work</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Client Detail Drawer ─────────────────────────────────────────────────────
function ClientDrawer({ row, allWorks, staffList, caList, onClose, onWorkAdded }) {
  const [addingWork, setAddingWork] = useState(false);
  if (!row) return null;
  const clientWorks = allWorks.filter(w => w.clientName?.toLowerCase() === row.clientName?.toLowerCase());
  const stats = {
    total: clientWorks.length,
    completed: clientWorks.filter(r => r.status === "Completed").length,
    inProgress: clientWorks.filter(r => r.status === "In Progress").length,
    pending: clientWorks.filter(r => PENDING_STATUSES.includes(r.status || "Pending")).length,
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, cursor: "pointer" }} />
      <div className="ca-client-drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 430, background: "#fff", zIndex: 301, display: "flex", flexDirection: "column", boxShadow: "-4px 0 32px rgba(0,0,0,0.16)" }}>
        <div style={{ background: "#0f172a", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={row.clientName} size={40} />
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{row.clientName}</div>
              <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>{row.pan || "No PAN"} · {row.contactNo || "No contact"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAddingWork(true)} style={{ background: "#1e3a5f", border: "none", borderRadius: 8, color: "#7ab8f5", padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, fontFamily: "'Segoe UI', sans-serif" }}>
              <Icon d={ICONS.plus} size={14} stroke="#7ab8f5" /> Add Work
            </button>
            <button onClick={onClose} style={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#94a3b8", padding: 8, cursor: "pointer", display: "flex" }}><Icon d={ICONS.close} size={18} /></button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          {[{ label: "Total", val: stats.total, color: "#1e293b" }, { label: "Completed", val: stats.completed, color: "#10b981" }, { label: "In Progress", val: stats.inProgress, color: "#3b82f6" }, { label: "Pending", val: stats.pending, color: "#f59e0b" }].map(s => (
            <div key={s.label} style={{ background: "#fff", padding: "11px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="ca-main" style={{ flex: 1, overflowY: "auto", padding: "12px 18px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Works ({clientWorks.length})</div>
          {clientWorks.length === 0 ? <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "30px 0" }}>No works yet</div>
          : clientWorks.map((w, i) => {
            const cfg = STATUS_CFG[w.status] || STATUS_CFG["Pending"];
            return (
              <div key={i} style={{ border: "1px solid #f1f5f9", borderLeft: `3px solid ${cfg.color}`, borderRadius: 10, padding: "11px 13px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{w.workNature || "—"}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{w.month || ""}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 10, background: cfg.bg, color: cfg.text }}>{w.status}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 7, flexWrap: "wrap" }}>
                  {w.assignedTo && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Avatar name={w.assignedTo} size={18} /><span style={{ fontSize: 11, color: "#64748b" }}>{w.assignedTo}</span></div>}
                  {w.expectedCompletion && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon d={ICONS.clock} size={12} stroke="#94a3b8" /><span style={{ fontSize: 11, color: "#94a3b8" }}>Due {w.expectedCompletion}</span></div>}
                  {w.priority === "Urgent" && <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>🔴 URGENT</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {addingWork && <AddWorkModal clientRow={row} staffList={staffList} caList={caList} onClose={() => setAddingWork(false)} onSaved={onWorkAdded} />}
    </>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Clients() {
  const navigate = useNavigate();
  const user  = JSON.parse(localStorage.getItem("cao_user") || '{"name":"Guest","role":"Staff"}');
  const isCA  = user.role === "CA";
  const [activeNav, setActiveNav] = useState("clients");
  const [allWorks, setAllWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [pendingPopup, setPendingPopup] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [caList, setCaList] = useState([]);
  const [sortCol, setSortCol] = useState("clientName");
  const [sortDir, setSortDir] = useState("asc");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/works`),
      axios.get(`${API}/api/users`).catch(() => ({ data: [] })),
    ]).then(([worksRes, userRes]) => {
      // Staff sees only their assigned works; CA sees all
      const allW = worksRes.data || [];
      setAllWorks(isCA ? allW : allW.filter(w => w.assignedTo === user.name));
      const users = userRes.data || [];
      setStaffList(users.filter(u => u.role === "Staff").map(u => u.name));
      setCaList(users.filter(u => u.role === "CA").map(u => u.name));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  // Build unique clients
  const clientMap = new Map();
  for (const row of allWorks) {
    const name = String(row.clientName || "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!clientMap.has(key)) clientMap.set(key, { firstRow: row, allWorks: [] });
    clientMap.get(key).allWorks.push(row);
  }

  const uniqueClients = Array.from(clientMap.values()).map(({ firstRow, allWorks: cw }) => {
    const pendingWorks = cw.filter(w => PENDING_STATUSES.includes(w.status || "Pending"));
    const pendingFees = pendingWorks.reduce((sum, w) => sum + Number(w.fees || 0), 0);
    return { row: firstRow, name: String(firstRow.clientName || ""), pan: String(firstRow.pan || ""), contactNo: String(firstRow.contactNo || ""), address: String(firstRow.address || ""), referredBy: String(firstRow.referredBy || ""), totalWorks: cw.length, pendingWorks: pendingWorks.length, pendingFees };
  });

  const q = search.toLowerCase().trim();
  const filtered = uniqueClients.filter(c => c.name.toLowerCase().includes(q) || c.pan.toLowerCase().includes(q) || c.contactNo.includes(q));
  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    if (sortCol === "pendingWorks") { av = a.pendingWorks; bv = b.pendingWorks; }
    else if (sortCol === "fees") { av = a.pendingFees; bv = b.pendingFees; }
    else { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
    const cmp = typeof av === "number" ? av - bv : av.localeCompare(bv);
    return sortDir === "asc" ? cmp : -cmp;
  });

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir(col === "clientName" ? "asc" : "desc"); }
  }

  const navItems = [
    { key: "dash", label: "Dash", icon: ICONS.dash },
    { key: "works", label: "Works", icon: ICONS.works },
    { key: "clients", label: "Clients", icon: ICONS.clients },
    { key: "finance", label: "Finance", icon: ICONS.finance },
    { key: "add", label: "Add", icon: ICONS.add },
    { key: "attend", label: "Attend", icon: ICONS.attend },
    { key: "cal", label: "Cal", icon: ICONS.cal },
    { key: "reimb", label: "Reimb", icon: ICONS.reimb },
    { key: "settings", label: "Settings", icon: ICONS.settings },
  ];

  function handleNav(key) {
    if (key === "add") { navigate("/add-client"); return; }
    if (key === "clients") { navigate("/clients"); return; }
    if (key === "reimb") { navigate("/reimbursement"); return; }
    if (key === "attend") { navigate("/attendance"); return; }
    if (key === "works")    { navigate("/works");    return; }
    if (key === "settings") { navigate("/settings"); return; }
    setActiveNav(key);
  }

  const thStyle = (col) => ({
    padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#e2e8f0",
    cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
    borderBottom: "2px solid #1e3a5f",
    background: sortCol === col ? "#1a3f6f" : "transparent",
  });

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
      <aside className="ca-sidebar" style={{ width: 72, background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 2, flexShrink: 0, overflowY: "auto" }}>
        {navItems.map(n => <NavItem key={n.key} label={n.label} iconPath={n.icon} active={activeNav === n.key && n.key !== "add"} dot={n.dot} onClick={() => handleNav(n.key)} />)}
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header className="ca-header" style={{ height: 54, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div><span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>CA </span><span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>Office</span></div>
            <div style={{ background: "#1e3a5f", color: "#60a5fa", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>{user.role}</div>
            <div className="ca-header-name" style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{user.name.toUpperCase()}</div>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", padding: "5px 14px", cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }} onClick={fetchAll}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> Sync
          </button>
        </header>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 24px 0", flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Clients</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>{sorted.length} client{sorted.length !== 1 ? "s" : ""}</div>
            <div style={{ position: "relative", marginBottom: search ? 6 : 12 }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><Icon d={ICONS.search} size={16} stroke="#94a3b8" /></div>
              <input type="text" placeholder="Search client name or PAN..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontFamily: "'Segoe UI', sans-serif", color: "#1e293b", background: "#fff", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }} />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}><Icon d={ICONS.close} size={16} /></button>}
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "0 24px 24px" }}>
            {loading ? <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>Loading clients…</div>
            : sorted.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>{search ? `No clients found for "${search}"` : "No clients yet."}</div>
            : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a" }}>
                    <th style={{ ...thStyle(null), width: 52, cursor: "default" }}>S.No</th>
                    <th style={thStyle("clientName")} onClick={() => handleSort("clientName")}>Name {sortCol === "clientName" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</th>
                    <th style={{ ...thStyle(null), cursor: "default" }}>PAN</th>
                    <th style={{ ...thStyle(null), cursor: "default" }}>Mobile</th>
                    <th style={{ ...thStyle(null), cursor: "default" }}>Address</th>
                    <th style={{ ...thStyle(null), cursor: "default" }}>Referred By</th>
                    <th style={thStyle("pendingWorks")} onClick={() => handleSort("pendingWorks")}>Pending Works {sortCol === "pendingWorks" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</th>
                    <th style={thStyle("fees")} onClick={() => handleSort("fees")}>Pending Fees {sortCol === "fees" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</th>
                    <th style={{ ...thStyle(null), cursor: "default" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f8fafc")}>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: "12px 16px", cursor: "pointer" }} onClick={() => setSelected(c.row)}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={c.name} size={30} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{c.name}</div>
                            {c.referredBy && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>via {c.referredBy}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", fontFamily: "'Courier New', monospace" }}>{c.pan || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{c.contactNo || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#475569", maxWidth: 160 }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }} title={c.address}>{c.address || "—"}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{c.referredBy || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {c.pendingWorks > 0 ? (
                          <button onClick={() => setPendingPopup(c.name)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d", borderRadius: 20, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif" }}>
                            ⏳ {c.pendingWorks} pending
                          </button>
                        ) : <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>✓ Clear</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {c.pendingFees > 0 ? <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>₹{c.pendingFees.toLocaleString("en-IN")}</span>
                          : <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {isCA ? (
                          <button
                            onClick={() => navigate("/add-client", { state: { prefill: { clientName: c.name, pan: c.pan, contactNo: c.contactNo, address: c.address, referredBy: c.referredBy } } })}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Segoe UI', sans-serif" }}
                          >
                            <Icon d={ICONS.plus} size={13} stroke="#2563eb" /> Work
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>View only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selected && <ClientDrawer row={selected} allWorks={allWorks} staffList={staffList} caList={caList} onClose={() => setSelected(null)} onWorkAdded={() => { fetchAll(); setSelected(null); }} />}
      {pendingPopup && <PendingWorksPopup clientName={pendingPopup} works={allWorks} onClose={() => setPendingPopup(null)} />}
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
