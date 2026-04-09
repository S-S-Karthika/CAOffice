import React, { useState, useEffect, useRef } from "react";
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
  dash:      "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  works:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  clients:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  finance:   "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  add:       "M12 5v14M5 12h14",
  attend:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87",
  cal:       "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  reimb:     "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  settings:  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  close:     "M18 6L6 18M6 6l12 12",
  invoice:   "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  check:     "M20 6L9 17l-5-5",
  trash:     "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
  rupee:     "M6 3h12M6 8h12M6 13h8M10 13v8",
  print:     "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z",
  chevDown:  "M6 9l6 6 6-6",
  chevRight: "M9 18l6-6-6-6",
  users:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z",
  cal2:      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  tick:      "M20 6L9 17l-5-5",
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Pending":      { color: "#f59e0b", bg: "#fef3c7", text: "#d97706", border: "#fcd34d" },
  "In Progress":  { color: "#3b82f6", bg: "#dbeafe", text: "#2563eb", border: "#93c5fd" },
  "Under Review": { color: "#8b5cf6", bg: "#ede9fe", text: "#7c3aed", border: "#c4b5fd" },
  "On Hold":      { color: "#94a3b8", bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" },
  "Completed":    { color: "#10b981", bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
};
const STATUS_LIST = ["Pending", "In Progress", "Under Review", "On Hold", "Completed"];

const AV_COLORS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
function Avatar({ name = "?", size = 30 }) {
  const bg = AV_COLORS[(String(name).charCodeAt(0) || 0) % AV_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.38, fontWeight: 700 }}>
      {String(name)[0]?.toUpperCase() || "?"}
    </div>
  );
}

function NavItem({ label, iconPath, active, onClick, dot }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 3, padding: "9px 0", border: "none", background: "none",
      cursor: "pointer", width: "100%", position: "relative",
      color: active ? "#3b82f6" : "#94a3b8", fontFamily: "'Segoe UI', sans-serif",
    }}>
      {dot && <span style={{ position: "absolute", top: 8, right: 10, width: 7, height: 7, borderRadius: "50%", background: "#3b82f6" }} />}
      <Icon d={iconPath} size={21} stroke={active ? "#3b82f6" : "#94a3b8"} />
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
      {active && <div style={{ position: "absolute", left: 0, top: "15%", height: "70%", width: 3, borderRadius: "0 3px 3px 0", background: "#3b82f6" }} />}
    </button>
  );
}

// ─── Inline Status Dropdown — saves directly to DB ────────────────────────────
function StatusDropdown({ work, onStatusChange }) {
  const [open, setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]  = useState(false);
  const ref = useRef(null);
  const cfg = STATUS_CFG[work.status] || STATUS_CFG["Pending"];

  useEffect(() => {
    function outside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  async function pick(newStatus) {
    if (newStatus === work.status) { setOpen(false); return; }
    setOpen(false);
    setSaving(true);
    try {
      await axios.patch(`${API}/works/${work.id}`, { status: newStatus });
      onStatusChange(work.id, newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch { alert("Failed to update status"); }
    finally { setSaving(false); }
  }

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={e => { e.stopPropagation(); !saving && setOpen(o => !o); }}
        disabled={saving}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px 4px 8px", borderRadius: 20,
          background: saved ? "#d1fae5" : cfg.bg,
          color: saved ? "#059669" : cfg.text,
          border: `1.5px solid ${saved ? "#6ee7b7" : cfg.border}`,
          fontSize: 11, fontWeight: 700, cursor: saving ? "default" : "pointer",
          fontFamily: "'Segoe UI', sans-serif",
          transition: "all 0.2s", whiteSpace: "nowrap",
          opacity: saving ? 0.6 : 1,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: saved ? "#059669" : cfg.color, flexShrink: 0 }} />
        {saving ? "Saving…" : saved ? "Saved ✓" : work.status}
        {!saving && !saved && <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 1 }}>▾</span>}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 5px)", right: 0,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
          boxShadow: "0 8px 28px rgba(0,0,0,0.14)", zIndex: 300,
          overflow: "hidden", minWidth: 170,
        }}>
          <div style={{ padding: "7px 12px 5px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #f1f5f9" }}>
            Change Status
          </div>
          {STATUS_LIST.map(s => {
            const c = STATUS_CFG[s];
            const isActive = work.status === s;
            return (
              <div key={s}
                onClick={e => { e.stopPropagation(); pick(s); }}
                style={{ padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, background: isActive ? c.bg : "#fff", transition: "background 0.1s" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "#fff"; }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? c.text : "#334155", flex: 1 }}>{s}</span>
                {isActive && <Icon d={ICONS.tick} size={13} stroke={c.text} sw={2.5} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Invoice View ─────────────────────────────────────────────────────────────
function InvoiceView({ work, onClose }) {
  const user = JSON.parse(localStorage.getItem("cao_user") || '{"name":"CA"}');
  const invoiceNo = `INV-${String(work.id).padStart(3, "0")}`;
  const totalAmt  = Number(work.fees || 0) + Number(work.reimbAmt || 0);
  const fmtDate   = d => { if (!d) return "—"; const dt = new Date(d); return isNaN(dt) ? d : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); };

  function n2w(n) {
    if (!n || n === 0) return "Zero";
    const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
    const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? " "+ones[n%10] : "");
    if (n < 1000) return ones[Math.floor(n/100)] + " Hundred" + (n%100 ? " "+n2w(n%100) : "");
    if (n < 100000) return n2w(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " "+n2w(n%1000) : "");
    return n2w(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " "+n2w(n%100000) : "");
  }

  const print = () => {
    const c = document.getElementById("inv-body").innerHTML;
    const w = window.open("","_blank");
    w.document.write(`<html><head><title>Invoice ${invoiceNo}</title><style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:24px;color:#1e293b;}*{box-sizing:border-box;}table{width:100%;border-collapse:collapse;}th,td{padding:10px 14px;text-align:left;border-bottom:1px solid #e2e8f0;}th{background:#f8fafc;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;}</style></head><body>${c}</body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:700, display:"flex", alignItems:"flex-start", justifyContent:"center", overflowY:"auto", padding:"20px 16px" }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:720, boxShadow:"0 24px 64px rgba(0,0,0,0.25)", marginBottom:40 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc", borderRadius:"16px 16px 0 0" }}>
          <span style={{ fontWeight:700, fontSize:14, color:"#1e293b" }}>Invoice — {invoiceNo}</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={print} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"#0f172a", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Segoe UI',sans-serif" }}>
              <Icon d={ICONS.print} size={14} stroke="#fff" /> Print / PDF
            </button>
            <button onClick={onClose} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Segoe UI',sans-serif" }}>
              <Icon d={ICONS.close} size={14} /> Close
            </button>
          </div>
        </div>
        <div id="inv-body" style={{ padding:"32px 36px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, paddingBottom:24, borderBottom:"2px solid #e2e8f0" }}>
            <div>
              <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:3 }}>CA {user.name} & Associates</div>
              <div style={{ fontSize:12, color:"#64748b" }}>Tamil Nadu, India</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ background:"#fef3c7", color:"#d97706", fontSize:11, fontWeight:800, padding:"5px 14px", borderRadius:6, display:"inline-block", marginBottom:8 }}>TAX INVOICE</div>
              <div style={{ display:"grid", gridTemplateColumns:"auto auto", gap:"3px 16px", fontSize:12 }}>
                <span style={{ color:"#94a3b8", fontWeight:600 }}>INVOICE NO.</span><span style={{ color:"#1e293b", fontWeight:700 }}>{invoiceNo}</span>
                <span style={{ color:"#94a3b8", fontWeight:600 }}>DATE</span><span style={{ color:"#1e293b", fontWeight:700 }}>{fmtDate(new Date().toISOString())}</span>
                <span style={{ color:"#94a3b8", fontWeight:600 }}>DUE</span><span style={{ color:"#1e293b", fontWeight:700 }}>{fmtDate(work.expectedCompletion)}</span>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>
            <div style={{ background:"#f8fafc", borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Bill To</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#0f172a", marginBottom:4 }}>{work.clientName}</div>
              {work.pan      && <div style={{ fontSize:12, color:"#64748b" }}>PAN: {work.pan}</div>}
              {work.contactNo && <div style={{ fontSize:12, color:"#64748b" }}>Contact: {work.contactNo}</div>}
            </div>
            <div style={{ background:"#f8fafc", borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Service Details</div>
              {[["Work Type",work.workNature],["Reference",work.referenceNo||"—"],["Period",work.month],["Assigned",work.assignedTo]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:"#64748b" }}>{k}:</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#1e293b" }}>{v||"—"}</span>
                </div>
              ))}
            </div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["S.NO","Description","Reference","Amount (₹)"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:h==="Amount (₹)"?"right":"left", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding:"12px 14px", fontSize:13, borderBottom:"1px solid #f1f5f9", color:"#64748b" }}>1</td>
                <td style={{ padding:"12px 14px", borderBottom:"1px solid #f1f5f9" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>{work.workNature}</div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{work.referenceNo||""} · {work.month||""}</div>
                </td>
                <td style={{ padding:"12px 14px", fontSize:13, borderBottom:"1px solid #f1f5f9", color:"#475569" }}>{work.referenceNo||"—"}</td>
                <td style={{ padding:"12px 14px", textAlign:"right", fontSize:13, fontWeight:700, color:"#1e293b", borderBottom:"1px solid #f1f5f9" }}>₹{Number(work.fees||0).toLocaleString("en-IN")}</td>
              </tr>
              {Number(work.reimbAmt||0) > 0 && (
                <tr>
                  <td style={{ padding:"12px 14px", fontSize:13, borderBottom:"1px solid #f1f5f9", color:"#64748b" }}>2</td>
                  <td style={{ padding:"12px 14px", borderBottom:"1px solid #f1f5f9" }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>Reimbursement</div>
                    <div style={{ fontSize:11, color:"#94a3b8" }}>Tax payments on behalf of client</div>
                  </td>
                  <td style={{ padding:"12px 14px", fontSize:13, borderBottom:"1px solid #f1f5f9", color:"#475569" }}>—</td>
                  <td style={{ padding:"12px 14px", textAlign:"right", fontSize:13, fontWeight:700, color:"#1e293b", borderBottom:"1px solid #f1f5f9" }}>₹{Number(work.reimbAmt||0).toLocaleString("en-IN")}</td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}>
            <div style={{ width:280 }}>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 14px", fontSize:13, color:"#64748b" }}><span>Professional Fees</span><span>₹{Number(work.fees||0).toLocaleString("en-IN")}</span></div>
              {Number(work.reimbAmt||0)>0 && <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 14px", fontSize:13, color:"#64748b" }}><span>Reimbursements</span><span>₹{Number(work.reimbAmt||0).toLocaleString("en-IN")}</span></div>}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 14px", background:"#0f172a", borderRadius:8, fontSize:15, fontWeight:800, color:"#fff" }}><span>Total Amount</span><span>₹{totalAmt.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
          <div style={{ background:"#f8fafc", border:"1px dashed #e2e8f0", borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
            <span style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>Amount in Words: </span>
            <span style={{ fontSize:12, color:"#1e293b", fontStyle:"italic" }}>{n2w(totalAmt)} Rupees Only</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, paddingTop:20, borderTop:"1px solid #e2e8f0" }}>
            <div>
              <div style={{ fontSize:13, color:"#1e293b", fontFamily:"monospace" }}>Contact firm for details</div>
              <div style={{ marginTop:10, fontSize:11, color:"#94a3b8" }}>Terms: Payment due within 15 days. Thank you for your business!</div>
            </div>
            <div style={{ textAlign:"right", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:22 }}>Authorised Signatory</div>
              <div style={{ borderTop:"1px solid #334155", paddingTop:8 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>CA {user.name}</div>
                <div style={{ fontSize:12, color:"#64748b" }}>CA {user.name} & Associates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────
function RecordPaymentModal({ work, onClose, onSaved }) {
  const [form, setForm] = useState({ amount: work.fees||0, mode:"Bank Transfer", date:new Date().toISOString().split("T")[0], reference:"" });
  const [saving, setSaving] = useState(false);
  const inp = { width:"100%", padding:"10px 13px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, fontFamily:"'Segoe UI',sans-serif", color:"#1e293b", outline:"none", boxSizing:"border-box" };

  async function confirm() {
    setSaving(true);
    try {
      await axios.patch(`${API}/works/${work.id}`, { feesReceived:1, feesReceivedAmt:form.amount, feesReceivedMode:form.mode, feesReceivedDate:form.date, feesReceivedRef:form.reference });
      onSaved(work.id, { feesReceived:1, feesReceivedAmt:form.amount, feesReceivedMode:form.mode });
      onClose();
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, width:420, padding:28, boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <span style={{ fontSize:17, fontWeight:800, color:"#1e293b" }}>Record Payment</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}><Icon d={ICONS.close} size={20} /></button>
        </div>
        {[["Amount (Rs.)","number","amount",form.amount,""],["Mode","text","mode",form.mode,"Bank Transfer, Cash, UPI…"],["Date","date","date",form.date,""],["Reference","text","reference",form.reference,"UTR or note"]].map(([lb,type,key,val,ph])=>(
          <div key={key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>{lb}</label>
            <input style={inp} type={type} value={val} placeholder={ph} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} />
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:8 }}>
          <button onClick={onClose} style={{ padding:"12px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#475569", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"'Segoe UI',sans-serif" }}>Cancel</button>
          <button onClick={confirm} disabled={saving} style={{ padding:"12px", borderRadius:9, border:"none", background:"#16a34a", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"'Segoe UI',sans-serif" }}>{saving?"Saving…":"Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Work Detail Modal ────────────────────────────────────────────────────────
function WorkDetailModal({ work: init, staffList, caList, onClose, onSaved }) {
  const [work, setWork]         = useState({...init});
  const [saving, setSaving]     = useState(false);
  const [showInvoice, setInv]   = useState(false);
  const [showPayment, setPay]   = useState(false);
  const user = JSON.parse(localStorage.getItem("cao_user")||'{"name":"CA","role":"CA"}');
  const isCA = user.role === "CA";

  const inp  = { width:"100%", padding:"10px 13px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, fontFamily:"'Segoe UI',sans-serif", color:"#1e293b", background:"#fff", outline:"none", boxSizing:"border-box" };
  const lbl  = { fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4, display:"block" };
  const row2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 };

  async function save() {
    setSaving(true);
    try {
      const payload = { status:work.status, assignedTo:work.assignedTo, expectedCompletion:work.expectedCompletion, fees:work.fees, reimbAmt:work.reimbAmt, referenceNo:work.referenceNo, reviewedBy:work.reviewedBy, completedBy:work.completedBy, completionRemarks:work.completionRemarks, invoiceGenerated:work.invoiceGenerated, invoiceSent:work.invoiceSent, notes:work.notes, priority:work.priority };
      await axios.patch(`${API}/works/${work.id}`, payload);
      onSaved(work.id, work);
      onClose();
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  async function del() {
    if (!window.confirm(`Delete "${work.workNature}" for ${work.clientName}? This cannot be undone.`)) return;
    try { await axios.delete(`${API}/works/${work.id}`); onSaved(work.id, null); onClose(); }
    catch { alert("Failed to delete"); }
  }

  if (showInvoice) return <InvoiceView work={work} onClose={()=>setInv(false)} />;
  if (showPayment) return <RecordPaymentModal work={work} onClose={()=>setPay(false)} onSaved={(id,data)=>{ onSaved(id,{...work,...data}); }} />;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:600, display:"flex", alignItems:"flex-start", justifyContent:"center", overflowY:"auto", padding:"20px 16px" }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:580, boxShadow:"0 24px 64px rgba(0,0,0,0.22)", marginBottom:40 }}>
        <div style={{ background:"#0f172a", borderRadius:"16px 16px 0 0", padding:"18px 22px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:19, fontWeight:800, color:"#fff", marginBottom:3 }}>{work.clientName}</div>
            <div style={{ fontSize:13, color:"#94a3b8" }}>{work.workNature} · {work.month}</div>
          </div>
          <button onClick={onClose} style={{ background:"#1e293b", border:"none", borderRadius:8, color:"#94a3b8", padding:8, cursor:"pointer", display:"flex" }}><Icon d={ICONS.close} size={18} /></button>
        </div>

        <div style={{ padding:"20px 22px" }}>
          {/* Status pills */}
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Status</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {STATUS_LIST.map(s => {
                const c = STATUS_CFG[s];
                return (
                  <button key={s} type="button" onClick={()=>setWork(p=>({...p,status:s}))} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${work.status===s?c.color:"#e2e8f0"}`, background:work.status===s?c.bg:"#fff", color:work.status===s?c.text:"#64748b", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Segoe UI',sans-serif" }}>{s}</button>
                );
              })}
            </div>
          </div>

          <div style={row2}>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Work Type</label>
              <div style={{...inp, background:"#f8fafc", color:"#64748b"}}>{work.workNature}</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Reference No.</label>
              <input style={inp} value={work.referenceNo||""} onChange={e=>setWork(p=>({...p,referenceNo:e.target.value}))} placeholder="Ref number" />
            </div>
          </div>

          <div style={row2}>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Assigned To</label>
              <select style={inp} value={work.assignedTo||""} onChange={e=>setWork(p=>({...p,assignedTo:e.target.value}))}>
                <option value="">— Select —</option>
                {caList.map(n=><option key={n}>{n}</option>)}
                {staffList.map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Due Date</label>
              <input type="date" style={inp} value={work.expectedCompletion||""} onChange={e=>setWork(p=>({...p,expectedCompletion:e.target.value}))} />
            </div>
          </div>

          {/* Completion block */}
          <div style={{ background:"#f8fafc", borderRadius:10, padding:14, marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Completion</div>
            <div style={{ marginBottom:10 }}>
              <label style={lbl}>Completed By</label>
              <input style={inp} value={work.completedBy||""} onChange={e=>setWork(p=>({...p,completedBy:e.target.value}))} placeholder="Name of person who completed" />
            </div>
            <div>
              <label style={lbl}>Remarks</label>
              <textarea style={{...inp,resize:"vertical",minHeight:56}} value={work.completionRemarks||""} onChange={e=>setWork(p=>({...p,completionRemarks:e.target.value}))} placeholder="Any remarks…" />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
            <button onClick={save} disabled={saving} style={{ padding:"11px 6px", borderRadius:9, border:"none", background:"#0f172a", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:12, fontFamily:"'Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <Icon d={ICONS.check} size={13} stroke="#fff" sw={2.5} />{saving?"Saving…":"Save"}
            </button>
            <button onClick={()=>setInv(true)} style={{ padding:"11px 6px", borderRadius:9, border:"none", background:"#3b82f6", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:12, fontFamily:"'Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <Icon d={ICONS.invoice} size={13} stroke="#fff" />Invoice
            </button>
            <button onClick={()=>setPay(true)} style={{ padding:"11px 6px", borderRadius:9, border:"none", background:"#16a34a", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:12, fontFamily:"'Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
              <Icon d={ICONS.rupee} size={13} stroke="#fff" />Fees ✓
            </button>
            {isCA && (
              <button onClick={del} style={{ padding:"11px 6px", borderRadius:9, border:"none", background:"#dc2626", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:12, fontFamily:"'Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                <Icon d={ICONS.trash} size={13} stroke="#fff" />Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Client Group (collapsible) ───────────────────────────────────────────────
function ClientGroup({ groupKey, works, expanded, onToggle, onStatusChange, onWorkUpdate, onWorkDelete, onAddWork, staffList, caList, isMonthGroup }) {
  const [selectedWork, setSelectedWork] = useState(null);

  const active  = works.filter(w => w.status !== "Completed");
  const done    = works.filter(w => w.status === "Completed");
  const sorted  = [...active, ...done];
  const allDone = works.length > 0 && works.every(w => w.status === "Completed");
  const pendingFees = active.reduce((s, w) => s + Number(w.fees || 0), 0);
  const inProgress  = works.filter(w => w.status === "In Progress").length;
  const pendingCt   = works.filter(w => w.status === "Pending" || w.status === "On Hold").length;

  function handleSaved(id, updated) {
    if (!updated) onWorkDelete(id);
    else onWorkUpdate(id, updated);
  }

  return (
    <div style={{ marginBottom:10, borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

      {/* ── Group header ── */}
      <div
        onClick={onToggle}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", background:"#f8fafc", cursor:"pointer", userSelect:"none", borderBottom: expanded ? "1px solid #e2e8f0" : "none", transition:"background 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
        onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {!isMonthGroup
            ? <Avatar name={groupKey} size={36} />
            : (
              <div style={{ width:36, height:36, borderRadius:9, background:"#e0f2fe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon d={ICONS.cal2} size={18} stroke="#0284c7" />
              </div>
            )
          }
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>{groupKey}</div>
            <div style={{ fontSize:11, color:"#64748b", marginTop:1 }}>
              {works.length} work{works.length!==1?"s":""}
              {pendingFees > 0 && <span style={{ color:"#ef4444", marginLeft:6 }}>· ₹{pendingFees.toLocaleString("en-IN")} pending fees</span>}
              {allDone && <span style={{ color:"#10b981", marginLeft:6 }}>· All completed</span>}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          {inProgress > 0  && <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:10, background:"#dbeafe", color:"#2563eb" }}>{inProgress} active</span>}
          {pendingCt > 0   && <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:10, background:"#fef3c7", color:"#d97706" }}>{pendingCt} pending</span>}
          {allDone         && <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:10, background:"#d1fae5", color:"#059669" }}>✓ Clear</span>}
          <Icon d={expanded ? ICONS.chevDown : ICONS.chevRight} size={16} stroke="#94a3b8" />
        </div>
      </div>

      {/* ── Works rows ── */}
      {expanded && (
        <>
          {sorted.map((w, idx) => {
            const isDone = w.status === "Completed";
            const cfg    = STATUS_CFG[w.status] || STATUS_CFG["Pending"];
            return (
              <div key={w.id} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"11px 16px 11px 54px", gap:10,
                borderBottom: idx < sorted.length-1 ? "1px solid #f8fafc" : "none",
                background: isDone ? "#fafafa" : "#fff",
                borderLeft: `3px solid ${cfg.color}`,
                opacity: isDone ? 0.72 : 1,
              }}>
                {/* Work info — click title to open detail modal */}
                <div style={{ flex:1, cursor:"pointer", minWidth:0 }} onClick={()=>setSelectedWork(w)}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:13, fontWeight:600, color: isDone ? "#64748b" : "#1e293b" }}>{w.workNature}</span>
                    {w.priority === "Urgent" && <span style={{ fontSize:10, fontWeight:700, color:"#dc2626", background:"#fee2e2", padding:"1px 6px", borderRadius:4 }}>URGENT</span>}
                    {w.feesReceived ? <span style={{ fontSize:10, fontWeight:700, color:"#059669", background:"#d1fae5", padding:"1px 6px", borderRadius:4 }}>✓ Paid</span> : null}
                    {isMonthGroup && w.clientName && <span style={{ fontSize:11, color:"#475569", fontWeight:600 }}>{w.clientName}</span>}
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginTop:3, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                    {w.assignedTo && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Avatar name={w.assignedTo} size={14} />{w.assignedTo}</span>}
                    {w.expectedCompletion && <span style={{ display:"flex", alignItems:"center", gap:3 }}><Icon d={ICONS.cal2} size={11} stroke="#94a3b8" />{w.expectedCompletion}</span>}
                    {Number(w.fees||0) > 0 && <span>₹{Number(w.fees).toLocaleString("en-IN")}</span>}
                    {!isMonthGroup && w.month && <span style={{ background:"#f1f5f9", padding:"1px 6px", borderRadius:4 }}>{w.month}</span>}
                  </div>
                </div>

                {/* Inline status dropdown — saves to DB on select */}
                <StatusDropdown
                  work={w}
                  onStatusChange={(id, newStatus) => onWorkUpdate(id, {...w, status:newStatus})}
                />
              </div>
            );
          })}

          {/* Add work for this client / month */}
          {!isMonthGroup && (
            <div onClick={()=>onAddWork(groupKey)}
              style={{ padding:"10px 16px 10px 54px", background:"#f8fafc", borderTop:"1px dashed #e2e8f0", cursor:"pointer", display:"flex", alignItems:"center", gap:7, color:"#3b82f6", fontSize:12, fontWeight:600, transition:"background 0.12s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#eff6ff"}
              onMouseLeave={e=>e.currentTarget.style.background="#f8fafc"}
            >
              <Icon d={ICONS.add} size={14} stroke="#3b82f6" sw={2.5} />
              Add work for {groupKey}
            </div>
          )}
        </>
      )}

      {/* Work detail modal */}
      {selectedWork && (
        <WorkDetailModal
          work={selectedWork}
          staffList={staffList}
          caList={caList}
          onClose={()=>setSelectedWork(null)}
          onSaved={(id, updated) => { handleSaved(id, updated); setSelectedWork(null); }}
        />
      )}
    </div>
  );
}

// ─── Add Work Quick Modal ─────────────────────────────────────────────────────
function AddWorkQuickModal({ prefillClient, staffList, caList, onClose, onSaved }) {
  const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const curMonth    = `${MONTHS_LIST[new Date().getMonth()]} ${new Date().getFullYear()}`;
  const WORK_TYPES  = ["ITR Filing (Individual)","ITR Filing (Business)","ITR Filing (Firm/LLP)","GST Return (GSTR-1)","GST Return (GSTR-3B)","GST Return (GSTR-9)","GST Registration","Statutory Audit (TNCS)","Tax Audit (3CD)","MCA / ROC Filing","Company Incorporation","TDS Return (24Q)","TDS Return (26Q)","Net Worth Certificate","Projected P&L","Accounting / Bookkeeping","Loan Processing","Other"];

  const [form, setForm]   = useState({ clientName:prefillClient||"", workNature:"", month:curMonth, assignedTo:"", dueDate:"", priority:"Normal", fees:"", notes:"" });
  const [saving, setSaving] = useState(false);
  const handle = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const inp = { width:"100%", padding:"10px 13px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, fontFamily:"'Segoe UI',sans-serif", color:"#1e293b", background:"#fff", outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:5 };

  async function save() {
    if (!form.clientName.trim()) { alert("Enter client name"); return; }
    if (!form.workNature) { alert("Select work type"); return; }
    if (!form.assignedTo) { alert("Select assigned to"); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/add-client`, { ...form, expectedCompletion:form.dueDate, documentObtained:"Yes", checklist:"Yes", status:"Pending" });
      onSaved();
    } catch { alert("Error saving work"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, width:500, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(0,0,0,0.22)" }}>
        <div style={{ background:"#0f172a", borderRadius:"16px 16px 0 0", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>Add New Work</div>
            {prefillClient && <div style={{ color:"#7ab8f5", fontSize:12, marginTop:1 }}>{prefillClient}</div>}
          </div>
          <button onClick={onClose} style={{ background:"#1e293b", border:"none", borderRadius:8, color:"#94a3b8", padding:8, cursor:"pointer", display:"flex" }}><Icon d={ICONS.close} size={18} /></button>
        </div>
        <div style={{ overflowY:"auto", padding:20 }}>
          {!prefillClient && (
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>Client Name *</label>
              <input name="clientName" value={form.clientName} onChange={handle} style={inp} placeholder="Client name" />
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Work Type *</label>
            <select name="workNature" value={form.workNature} onChange={handle} style={inp}>
              <option value="">+ Select work type</option>
              {WORK_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <div>
              <label style={lbl}>Assigned To *</label>
              <select name="assignedTo" value={form.assignedTo} onChange={handle} style={inp}>
                <option value="">— Select —</option>
                {caList.map(n=><option key={n}>{n}</option>)}
                {staffList.map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handle} style={inp} />
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <div>
              <label style={lbl}>Fees (₹)</label>
              <input type="number" name="fees" value={form.fees} onChange={handle} placeholder="0" style={inp} />
            </div>
            <div>
              <label style={lbl}>Priority</label>
              <div style={{ display:"flex", gap:6 }}>
                {["Normal","Urgent"].map(v=>(
                  <button key={v} type="button" onClick={()=>setForm(p=>({...p,priority:v}))} style={{ flex:1, padding:"10px 8px", borderRadius:8, border:"none", fontWeight:700, cursor:"pointer", fontSize:12, fontFamily:"'Segoe UI',sans-serif", background:form.priority===v?(v==="Urgent"?"#dc2626":"#0f172a"):"#f1f5f9", color:form.priority===v?"#fff":"#475569" }}>
                    {v==="Urgent"?"🔴 Urgent":"Normal"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Notes</label>
            <textarea name="notes" rows={2} value={form.notes} onChange={handle} placeholder="Any additional notes…" style={{...inp,resize:"vertical",minHeight:56}} />
          </div>
        </div>
        <div style={{ padding:"14px 20px", borderTop:"1px solid #f1f5f9", display:"flex", gap:10, flexShrink:0 }}>
          <button onClick={onClose} style={{ flex:1, padding:"11px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#475569", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"'Segoe UI',sans-serif" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex:2, padding:"11px", borderRadius:8, border:"none", background:"#0f172a", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:13, fontFamily:"'Segoe UI',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Icon d={ICONS.check} size={15} stroke="#fff" sw={2.5} />{saving?"Saving…":"Save Work"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN Works Page ──────────────────────────────────────────────────────────
export default function Works() {
  const navigate = useNavigate();
  const user  = JSON.parse(localStorage.getItem("cao_user") || '{"name":"Guest","role":"Staff"}');
  const isCA  = user.role === "CA";
  const [activeNav, setActiveNav] = useState("dash");
  const [works, setWorks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState("All");
  const [groupBy, setGroupBy]     = useState("client");  // "client" | "month"
  const [expanded, setExpanded]   = useState({});
  const [staffList, setStaffList] = useState([]);
  const [caList, setCaList]       = useState([]);
  const [addWorkFor, setAddWork]  = useState(null);      // string clientName | true

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

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/works`),
      axios.get(`${API}/api/users`).catch(()=>({data:[]})),
    ]).then(([wRes, uRes]) => {
      const all  = wRes.data || [];
      // Role-based filter: Staff sees only works assigned to them
      const visible = isCA ? all : all.filter(w => w.assignedTo === user.name);
      setWorks(visible);
      const users = uRes.data || [];
      setStaffList(users.filter(u=>u.role==="Staff").map(u=>u.name));
      setCaList(users.filter(u=>u.role==="CA").map(u=>u.name));
      // Auto-expand all groups
      const exp = {};
      visible.forEach(w => {
        const k = w.clientName || "Unknown";
        exp[k] = true;
      });
      setExpanded(exp);
    }).catch(console.error).finally(()=>setLoading(false));
  };

  useEffect(()=>{ fetchAll(); },[]);

  // ── Local state mutations — no full refetch ─────────────────────────────────
  const handleStatusChange = (id, newStatus) =>
    setWorks(prev => prev.map(w => w.id===id ? {...w, status:newStatus} : w));

  const handleWorkUpdate = (id, updated) =>
    setWorks(prev => prev.map(w => w.id===id ? {...w,...updated} : w));

  const handleWorkDelete = id =>
    setWorks(prev => prev.filter(w => w.id!==id));

  // ── Filter ──────────────────────────────────────────────────────────────────
  const q = search.toLowerCase().trim();
  const filtered = works.filter(w => {
    const okStatus = filterStatus==="All" || w.status===filterStatus;
    const okSearch = !q || w.clientName?.toLowerCase().includes(q) || w.workNature?.toLowerCase().includes(q) || w.assignedTo?.toLowerCase().includes(q) || w.month?.toLowerCase().includes(q);
    return okStatus && okSearch;
  });

  // ── Group ───────────────────────────────────────────────────────────────────
  const groups = {};
  filtered.forEach(w => {
    const key = groupBy==="client" ? (w.clientName||"Unknown") : (w.month||"No Month");
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });

  const sortedKeys = Object.keys(groups).sort((a,b) => {
    if (groupBy==="month") {
      const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const parse = s => { const parts=s.split(" "); return (parseInt(parts[1])||0)*12+(MONTHS_LIST.indexOf(parts[0])||0); };
      return parse(b)-parse(a);
    }
    return a.localeCompare(b);
  });

  // ── Status counts ───────────────────────────────────────────────────────────
  const ALL_STATUSES = ["All","Pending","In Progress","Under Review","On Hold","Completed"];
  const counts = {};
  ALL_STATUSES.forEach(s => { counts[s] = s==="All" ? works.length : works.filter(w=>w.status===s).length; });

  const toggleGroup  = key => setExpanded(p=>({...p,[key]:!p[key]}));
  const expandAll    = ()  => { const e={}; sortedKeys.forEach(k=>e[k]=true);  setExpanded(e); };
  const collapseAll  = ()  => { const e={}; sortedKeys.forEach(k=>e[k]=false); setExpanded(e); };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Segoe UI', sans-serif", background:"#f1f5f9", overflow:"hidden" }}>

      {/* Sidebar */}
      <aside style={{ width: 72, background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 2, flexShrink: 0, overflowY: "auto" }}>
        {navItems.map(n => (
          <NavItem key={n.key} label={n.label} iconPath={n.icon} active={n.key === activeNav} dot={n.dot} onClick={() => handleNav(n.key)} />
        ))}
      </aside>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Topbar */}
        <header style={{ height:54, background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div><span style={{ color:"#fff", fontWeight:700, fontSize:16 }}>CA </span><span style={{ color:"#3b82f6", fontWeight:700, fontSize:16 }}>Office</span></div>
            <div style={{ background:"#1e3a5f", color:"#60a5fa", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6 }}>{user.role}</div>
            <div style={{ color:"#fff", fontSize:12, fontWeight:600 }}>{user.name.toUpperCase()}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {isCA && (
              <button onClick={()=>setAddWork(true)} style={{ display:"flex", alignItems:"center", gap:6, background:"#3b82f6", border:"none", borderRadius:8, color:"#fff", padding:"6px 14px", cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"'Segoe UI',sans-serif" }}>
                <Icon d={ICONS.add} size={15} stroke="#fff" sw={2.5} /> Add Work
              </button>
            )}
            <button onClick={fetchAll} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"1px solid #334155", borderRadius:8, color:"#94a3b8", padding:"5px 14px", cursor:"pointer", fontSize:13, fontFamily:"'Segoe UI',sans-serif" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#10b981", display:"inline-block" }} /> Sync
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 20px 0", flexShrink:0 }}>

            {/* Title + group toggle */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <div style={{ fontSize:21, fontWeight:700, color:"#1e293b" }}>Works</div>
                <div style={{ fontSize:13, color:"#64748b" }}>
                  {filtered.length} work{filtered.length!==1?"s":""} · {sortedKeys.length} {groupBy==="client"?"client":"month"}{sortedKeys.length!==1?"s":""}
                  {!isCA && <span style={{ marginLeft:8, color:"#3b82f6", fontWeight:600 }}>· Showing your assigned works only</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:4, background:"#e2e8f0", borderRadius:8, padding:3 }}>
                {[["client","By Client",ICONS.users],["month","By Month",ICONS.cal2]].map(([val,label,icon])=>(
                  <button key={val} onClick={()=>setGroupBy(val)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:6, border:"none", background:groupBy===val?"#fff":"transparent", color:groupBy===val?"#1e293b":"#64748b", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Segoe UI',sans-serif", boxShadow:groupBy===val?"0 1px 3px rgba(0,0,0,0.1)":"none", transition:"all 0.15s" }}>
                    <Icon d={icon} size={14} stroke={groupBy===val?"#1e293b":"#94a3b8"} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <div style={{ position:"relative", marginBottom:10 }}>
              <div style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                <Icon d={ICONS.search} size={15} stroke="#94a3b8" />
              </div>
              <input type="text" placeholder="Search client, work type, staff, month…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{ width:"100%", padding:"10px 14px 10px 38px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:13, fontFamily:"'Segoe UI',sans-serif", color:"#1e293b", background:"#fff", outline:"none" }} />
              {search && <button onClick={()=>setSearch("")} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", display:"flex" }}><Icon d={ICONS.close} size={15} /></button>}
            </div>

            {/* Status filters + expand/collapse */}
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center", marginBottom:12 }}>
              {ALL_STATUSES.map(s => {
                const cfg = STATUS_CFG[s];
                const on  = filterStatus===s;
                return (
                  <button key={s} onClick={()=>setFilter(s)} style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'Segoe UI',sans-serif", border:on?`1.5px solid ${cfg?.color||"#0f172a"}`:"1.5px solid #e2e8f0", background:on?(cfg?.bg||"#0f172a"):"#fff", color:on?(cfg?.text||"#fff"):"#64748b", display:"flex", alignItems:"center", gap:4 }}>
                    {cfg && <div style={{ width:5, height:5, borderRadius:"50%", background:cfg.color }} />}
                    {s}
                    <span style={{ background:"rgba(0,0,0,0.08)", borderRadius:8, padding:"0 5px", fontSize:10 }}>{counts[s]}</span>
                  </button>
                );
              })}
              <div style={{ marginLeft:"auto", display:"flex", gap:5 }}>
                <button onClick={expandAll}   style={{ fontSize:11, padding:"5px 10px", borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", cursor:"pointer", fontFamily:"'Segoe UI',sans-serif" }}>Expand All</button>
                <button onClick={collapseAll} style={{ fontSize:11, padding:"5px 10px", borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", color:"#64748b", cursor:"pointer", fontFamily:"'Segoe UI',sans-serif" }}>Collapse All</button>
              </div>
            </div>
          </div>

          {/* Groups */}
          <div style={{ flex:1, overflowY:"auto", padding:"0 20px 24px" }}>
            {loading ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8", fontSize:14 }}>Loading works…</div>
            ) : sortedKeys.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8", fontSize:14 }}>No works found.</div>
            ) : sortedKeys.map(key => (
              <ClientGroup
                key={key}
                groupKey={key}
                works={groups[key]}
                expanded={!!expanded[key]}
                onToggle={()=>toggleGroup(key)}
                onStatusChange={handleStatusChange}
                onWorkUpdate={handleWorkUpdate}
                onWorkDelete={handleWorkDelete}
                onAddWork={name=>setAddWork(name)}
                staffList={staffList}
                caList={caList}
                isMonthGroup={groupBy==="month"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Work modal */}
      {addWorkFor && (
        <AddWorkQuickModal
          prefillClient={typeof addWorkFor==="string" ? addWorkFor : ""}
          staffList={staffList}
          caList={caList}
          onClose={()=>setAddWork(null)}
          onSaved={()=>{ fetchAll(); setAddWork(null); }}
        />
      )}
    </div>
  );
}
