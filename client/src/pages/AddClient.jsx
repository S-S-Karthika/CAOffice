import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  :root {
    --navy:#0f2744;--navy2:#1a3f6f;--navy3:#2e5f9a;
    --navy-light:#d6e8f7;--navy-xlight:#eef5fc;
    --green:#1a6b3c;--green-light:#d4edda;
    --red:#8b1c1c;--red-light:#fdecea;
    --gray-light:#f1f5f9;--gray-xlight:#f8fafc;
    --white:#ffffff;--border:#e2e8f0;
    --text:#0f172a;--text2:#334155;--text3:#64748b;
    --radius:14px;--radius-sm:10px;
    --shadow:0 2px 16px rgba(15,39,68,0.08);
    --font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  .ac-body{font-family:var(--font);background:var(--gray-xlight);color:var(--text);min-height:100vh;padding-bottom:40px;}
  .ac-topbar{background:var(--navy);color:white;padding:0 16px;height:58px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,0.25);}
  .ac-logo{font-size:17px;font-weight:700;letter-spacing:-0.4px;}
  .ac-logo span{color:#7ab8f5;}
  .ac-role-pill{font-size:10px;font-weight:700;padding:3px 10px;border-radius:99px;background:#c9933a22;color:#f0c060;border:1px solid #c9933a44;}
  .ac-page{padding:16px 16px 24px;max-width:720px;margin:0 auto;}
  .ac-card{background:white;border-radius:var(--radius);box-shadow:var(--shadow);padding:18px;margin-bottom:12px;}
  .ac-section{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;margin-top:4px;padding-bottom:6px;border-bottom:1px solid var(--border);}
  .ac-divider{height:1px;background:var(--border);margin:16px 0;}
  .ac-group{margin-bottom:14px;}
  .ac-lbl{font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px;display:block;letter-spacing:0.04em;text-transform:uppercase;}
  .ac-inp,.ac-sel,.ac-textarea{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font);font-size:13.5px;color:var(--text);background:white;outline:none;transition:border-color 0.2s;-webkit-appearance:none;appearance:none;}
  .ac-inp:focus,.ac-sel:focus,.ac-textarea:focus{border-color:var(--navy2);box-shadow:0 0 0 3px rgba(42,95,154,0.1);}
  .ac-inp[readonly],.ac-textarea[readonly]{background:var(--gray-xlight);color:var(--navy2);cursor:default;font-weight:600;}
  .ac-textarea{resize:vertical;min-height:72px;}
  .ac-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .ac-star{color:#c62828;}
  .ac-checklist{display:flex;border:1.5px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;}
  .ac-chk-opt{flex:1;padding:9px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;border:none;background:white;font-family:var(--font);color:var(--text3);transition:all 0.15s;}
  .ac-chk-opt.yes{background:var(--green-light);color:var(--green);}
  .ac-chk-opt.no{background:var(--red-light);color:var(--red);}
  .ac-priority{display:flex;gap:8px;}
  .ac-btn-normal{flex:1;padding:10px;border-radius:8px;background:var(--navy);color:white;border:none;font-weight:700;cursor:pointer;font-family:var(--font);font-size:13px;}
  .ac-btn-normal.off{background:var(--gray-light);color:var(--text2);border:1.5px solid var(--border);}
  .ac-btn-urgent{flex:1;padding:10px;border-radius:8px;background:var(--red-light);color:var(--red);border:2px solid var(--red-light);font-weight:700;cursor:pointer;font-family:var(--font);font-size:13px;}
  .ac-btn-urgent.on{background:#c62828;color:white;border-color:#c62828;}
  .ac-month-box{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font);font-size:13.5px;color:var(--text3);background:var(--gray-xlight);display:flex;align-items:center;gap:8px;}
  .ac-month-box strong{color:var(--navy2);}
  .ac-save-row{display:flex;gap:10px;flex-wrap:wrap;}
  .ac-save-btn{flex:2;padding:13px;border-radius:var(--radius-sm);background:var(--navy);color:white;border:none;font-weight:700;cursor:pointer;font-family:var(--font);font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity 0.15s;}
  .ac-save-btn:hover{background:var(--navy2);}
  .ac-clear-btn{flex:1;padding:13px;border-radius:var(--radius-sm);background:var(--gray-light);color:var(--text);border:1.5px solid var(--border);font-weight:700;cursor:pointer;font-family:var(--font);font-size:13px;}
  .ac-pending-badge{display:inline-flex;align-items:center;gap:5px;background:#fff3cd;color:#8a5a00;border:1px solid #f0c060;border-radius:6px;font-size:11px;font-weight:700;padding:5px 11px;margin-top:8px;}
  .ac-inprog-badge{display:inline-flex;align-items:center;gap:5px;background:#dbeafe;color:#1a3f6f;border:1px solid #93c5fd;border-radius:6px;font-size:11px;font-weight:700;padding:5px 11px;margin-top:8px;}
  .ac-prefill-banner{display:flex;align-items:flex-start;gap:10px;background:#d1fae5;border:1px solid #6ee7b7;border-radius:10px;padding:12px 14px;margin-bottom:16px;}
  .ac-msg{padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:12px;}
  .ac-msg.ok{background:#d1fae5;color:#065f46;border:1px solid #6ee7b7;}
  .ac-msg.warn{background:#fef3c7;color:#92400e;border:1px solid #fcd34d;}
  .ac-msg.err{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;}

  /* Multi-select work type grid */
  .ac-wt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:7px;max-height:280px;overflow-y:auto;border:1.5px solid var(--border);border-radius:var(--radius-sm);padding:10px;background:#fafbfc;}
  .ac-wt-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:background 0.12s;border:1.5px solid transparent;}
  .ac-wt-item:hover{background:#f0f6ff;}
  .ac-wt-item.selected{background:#eff6ff;border-color:#93c5fd;}
  .ac-wt-item input[type=checkbox]{width:15px;height:15px;accent-color:#2563eb;cursor:pointer;flex-shrink:0;}
  .ac-wt-item label{font-size:12.5px;font-weight:500;color:var(--text2);cursor:pointer;line-height:1.3;}
  .ac-wt-item.selected label{color:#1e40af;font-weight:700;}
  .ac-wt-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;min-height:28px;}
  .ac-wt-tag{display:inline-flex;align-items:center;gap:4px;background:#dbeafe;color:#1e40af;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;}
  .ac-wt-tag button{background:none;border:none;cursor:pointer;color:#1e40af;font-size:13px;line-height:1;padding:0;display:flex;}
  .ac-wt-count{font-size:11px;color:var(--text3);margin-top:4px;}

  @media(max-width:520px){
    .ac-row2{grid-template-columns:1fr;}
    .ac-wt-grid{grid-template-columns:1fr;}
    .ac-page{padding:12px 12px 24px;}
    .ac-topbar{padding:0 12px;}
    .ac-card{padding:14px;}
    .ac-save-btn{font-size:13px;}
    .ac-priority{flex-direction:column;}
    .ac-priority button{width:100%;}
  }
  @media(max-width:360px){
    .ac-logo{font-size:14px;}
    .ac-page h2{font-size:17px;}
  }

`;

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const WORK_CATEGORIES = [
  { group: "ITR Filing",
    items: ["ITR Filing (Individual)","ITR Filing (Business)","ITR Filing (Firm/LLP)","ITR Filing (HUF)","ITR Filing (Trust/NGO)"] },
  { group: "GST",
    items: ["GST Return (GSTR-1)","GST Return (GSTR-3B)","GST Return (GSTR-9)","GST Return (GSTR-9C)","GST Registration","GST Cancellation","GST Reconciliation","GST Amendment"] },
  { group: "TDS / TCS",
    items: ["TDS Return (24Q)","TDS Return (26Q)","TDS Return (27Q)","TCS Return (27EQ)","TDS Certificate (Form 16)","TDS Certificate (Form 16A)"] },
  { group: "Audit",
    items: ["Statutory Audit","Tax Audit (3CD)","Internal Audit","Concurrent Audit","Stock Audit","Transfer Pricing Audit"] },
  { group: "Company / LLP",
    items: ["MCA / ROC Filing","Company Incorporation","LLP Incorporation","Annual Return Filing","DIN / DSC Work","Director KYC"] },
  { group: "Accounting",
    items: ["Accounting / Bookkeeping","Payroll Processing","Bank Reconciliation","MIS Reports","Projected P&L","CMA Data Preparation"] },
  { group: "Finance & Loans",
    items: ["Loan Processing","Project Report","Net Worth Certificate","CC / OD Renewal","MSME Registration","Udyam Registration"] },
  { group: "Certificates & Notices",
    items: ["Income Certificate","Tax Clearance Certificate","IT Notice Reply","GST Notice Reply","Demand / Scrutiny Handling"] },
  { group: "Other",
    items: ["PAN Application","Aadhaar Linking","Form 15CA/CB","Trust Registration","Society Registration","Other"] },
];

const ORGANIZATION_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Partnership",
  "Private Limited Company",
  "Public Limited Company",
  "One-Person Company",
  "Section 8 Company",
  "Joint-Venture Company",
  "Non-Government Organization (NGO)",
  "Trust",
];

function getCurrentMonthLabel() {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Multi-select Work Type Component ────────────────────────────────────────
function WorkTypeSelector({ selected, onChange, disabled }) {
  const [search, setSearch] = useState("");

  const allItems = WORK_CATEGORIES.flatMap(c => c.items);
  const filtered = search.trim()
    ? allItems.filter(i => i.toLowerCase().includes(search.toLowerCase()))
    : null; // null = show by groups

  function toggle(item) {
    if (disabled) return;
    if (selected.includes(item)) onChange(selected.filter(i => i !== item));
    else onChange([...selected, item]);
  }

  function renderItem(item) {
    const isSel = selected.includes(item);
    return (
      <div key={item} className={`ac-wt-item ${isSel ? "selected" : ""}`} onClick={() => toggle(item)}>
        <input type="checkbox" checked={isSel} readOnly tabIndex={-1} />
        <label>{item}</label>
      </div>
    );
  }

  return (
    <div>
      <input
        className="ac-inp"
        placeholder="🔍 Search work types…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 8, fontSize: 13 }}
        disabled={disabled}
      />
      <div className="ac-wt-grid">
        {filtered
          ? filtered.map(renderItem)
          : WORK_CATEGORIES.map(cat => (
              <React.Fragment key={cat.group}>
                <div style={{ gridColumn: "1/-1", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", padding: "4px 2px 2px" }}>
                  {cat.group}
                </div>
                {cat.items.map(renderItem)}
              </React.Fragment>
            ))
        }
      </div>
      {selected.length > 0 && (
        <>
          <div className="ac-wt-count">{selected.length} work type{selected.length > 1 ? "s" : ""} selected</div>
          <div className="ac-wt-tags">
            {selected.map(item => (
              <span key={item} className="ac-wt-tag">
                {item}
                {!disabled && (
                  <button type="button" onClick={() => toggle(item)} title="Remove">✕</button>
                )}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();

  const prefill   = location.state?.prefill || {};
  const isAddWork = Object.keys(prefill).length > 0;

  const user = JSON.parse(localStorage.getItem("cao_user") || '{"name":"Guest","role":"Staff"}');

  const [staffList, setStaffList] = useState([]);
  const [caList,    setCaList]    = useState([]);
  const [loadingUsers, setLoading] = useState(true);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState({ text: "", type: "" });

  // workNature is now an array of selected items
  const buildEmpty = () => ({
    clientName:         prefill.clientName  || "",
    pan:                prefill.pan         || "",
    contactNo:          prefill.contactNo   || "",
    address:            prefill.address     || "",
    referredBy:         prefill.referredBy  || "",
    organization:       "",
    workNature:         [],          // array
    month:              getCurrentMonthLabel(),
    assignedTo:         "",
    workStartDate:      "",
    expectedCompletion: "",
    documentObtained:   "Yes",
    pendingRemarks:     "",
    checklist:          "Yes",
    priority:           "Normal",
    notes:              "",
  });

  const [form, setForm] = useState(buildEmpty);

  useEffect(() => {
    axios.get(`${API}/api/users`)
      .then(res => {
        const users = res.data || [];
        setStaffList(users.filter(u => u.role === "Staff").map(u => u.name));
        setCaList(users.filter(u => u.role === "CA").map(u => u.name));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const handleChange = e => set(e.target.name, e.target.value);

  const derivedStatus = form.documentObtained === "Yes" ? "In Progress" : "Pending";
  const isUrgent      = form.priority === "Urgent";

  async function handleSubmit() {
    if (!form.clientName.trim()) { setMsg({ text: "⚠️ Client Name is required", type: "warn" }); return; }
    if (form.workNature.length === 0) { setMsg({ text: "⚠️ Select at least one Work Type", type: "warn" }); return; }
    if (!form.assignedTo) { setMsg({ text: "⚠️ Assigned To is required", type: "warn" }); return; }

    setSaving(true); setMsg({ text: "", type: "" });
    try {
      // workNature sent as array — backend joins with ", "
      await axios.post(`${API}/add-client`, {
        ...form,
        status: derivedStatus,
      });
      setMsg({ text: "✅ Work saved successfully!", type: "ok" });
      // Keep client fields, clear work fields
      setForm(p => ({
        ...buildEmpty(),
        clientName:   p.clientName,
        pan:          p.pan,
        contactNo:    p.contactNo,
        address:      p.address,
        referredBy:   p.referredBy,
        organization: p.organization,
      }));
      setTimeout(() => setMsg({ text: "", type: "" }), 2500);
    } catch (err) {
      console.error(err);
      setMsg({ text: "❌ Error saving work. Please try again.", type: "err" });
    } finally { setSaving(false); }
  }

  function handleClear() { setForm(buildEmpty()); setMsg({ text: "", type: "" }); }
  function handleBack()  { navigate(isAddWork ? "/clients" : "/dashboard"); }

  return (
    <>
      <style>{styles}</style>
      <div className="ac-body">

        {/* Topbar */}
        <div className="ac-topbar">
          <button onClick={handleBack} style={{ background:"none", border:"none", color:"#7ab8f5", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", gap:4, fontFamily:"var(--font)" }}>
            ← {isAddWork ? "Clients" : ""}
          </button>
          <div className="ac-logo">CA <span>Office</span></div>
          <span className="ac-role-pill">{user.role}</span>
          <span style={{ color:"#94a3b8", fontSize:12, fontWeight:600, marginLeft:4 }}>{user.name}</span>
        </div>

        <div className="ac-page">
          <h2 style={{ fontSize:21, fontWeight:700, marginBottom:2, color:"var(--text)", letterSpacing:"-0.3px" }}>Add Work</h2>
          <p style={{ fontSize:12, color:"var(--text3)", marginBottom:16 }}>
            {isAddWork
              ? <span>Adding new work for <strong style={{ color:"var(--navy2)" }}>{prefill.clientName}</strong></span>
              : "Log a new client work item"}
          </p>

          <div className="ac-card">

            {/* Pre-fill banner */}
            {isAddWork && (
              <div className="ac-prefill-banner">
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#065f46", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#065f46" }}>Client details pre-filled</div>
                  <div style={{ fontSize:12, color:"#047857", marginTop:2 }}>
                    Name, PAN, contact and address loaded from <strong>{prefill.clientName}</strong>'s record. Fill in the work details below.
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 1: Client Information ── */}
            <div className="ac-section">Client Information</div>

            <div className="ac-group">
              <label className="ac-lbl">Client Name <span className="ac-star">*</span></label>
              <input className="ac-inp" name="clientName" placeholder="Full client name…" value={form.clientName}
                onChange={handleChange} autoComplete="off" readOnly={isAddWork} />
            </div>

            <div className="ac-row2">
              <div className="ac-group">
                <label className="ac-lbl">PAN</label>
                <input className="ac-inp" name="pan" placeholder="ABCDE1234F" maxLength={10}
                  value={form.pan}
                  onChange={e => { e.target.value = e.target.value.toUpperCase(); handleChange(e); }}
                  readOnly={isAddWork && !!prefill.pan}
                  style={{ textTransform:"uppercase", fontFamily:"var(--mono)" }} />
              </div>
              <div className="ac-group">
                <label className="ac-lbl">Contact No.</label>
                <input className="ac-inp" name="contactNo" type="tel" placeholder="9XXXXXXXXX"
                  value={form.contactNo} onChange={handleChange}
                  readOnly={isAddWork && !!prefill.contactNo} />
              </div>
            </div>

            <div className="ac-group">
              <label className="ac-lbl">Address</label>
              <textarea className="ac-textarea" name="address" placeholder="Door No., Street, City, State, Pincode…"
                value={form.address} onChange={handleChange}
                readOnly={isAddWork && !!prefill.address} style={{ minHeight:60 }} />
            </div>

            {/* Organization Type */}
            <div className="ac-group">
              <label className="ac-lbl">Organization Type</label>
              <select className="ac-sel" name="organization" value={form.organization} onChange={handleChange}>
                <option value="">— Select organization type —</option>
                {ORGANIZATION_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="ac-divider" />

            {/* ── SECTION 2: Work Details ── */}
            <div className="ac-section">Work Details</div>

            {/* Multi-select Work Nature */}
            <div className="ac-group">
              <label className="ac-lbl">Work Nature <span className="ac-star">*</span></label>
              <WorkTypeSelector
                selected={form.workNature}
                onChange={val => set("workNature", val)}
                disabled={false}
              />
            </div>

            {/* Month */}
            <div className="ac-group">
              <label className="ac-lbl">Month</label>
              <div className="ac-month-box">
                <strong>{form.month}</strong>
                <span style={{ fontSize:11, color:"var(--text3)", marginLeft:4 }}>— auto-assigned</span>
              </div>
            </div>

            <div className="ac-row2">
              <div className="ac-group">
                <label className="ac-lbl">Assigned To <span className="ac-star">*</span></label>
                <select className="ac-sel" name="assignedTo" value={form.assignedTo}
                  onChange={handleChange} disabled={loadingUsers}>
                  <option value="">{loadingUsers ? "Loading…" : "— Select —"}</option>
                  {caList.length > 0 && <optgroup label="CA">{caList.map(n => <option key={n}>{n}</option>)}</optgroup>}
                  {staffList.length > 0 && <optgroup label="Staff">{staffList.map(n => <option key={n}>{n}</option>)}</optgroup>}
                </select>
              </div>
              <div className="ac-group">
                <label className="ac-lbl">Referred By</label>
                <select className="ac-sel" name="referredBy" value={form.referredBy}
                  onChange={handleChange} disabled={loadingUsers}>
                  <option value="">— None —</option>
                  {caList.length > 0 && <optgroup label="CA">{caList.map(n => <option key={n}>{n}</option>)}</optgroup>}
                  {staffList.length > 0 && <optgroup label="Staff">{staffList.map(n => <option key={n}>{n}</option>)}</optgroup>}
                </select>
              </div>
            </div>

            <div className="ac-row2">
              <div className="ac-group">
                <label className="ac-lbl">Work Starts On</label>
                <input type="date" className="ac-inp" name="workStartDate"
                  value={form.workStartDate} onChange={handleChange} />
              </div>
              <div className="ac-group">
                <label className="ac-lbl">Expected Completion</label>
                <input type="date" className="ac-inp" name="expectedCompletion"
                  value={form.expectedCompletion} onChange={handleChange} />
              </div>
            </div>

            <div className="ac-divider" />

            {/* ── SECTION 3: Documents & Status ── */}
            <div className="ac-section">Documents &amp; Status</div>

            <div className="ac-group">
              <label className="ac-lbl">Document Obtained?</label>
              <select className="ac-sel" name="documentObtained"
                value={form.documentObtained} onChange={handleChange}>
                <option value="Yes">Yes — Documents received</option>
                <option value="No">No — Pending from client</option>
                <option value="Partial">Partial — Some documents received</option>
              </select>
              {derivedStatus === "Pending"
                ? <div className="ac-pending-badge">⏳ Will be added to <strong style={{ marginLeft:3 }}>Pending Tasks</strong></div>
                : <div className="ac-inprog-badge">✓ Will be added as <strong style={{ marginLeft:3 }}>In Progress</strong></div>
              }
            </div>

            {form.documentObtained !== "Yes" && (
              <div className="ac-group">
                <label className="ac-lbl">Document Pending Remarks</label>
                <input className="ac-inp" name="pendingRemarks"
                  placeholder="What documents are still pending?"
                  value={form.pendingRemarks} onChange={handleChange} />
              </div>
            )}

            <div className="ac-group">
              <label className="ac-lbl">Checklist Applicable?</label>
              <div className="ac-checklist">
                <button type="button" className={`ac-chk-opt ${form.checklist==="Yes"?"yes":""}`}
                  onClick={() => set("checklist","Yes")}>✓ Applicable</button>
                <button type="button" className={`ac-chk-opt ${form.checklist==="No"?"no":""}`}
                  onClick={() => set("checklist","No")}>✗ Not Applicable</button>
              </div>
            </div>

            <div className="ac-divider" />

            {/* ── SECTION 4: Priority & Notes ── */}
            <div className="ac-section">Priority &amp; Notes</div>

            <div className="ac-group">
              <label className="ac-lbl">Priority</label>
              <div className="ac-priority">
                <button type="button" className={`ac-btn-normal ${isUrgent?"off":""}`}
                  onClick={() => set("priority","Normal")}>Normal</button>
                <button type="button" className={`ac-btn-urgent ${isUrgent?"on":""}`}
                  onClick={() => set("priority","Urgent")}>🔴 URGENT</button>
              </div>
            </div>

            <div className="ac-group">
              <label className="ac-lbl">Notes / Remarks</label>
              <textarea className="ac-textarea" name="notes"
                placeholder="Any additional notes…"
                value={form.notes} onChange={handleChange} />
            </div>

            {/* Message */}
            {msg.text && (
              <div className={`ac-msg ${msg.type}`}>{msg.text}</div>
            )}

            {/* Buttons */}
            <div className="ac-save-row">
              <button type="button" className="ac-clear-btn" onClick={handleClear}>
                Clear Fields
              </button>
              <button type="button" className="ac-save-btn" onClick={handleSubmit} disabled={saving}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                {saving ? "Saving…" : "Save Work"}
              </button>
            </div>

            {isAddWork && (
              <div style={{ marginTop:14, padding:"10px 14px", background:"var(--navy-xlight)", borderRadius:9, fontSize:12, color:"var(--navy2)", display:"flex", alignItems:"center", gap:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Client details stay filled — add another work for <strong style={{ marginLeft:2 }}>{prefill.clientName}</strong> instantly
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
