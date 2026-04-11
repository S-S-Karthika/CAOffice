import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ── Responsive layout CSS injected once ── */
const MOBILE_CSS = `
  @media (max-width: 768px) {
    .ca-sidebar { display: none !important; }
    .ca-bottom-nav { display: flex !important; }
    .ca-main { padding-bottom: 64px !important; }
    .ca-header-name { display: none !important; }
    .ca-due-grid { grid-template-columns: repeat(3,1fr) !important; }
    .ca-right-panel { display: none !important; }
    .ca-content-wrap { flex-direction: column !important; }
  }
  @media (max-width: 480px) {
    .ca-due-grid { grid-template-columns: 1fr 1fr !important; }
    .ca-header { padding: 0 12px !important; }
    .ca-page-pad { padding: 12px !important; }
  }
  .ca-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: #0f172a;
    height: 60px;
    z-index: 200;
    border-top: 1px solid #1e3a5f;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .ca-bottom-nav-inner {
    display: flex;
    min-width: max-content;
    height: 100%;
    padding: 0 4px;
  }
  .ca-bn-item {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; padding: 0 12px; border: none; background: none; cursor: pointer;
    color: #94a3b8; font-family: 'Segoe UI', sans-serif; min-width: 52px; position: relative;
  }
  .ca-bn-item.active { color: #3b82f6; }
  .ca-bn-item span { font-size: 9px; font-weight: 600; white-space: nowrap; }
  .ca-bn-dot { position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; }
`;

const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
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
  invoice:  "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const STATUS_CONFIG = {
  "Pending":     { color: "#f59e0b", bg: "#fef3c7", text: "#d97706" },
  "In Progress": { color: "#3b82f6", bg: "#dbeafe", text: "#2563eb" },
  "Completed":   { color: "#10b981", bg: "#d1fae5", text: "#059669" },
  "On Hold":     { color: "#8b5cf6", bg: "#ede9fe", text: "#7c3aed" },
  "Review":      { color: "#8b5cf6", bg: "#ede9fe", text: "#7c3aed" },
};
const AV_COLORS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];

function Avatar({ name, size = 30 }) {
  const bg = AV_COLORS[(String(name || "?").charCodeAt(0) || 0) % AV_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.43, fontWeight: 700, flexShrink: 0 }}>
      {String(name || "?")[0].toUpperCase()}
    </div>
  );
}

function toDate(str) {
  if (!str) return null;
  if (str.includes("T")) str = str.split("T")[0];
  const parts = str.split("-");
  let dt;
  if (parts[0].length === 4) dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  else dt = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function todayDate() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }

function NavItem({ label, iconPath, active, onClick, dot }) {
  return (
    <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "9px 0", border: "none", background: "none", cursor: "pointer", width: "100%", position: "relative", color: active ? "#3b82f6" : "#94a3b8", fontFamily: "'Segoe UI', sans-serif" }}>
      {dot && <span style={{ position: "absolute", top: 8, right: 10, width: 7, height: 7, borderRadius: "50%", background: "#3b82f6" }} />}
      <Icon d={iconPath} size={21} stroke={active ? "#3b82f6" : "#94a3b8"} />
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
      {active && <div style={{ position: "absolute", left: 0, top: "15%", height: "70%", width: 3, borderRadius: "0 3px 3px 0", background: "#3b82f6" }} />}
    </button>
  );
}

function DonutChart({ works }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const counts = { Pending: 0, "In Progress": 0, Completed: 0, Other: 0 };
    works.forEach((w) => { if (counts[w.status] !== undefined) counts[w.status]++; else counts.Other++; });
    const total = works.length || 1;
    const slices = [{ val: counts.Pending, color: "#f59e0b" }, { val: counts["In Progress"], color: "#3b82f6" }, { val: counts.Completed, color: "#10b981" }, { val: counts.Other, color: "#8b5cf6" }];
    ctx.clearRect(0, 0, 80, 80);
    let start = -Math.PI / 2;
    slices.forEach(({ val, color }) => {
      if (!val) return;
      const arc = (val / total) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(40, 40, 28, start, start + arc); ctx.strokeStyle = color; ctx.lineWidth = 12; ctx.stroke(); start += arc;
    });
    ctx.font = "bold 13px Segoe UI"; ctx.fillStyle = "#1e293b"; ctx.textAlign = "center"; ctx.fillText(total, 40, 44);
    ctx.font = "7px Segoe UI"; ctx.fillStyle = "#64748b"; ctx.fillText("Works", 40, 54);
  }, [works]);
  return <canvas ref={canvasRef} width={80} height={80} />;
}

function WorkCalendar({ works }) {
  const today = todayDate();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [popup, setPopup] = useState(null);
  function changeMonth(delta) { let m = calMonth + delta, y = calYear; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); }
  const byDay = {};
  works.forEach((w) => { const d = toDate(w.expectedCompletion); if (!d) return; if (d.getFullYear() === calYear && d.getMonth() === calMonth) { const day = d.getDate(); if (!byDay[day]) byDay[day] = []; byDay[day].push(w); } });
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: prevMonthDays - firstDow + 1 + i, current: false, works: [] });
  for (let d = 1; d <= daysInMonth; d++) { const dt = new Date(calYear, calMonth, d); dt.setHours(0, 0, 0, 0); cells.push({ day: d, current: true, isToday: dt.getTime() === today.getTime(), works: byDay[d] || [] }); }
  const remaining = 7 - (cells.length % 7); if (remaining < 7) for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false, works: [] });
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Work Calendar — {MONTHS[calMonth]} {calYear}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => changeMonth(-1)} style={arrowBtnStyle}>‹</button>
          <button onClick={() => changeMonth(1)} style={arrowBtnStyle}>›</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "8px 14px 0" }}>
        {DAY_LABELS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", paddingBottom: 4 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, padding: "0 14px 14px" }}>
        {cells.map((cell, idx) => (
          <div key={idx} onClick={() => cell.current && cell.works.length > 0 && setPopup({ day: cell.day, works: cell.works })}
            style={{ minHeight: 40, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", padding: "3px 2px", cursor: cell.current && cell.works.length > 0 ? "pointer" : "default", background: cell.isToday ? "#eff6ff" : "transparent" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: cell.isToday ? "#3b82f6" : "transparent", color: !cell.current ? "#cbd5e1" : cell.isToday ? "#fff" : "#334155", fontSize: 12, fontWeight: 600 }}>{cell.day}</div>
            {cell.current && cell.works.length > 0 && (
              <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", marginTop: 2 }}>
                {cell.works.slice(0, 3).map((w, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_CONFIG[w.status]?.color || "#94a3b8" }} />)}
                {cell.works.length > 3 && <div style={{ fontSize: 8, color: "#94a3b8", lineHeight: "5px" }}>+{cell.works.length - 3}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, padding: "8px 16px 14px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
        {Object.entries(STATUS_CONFIG).slice(0, 4).map(([label, cfg]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
          </div>
        ))}
      </div>
      {popup && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setPopup(null); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, width: "100%", maxWidth: 320, maxHeight: "70vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Works on {MONTHS[calMonth].slice(0, 3)} {popup.day}, {calYear}</span>
              <button onClick={() => setPopup(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>
            {popup.works.map((w) => { const cfg = STATUS_CONFIG[w.status] || STATUS_CONFIG.Pending; return (
              <div key={w.id} style={{ padding: "11px 13px", border: "1px solid #f1f5f9", borderRadius: 9, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{w.clientName}</div>
                  <Avatar name={w.assignedTo} size={26} />
                </div>
                <div style={{ fontSize: 11, color: "#64748b", margin: "3px 0 6px" }}>{w.workNature}</div>
                <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 10, background: cfg.bg, color: cfg.text }}>{w.status}</span>
              </div>
            ); })}
          </div>
        </div>
      )}
    </div>
  );
}

function DueSummaryCards({ works }) {
  const today = todayDate();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
  const ago7 = new Date(today); ago7.setDate(ago7.getDate() - 7);
  let cToday = 0, cTomorrow = 0, c7Days = 0, cOver7 = 0, cOverdue = 0;
  works.forEach((w) => {
    if (w.status === "Completed") return;
    const d = toDate(w.expectedCompletion); if (!d) return;
    const t = d.getTime();
    if (t === today.getTime()) cToday++;
    else if (t === tomorrow.getTime()) cTomorrow++;
    else if (d > today && d <= in7) c7Days++;
    else if (d < today && d >= ago7) cOver7++;
    else if (d < ago7) cOverdue++;
  });
  const cards = [
    { label: "Due Today", count: cToday, color: "#f59e0b" },
    { label: "Tomorrow", count: cTomorrow, color: "#3b82f6" },
    { label: "In 7 Days", count: c7Days, color: "#10b981" },
    { label: "≤7d Over", count: cOver7, color: "#ef4444" },
    { label: ">7d Over", count: cOverdue, color: "#7c3aed" },
  ];
  return (
    <div className="ca-due-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: "13px 10px", borderTop: `3px solid ${c.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.count}</div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Due</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#475569", marginTop: 1 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── UPDATED: TodoSection with "Add Today's Work" notes ───────────────────────
function TodoSection({ works }) {
  const [activeTab, setActiveTab] = useState("Today");
  const [notes, setNotes] = useState([]); // local daily notes
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const today = todayDate();

  const filtered = {
    Today: works.filter((w) => { const d = toDate(w.expectedCompletion); return d && d.getTime() === today.getTime() && w.status !== "Completed"; }),
    Upcoming: works.filter((w) => { const d = toDate(w.expectedCompletion); return d && d > today && w.status !== "Completed"; }),
    Completed: works.filter((w) => w.status === "Completed"),
  };
  const list = filtered[activeTab] || [];

  function addNote() {
    const text = noteText.trim();
    if (!text) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setNotes((prev) => [{ id: Date.now(), text, time: timeStr }, ...prev]);
    setNoteText("");
    setShowNoteInput(false);
  }

  function removeNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>To-Do</span>
        <button
          onClick={() => { setShowNoteInput((v) => !v); setNoteText(""); }}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif" }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add Today's Work
        </button>
      </div>

      {/* Inline note input box */}
      {showNoteInput && (
        <div style={{ margin: "10px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px" }}>
          <textarea
            autoFocus
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addNote(); } if (e.key === "Escape") { setShowNoteInput(false); setNoteText(""); } }}
            placeholder="Type your work note… (Enter to save, Esc to cancel)"
            style={{ width: "100%", border: "none", background: "transparent", resize: "none", outline: "none", fontFamily: "'Segoe UI', sans-serif", fontSize: 13, color: "#92400e", minHeight: 60, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button onClick={() => { setShowNoteInput(false); setNoteText(""); }}
              style={{ background: "none", border: "1px solid #fcd34d", color: "#b45309", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 }}>
              Cancel
            </button>
            <button onClick={addNote}
              style={{ background: "#f59e0b", border: "none", color: "#fff", borderRadius: 6, padding: "4px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", fontWeight: 700 }}>
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", overflowX: "auto" }}>
        {["Today", "Upcoming", "Completed"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "9px 14px", fontSize: 13, border: "none", background: "none", cursor: "pointer", fontWeight: 600, fontFamily: "'Segoe UI', sans-serif", color: activeTab === tab ? "#1e293b" : "#94a3b8", borderBottom: activeTab === tab ? "2px solid #1e293b" : "2px solid transparent", marginBottom: -1, whiteSpace: "nowrap" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Notes (only shown in Today tab) */}
      {activeTab === "Today" && notes.map((note) => (
        <div key={note.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "8px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "10px 13px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0, marginTop: 4 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>{note.text}</div>
            <div style={{ fontSize: 10, color: "#b45309", marginTop: 3 }}>Added at {note.time}</div>
          </div>
          <button onClick={() => removeNote(note.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}
            title="Remove note">
            ×
          </button>
        </div>
      ))}

      {/* Work items */}
      {list.length === 0 && (activeTab !== "Today" || notes.length === 0) ? (
        <div style={{ padding: "18px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No tasks for {activeTab.toLowerCase()}</div>
      ) : list.map((w) => (
        <div key={w.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid #f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_CONFIG[w.status]?.color || "#3b82f6", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{w.clientName}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{w.workNature}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{w.expectedCompletion ? toDate(w.expectedCompletion)?.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
            <Avatar name={w.assignedTo || "?"} size={27} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksPanel({ works }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Pending", "Hold", "In Progress", "Done"];
  const statusMap = { All: null, Pending: "Pending", Hold: "On Hold", "In Progress": "In Progress", Done: "Completed" };
  const filtered = filter === "All" ? works : works.filter((w) => w.status === statusMap[filter]);
  const byType = {};
  filtered.forEach((w) => { if (!byType[w.workNature]) byType[w.workNature] = { total: 0, done: 0 }; byType[w.workNature].total++; if (w.status === "Completed") byType[w.workNature].done++; });
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 10 }}>Tasks</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 20, cursor: "pointer", fontFamily: "'Segoe UI', sans-serif", fontWeight: 600, border: filter === f ? "1px solid #3b82f6" : "1px solid #e2e8f0", background: filter === f ? "#3b82f6" : "transparent", color: filter === f ? "#fff" : "#64748b" }}>{f}</button>
        ))}
      </div>
      {Object.keys(byType).length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: "14px 0" }}>No works found.</div>
      ) : Object.entries(byType).map(([type, data]) => {
        const pct = Math.round((data.done / data.total) * 100);
        return (
          <div key={type} style={{ display: "grid", gridTemplateColumns: "1fr 40px 60px", alignItems: "center", padding: "7px 2px", borderBottom: "1px solid #f8fafc", fontSize: 12 }}>
            <span style={{ color: "#1e293b", fontWeight: 600 }}>{type}</span>
            <span style={{ textAlign: "center", color: "#64748b" }}>{data.total}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 5, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, background: "#3b82f6", height: "100%" }} />
              </div>
              <span style={{ fontSize: 10, color: "#94a3b8", minWidth: 22 }}>{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskSummary({ works }) {
  const counts = { Pending: 0, "In Progress": 0, Completed: 0, "On Hold": 0, Review: 0 };
  works.forEach((w) => { if (counts[w.status] !== undefined) counts[w.status]++; });
  const incomplete = works.filter((w) => w.status !== "Completed").length;
  const legendItems = [
    { label: "Pending", color: "#f59e0b", count: counts.Pending },
    { label: "In Progress", color: "#3b82f6", count: counts["In Progress"] },
    { label: "Completed", color: "#10b981", count: counts.Completed },
    { label: "Review", color: "#8b5cf6", count: counts.Review },
  ];
  const statBoxes = [
    { label: "Pending", val: counts.Pending, accent: "#f59e0b" },
    { label: "On Hold", val: counts["On Hold"], accent: "#8b5cf6" },
    { label: "In Progress", val: counts["In Progress"], accent: "#3b82f6" },
    { label: "Completed", val: counts.Completed, accent: "#10b981" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <h3 style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Task Summary</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <DonutChart works={works} />
        <div style={{ flex: 1 }}>
          {legendItems.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: item.color, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "#475569" }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        {statBoxes.map((b) => (
          <div key={b.label} style={{ borderTop: `3px solid ${b.accent}`, border: `1.5px solid ${b.accent}22`, borderRadius: 8, padding: "11px 13px", background: "#fafafa" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>{b.val}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{b.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#eff6ff", borderRadius: 8, padding: "9px 14px", textAlign: "center", fontSize: 13, color: "#3b82f6", fontWeight: 600 }}>
        Need to complete: {incomplete} task{incomplete !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

function AttendanceSection({ attendance }) {
  const today = todayDate();
  const monthLabel = `${MONTHS[today.getMonth()]} ${today.getFullYear()}`;
  const staffMap = {};
  attendance.forEach((row) => {
    if (row.month !== monthLabel) return;
    if (!staffMap[row.name]) staffMap[row.name] = { present: 0, absent: 0 };
    if (row.status === "Present") staffMap[row.name].present++;
    else if (row.status === "Absent" || row.status === "Leave") staffMap[row.name].absent++;
  });
  const staffList = Object.entries(staffMap);
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Attendance</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>{monthLabel}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 280 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["User", "Present", "Absent", "%"].map((h) => (
                <th key={h} style={{ padding: "7px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, borderBottom: "1px solid #f1f5f9", color: h === "Absent" ? "#ef4444" : "#64748b" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No attendance data for this month</td></tr>
            ) : staffList.map(([name, data]) => {
              const total = data.present + data.absent;
              const pct = total > 0 ? Math.round((data.present / total) * 100) : 0;
              return (
                <tr key={name} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={name} size={28} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", color: "#1e293b", fontSize: 13 }}>{data.present}</td>
                  <td style={{ padding: "11px 16px", color: "#ef4444", fontSize: 13, fontWeight: 700 }}>{data.absent}</td>
                  <td style={{ padding: "11px 16px", color: pct > 0 ? "#10b981" : "#ef4444", fontSize: 13, fontWeight: 700 }}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── NEW: OrganizationClients (replaces PendingVerification) ──────────────────
function OrganizationClients({ works }) {
  // Group by organization field; blank org goes under "Unspecified"
  const orgMap = {};
  works.forEach((w) => {
    const org = (w.organization || "").trim() || "Unspecified";
    if (!orgMap[org]) orgMap[org] = 0;
    orgMap[org]++;
  });

  // Sort by count descending
  const orgList = Object.entries(orgMap).sort((a, b) => b[1] - a[1]);
  const maxCount = orgList.length > 0 ? orgList[0][1] : 1;

  // Accent colors cycling
  const ORG_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];

  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Organization Clients</span>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{orgList.length} org{orgList.length !== 1 ? "s" : ""}</span>
      </div>

      {orgList.length === 0 ? (
        <div style={{ padding: "20px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No client data available</div>
      ) : orgList.map(([org, count], idx) => {
        const color = ORG_COLORS[idx % ORG_COLORS.length];
        const barPct = Math.round((count / maxCount) * 100);
        return (
          <div key={org} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: idx < orgList.length - 1 ? "1px solid #f8fafc" : "none" }}>
            {/* Color dot */}
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0 }} />
            {/* Org name */}
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", minWidth: 90, flex: 1 }}>{org}</div>
            {/* Bar */}
            <div style={{ flex: 2, background: "#f1f5f9", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${barPct}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.4s ease" }} />
            </div>
            {/* Count badge */}
            <div style={{ minWidth: 32, textAlign: "right" }}>
              <span style={{ display: "inline-block", background: `${color}18`, color: color, fontSize: 12, fontWeight: 800, padding: "2px 9px", borderRadius: 20 }}>
                {count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const arrowBtnStyle = { background: "none", border: "1px solid #e2e8f0", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "#64748b", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dash");
  const [works, setWorks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const user    = JSON.parse(localStorage.getItem("cao_user") || '{"name":"Guest","role":"Staff"}');
  const isCA    = user.role === "CA";

  function filterByRole(allWorks) { return isCA ? allWorks : allWorks.filter(w => w.assignedTo === user.name); }

  useEffect(() => {
    Promise.all([axios.get(`${API}/works`), axios.get(`${API}/attendance/all`)])
      .then(([worksRes, attRes]) => { setWorks(filterByRole(worksRes.data || [])); setAttendance(attRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const navItems = [
    { key: "dash",     label: "Dash",    icon: ICONS.dash },
    { key: "works",    label: "Works",   icon: ICONS.works,    dot: works.some(w => w.status !== "Completed") },
    { key: "clients",  label: "Clients", icon: ICONS.clients },
    { key: "finance",  label: "Finance", icon: ICONS.finance },
    { key: "add",      label: "Add",     icon: ICONS.add },
    { key: "attend",   label: "Attend",  icon: ICONS.attend },
    { key: "reimb",    label: "Reimb",   icon: ICONS.reimb },
    { key: "invoice",  label: "Invoice", icon: ICONS.invoice },
    { key: "settings", label: "Settings",icon: ICONS.settings },
  ];

  const NAV_ROUTES = { dash: "/dashboard", works: "/works", clients: "/clients", finance: "/finance", add: "/add-client", attend: "/attendance", reimb: "/reimbursement", invoice: "/invoice", settings: "/settings" };

  function handleNav(key) { const route = NAV_ROUTES[key]; if (route) navigate(route); }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f1f5f9", overflow: "hidden" }}>
      <style>{MOBILE_CSS}</style>

      {/* Desktop Sidebar */}
      <aside className="ca-sidebar" style={{ width: 72, background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 2, flexShrink: 0, overflowY: "auto" }}>
        {navItems.map((n) => <NavItem key={n.key} label={n.label} iconPath={n.icon} active={activeNav === n.key} dot={n.dot} onClick={() => handleNav(n.key)} />)}
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header className="ca-header" style={{ height: 54, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div><span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>CA </span><span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>Office</span></div>
            <div style={{ background: "#1e3a5f", color: "#60a5fa", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>{user.role}</div>
            <div className="ca-header-name" style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{user.name.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #334155", borderRadius: 8, color: "#94a3b8", padding: "5px 12px", cursor: "pointer", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" }}
              onClick={() => { setLoading(true); Promise.all([axios.get(`${API}/works`), axios.get(`${API}/attendance/all`)]).then(([w, a]) => { setWorks(filterByRole(w.data || [])); setAttendance(a.data || []); }).finally(() => setLoading(false)); }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> Sync
            </button>
            <button onClick={() => { localStorage.removeItem("cao_user"); navigate("/"); }}
              style={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#94a3b8", padding: "6px 10px", cursor: "pointer", fontSize: 12, fontFamily: "'Segoe UI', sans-serif", fontWeight: 600 }}>
              Out
            </button>
          </div>
        </header>

        <div className="ca-content-wrap ca-main" style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Main scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }} className="ca-page-pad">
            {loading ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px 0", fontSize: 14 }}>Loading dashboard…</div>
            ) : (
              <>
                {!isCA && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>Staff View — {user.name}</div>
                      <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 1 }}>Showing only works assigned to you</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#2563eb", background: "#dbeafe", padding: "4px 10px", borderRadius: 20 }}>
                      {works.filter(w => w.status !== "Completed").length} active
                    </div>
                  </div>
                )}
                <DueSummaryCards works={works} />
                <TodoSection works={works} />
                <WorkCalendar works={works} />
                <AttendanceSection attendance={attendance} />
                {/* ← OrganizationClients replaces PendingVerification */}
                <OrganizationClients works={works} />
              </>
            )}
          </div>

          {/* Right panel (desktop only) */}
          <div className="ca-right-panel" style={{ width: 310, overflowY: "auto", padding: 16, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }}>
            {!loading && (<><TasksPanel works={works} /><TaskSummary works={works} /></>)}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="ca-bottom-nav">
        <div className="ca-bottom-nav-inner">
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
  );
}
