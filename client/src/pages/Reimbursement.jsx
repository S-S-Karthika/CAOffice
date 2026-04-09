import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
// ─────────────────────────────────────────────────────────────────────────────
// REIMBURSEMENT.JSX — CA Office
//
// Features:
// • Log tax payments made on behalf of clients
// • Track who paid — Staff (from own pocket) or Office Bank Account
// • If Staff paid → shown as "Receivable from Office" (office owes staff)
// • If Office Bank → direct debit from office account
// • Recovery status — Pending / Recovered from Client
// • Auto-attaches to client invoice when generating invoice
// • Full list with filters: All / Pending Recovery / Recovered / Office Owes Staff
// • Export CSV
// ─────────────────────────────────────────────────────────────────────────────

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --navy:    #0f2744;
    --navy2:   #1a3f6f;
    --navy3:   #2e5f9a;
    --blue:    #3b82f6;
    --blue-l:  #eff6ff;
    --green:   #166534;
    --green2:  #16a34a;
    --green-l: #dcfce7;
    --red:     #991b1b;
    --red2:    #dc2626;
    --red-l:   #fee2e2;
    --amber:   #d97706;
    --amber-l: #fef3c7;
    --purple:  #7c3aed;
    --purple-l:#ede9fe;
    --teal:    #0e7490;
    --teal-l:  #cffafe;
    --gray-l:  #f8fafc;
    --border:  #e2e8f0;
    --text:    #0f172a;
    --text2:   #334155;
    --text3:   #64748b;
    --white:   #ffffff;
    --radius:  14px;
    --shadow:  0 2px 16px rgba(15,39,68,0.08);
    --font:    'Sora', sans-serif;
    --mono:    'JetBrains Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .rb-body {
    font-family: var(--font);
    background: var(--gray-l);
    min-height: 100vh;
    color: var(--text);
  }

  /* TOPBAR */
  .rb-topbar {
    background: var(--navy);
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  }
  .rb-logo { font-size: 16px; font-weight: 700; }
  .rb-logo span { color: #7ab8f5; }

  /* PAGE */
  .rb-page { padding: 20px; max-width: 1100px; margin: 0 auto; }

  /* TABS */
  .rb-tabs {
    display: flex;
    background: var(--white);
    border-bottom: 2px solid var(--border);
    padding: 0 20px;
    overflow-x: auto;
  }
  .rb-tab {
    padding: 12px 18px; font-size: 13px; font-weight: 600;
    border: none; background: none; cursor: pointer;
    color: var(--text3); font-family: var(--font);
    border-bottom: 3px solid transparent; margin-bottom: -2px;
    white-space: nowrap; transition: all 0.15s;
  }
  .rb-tab.active { color: var(--navy2); border-bottom-color: var(--navy2); }

  /* CARD */
  .rb-card {
    background: var(--white);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 20px;
    margin-bottom: 16px;
  }

  /* SECTION TITLE */
  .rb-section-title {
    font-size: 11px; font-weight: 700; color: var(--text3);
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;
  }

  /* FORM */
  .rb-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .rb-form-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .rb-form-lbl {
    font-size: 11px; font-weight: 700; color: var(--text2);
    text-transform: uppercase; letter-spacing: 0.04em;
    display: block; margin-bottom: 5px;
  }
  .rb-inp, .rb-sel, .rb-textarea {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-family: var(--font); font-size: 13px; color: var(--text);
    background: white; outline: none; transition: border-color 0.2s;
    -webkit-appearance: none; appearance: none;
  }
  .rb-inp:focus, .rb-sel:focus, .rb-textarea:focus {
    border-color: var(--navy2);
    box-shadow: 0 0 0 3px rgba(42,95,154,0.1);
  }
  .rb-textarea { resize: vertical; min-height: 60px; }

  /* PAYMENT SOURCE TOGGLE */
  .rb-source-toggle { display: flex; gap: 10px; }
  .rb-source-btn {
    flex: 1; padding: 11px; border-radius: 9px; border: 1.5px solid var(--border);
    font-family: var(--font); font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; background: white;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .rb-source-btn.active-office {
    border-color: var(--blue);
    background: var(--blue-l);
    color: var(--navy2);
  }
  .rb-source-btn.active-staff {
    border-color: var(--purple);
    background: var(--purple-l);
    color: var(--purple);
  }
  .rb-source-icon { font-size: 20px; }
  .rb-source-sub { font-size: 10px; font-weight: 500; opacity: 0.8; }

  /* INFO BANNER */
  .rb-info-banner {
    padding: 10px 14px; border-radius: 8px; font-size: 12px;
    font-weight: 500; display: flex; align-items: flex-start;
    gap: 8px; line-height: 1.5; margin-top: 10px; margin-bottom: 2px;
  }
  .rb-info-office { background: var(--blue-l); color: var(--navy2); border: 1px solid #bfdbfe; }
  .rb-info-staff  { background: var(--purple-l); color: var(--purple); border: 1px solid #c4b5fd; }

  /* SUBMIT BTN */
  .rb-submit-btn {
    width: 100%; padding: 13px; border-radius: 9px; border: none;
    background: var(--navy); color: white;
    font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: var(--font); transition: all 0.15s; margin-top: 4px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .rb-submit-btn:hover { background: var(--navy2); }
  .rb-submit-btn:disabled { background: #94a3b8; cursor: not-allowed; }

  /* DIVIDER */
  .rb-divider { height: 1px; background: var(--border); margin: 16px 0; }

  /* FILTER PILLS */
  .rb-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .rb-filter-btn {
    padding: 5px 13px; border-radius: 20px; font-size: 12px; font-weight: 700;
    border: 1.5px solid var(--border); background: white; cursor: pointer;
    font-family: var(--font); color: var(--text3); transition: all 0.15s;
  }
  .rb-filter-btn.active { background: var(--navy); color: white; border-color: var(--navy); }

  /* REIMBURSEMENT TABLE */
  .rb-table { width: 100%; border-collapse: collapse; }
  .rb-table th {
    padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700;
    color: #e2e8f0; background: var(--navy); white-space: nowrap;
    border-bottom: 2px solid var(--navy2);
  }
  .rb-table td {
    padding: 11px 14px; font-size: 13px;
    border-bottom: 1px solid #f1f5f9; vertical-align: middle;
  }
  .rb-table tr:nth-child(even) td { background: #f8fafc; }
  .rb-table tr:hover td { background: #eff6ff; }

  /* BADGES */
  .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 10px; }
  .badge-pending    { background: var(--amber-l); color: var(--amber); }
  .badge-recovered  { background: var(--green-l); color: var(--green); }
  .badge-office-bank{ background: var(--blue-l);  color: var(--navy2); }
  .badge-staff-paid { background: var(--purple-l);color: var(--purple); }
  .badge-receivable { background: #fce7f3; color: #be185d; }

  /* RECOVER BTN */
  .rb-recover-btn {
    padding: 5px 12px; border-radius: 7px; border: 1px solid var(--green2);
    background: var(--green-l); color: var(--green); font-size: 11px;
    font-weight: 700; cursor: pointer; font-family: var(--font);
    transition: all 0.15s; white-space: nowrap;
  }
  .rb-recover-btn:hover { background: var(--green2); color: white; }

  /* SUMMARY CARDS */
  .rb-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 10px;
    margin-bottom: 16px;
  }
  .rb-sum-card {
    background: white; border-radius: 10px; padding: 14px 16px;
    border-top: 3px solid #ddd; box-shadow: var(--shadow);
  }
  .rb-sum-val { font-size: 22px; font-weight: 800; color: var(--text); font-family: var(--mono); }
  .rb-sum-lbl { font-size: 11px; color: var(--text3); margin-top: 3px; }

  /* EXPORT */
  .rb-export-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; background: var(--green2); color: white;
    border: none; border-radius: 8px; font-size: 12px; font-weight: 700;
    cursor: pointer; font-family: var(--font); transition: all 0.15s;
  }
  .rb-export-btn:hover { background: var(--green); }

  /* AMOUNT */
  .rb-amount { font-family: var(--mono); font-weight: 700; }

  @media (max-width: 600px) {
    .rb-form-row  { grid-template-columns: 1fr; }
    .rb-form-row3 { grid-template-columns: 1fr; }
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const TAX_TYPES = [
  { label: "GST Tax Payment",       value: "GST Tax Payment" },
  { label: "TDS / TCS Payment",     value: "TDS / TCS Payment" },
  { label: "Late Fees – GST",       value: "Late Fees – GST" },
  { label: "Late Fees – IT Return", value: "Late Fees – IT Return" },
  { label: "Advance Tax Payment",   value: "Advance Tax Payment" },
  { label: "Self Assessment Tax",   value: "Self Assessment Tax" },
  { label: "Interest Payment",      value: "Interest Payment" },
  { label: "MCA / ROC Fees",        value: "MCA / ROC Fees" },
  { label: "Stamp Duty",            value: "Stamp Duty" },
  { label: "Other Govt Payment",    value: "Other Govt Payment" },
];

const MONTHS_LIST = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getCurrentDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fmtINR(n) {
  return Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

function Avatar({ name = "?", size = 28 }) {
  const COLS = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899"];
  const bg = COLS[(String(name).charCodeAt(0) || 0) % COLS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.4, fontWeight: 700 }}>
      {String(name)[0]?.toUpperCase()}
    </div>
  );
}

// ─── EMPTY FORM ───────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  clientName:    "",
  taxType:       "",
  remarkPeriod:  "",   // e.g. "March 2026" or "Q4 FY 2025-26"
  remarkDetail:  "",   // free text additional remark
  amount:        "",
  date:          getCurrentDateKey(),
  paidBy:        "",   // staff name or "Office"
  paymentSource: "office", // "office" | "staff"
  staffPaidFrom: "own_pocket", // "own_pocket" | "office_given"
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Reimbursement() {
  const navigate   = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("cao_user") || '{"name":"SK KavinRaj","role":"CA"}');

  const [tab,      setTab]      = useState("add");    // "add" | "list" | "staff_receivable"
  const [filter,   setFilter]   = useState("all");    // "all" | "pending" | "recovered" | "staff"
  const [records,  setRecords]  = useState([]);
  const [clients,  setClients]  = useState([]);
  const [staffList,setStaffList]= useState([]);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [msg,      setMsg]      = useState("");

  // ── Load data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    loadRecords();
    loadClients();
    loadStaff();
  }, []);

  async function loadRecords() {
    try {
      const res = await axios.get(`${API}/reimbursements`);
      setRecords(res.data || []);
    } catch { setRecords([]); }
  }

  async function loadClients() {
  try {
    const res = await axios.get(`${API}/clients`);

    const names = [...new Set(
      (res.data || [])
        .map(r => String(r.clientName || "").trim()) // ✅ FIXED
        .filter(Boolean)
    )].sort();

    setClients(names);

  } catch {
    setClients([]);
  }
}

  async function loadStaff() {
  try {
    const res = await axios.get(`${API}/api/users`);

    const names = [...new Set(
      (res.data || [])
        .map(u => String(u.name || "").trim())
        .filter(Boolean)
    )];

    setStaffList(names);

  } catch (err) {
    console.error("Failed to load staff:", err);
    setStaffList([]); // ✅ no hardcoded names
  }
}

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Submit new reimbursement ─────────────────────────────────────────────────
  async function handleSave() {
    if (!form.clientName) { setMsg("⚠️ Select a client"); return; }
    if (!form.taxType)    { setMsg("⚠️ Select tax type"); return; }
    if (!form.amount)     { setMsg("⚠️ Enter amount"); return; }
    if (!form.paidBy)     { setMsg("⚠️ Select who paid"); return; }

    setSaving(true);
    setMsg("");

    // Build the full remark for invoice
    const fullRemark = [form.taxType, form.remarkPeriod, form.remarkDetail]
      .filter(Boolean).join(" — ");

    const payload = {
      ...form,
      fullRemark,
      // If staff paid from own pocket → office owes staff (receivable from office)
      officeOwesStaff: form.paymentSource === "staff" && form.staffPaidFrom === "own_pocket",
      status:    "Pending",   // Pending recovery from client
      addedBy:   currentUser.name,
      addedOn:   getCurrentDateKey(),
      invoiceId: "",           // filled when invoice is generated
    };

    try {
      await axios.post(`${API}/reimbursements`, payload);
      setMsg("✅ Reimbursement saved successfully!");
      setForm(EMPTY_FORM);
      loadRecords();
      setTimeout(() => { setTab("list"); setMsg(""); }, 1200);
    } catch {
      setMsg("❌ Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Mark as recovered from client ───────────────────────────────────────────
  async function markRecovered(id) {
    try {
      await axios.patch(`${API}/reimbursements/${id}`, { status: "Recovered" });
      loadRecords();
    } catch { alert("Failed to update"); }
  }

  // ── Mark staff paid back by office ──────────────────────────────────────────
  async function markOfficePaid(id) {
    try {
      await axios.patch(`${API}/reimbursements/${id}`, { officeOwesStaff: false, officePaidStaffOn: getCurrentDateKey() });
      loadRecords();
    } catch { alert("Failed to update"); }
  }

  // ── Export CSV ───────────────────────────────────────────────────────────────
  function exportCSV() {
    const rows = [
      ["Date","Client","Tax Type","Period / Remark","Amount (₹)","Paid By","Source","Office Owes Staff","Status","Invoice ID"],
      ...filtered.map(r => [
        r.date || "", r.clientName || "", r.taxType || "",
        r.fullRemark || "", r.amount || "",
        r.paidBy || "",
        r.paymentSource === "staff" ? "Staff" : "Office Bank",
        r.officeOwesStaff ? "Yes" : "No",
        r.status || "Pending",
        r.invoiceId || "—",
      ])
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `reimbursements_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ── Filter records ───────────────────────────────────────────────────────────
  const filtered = records.filter(r => {
    if (filter === "pending")   return r.status !== "Recovered";
    if (filter === "recovered") return r.status === "Recovered";
    if (filter === "staff")     return r.officeOwesStaff === true || r.officeOwesStaff === "true";
    return true;
  });

  // ── Summary numbers ──────────────────────────────────────────────────────────
  const totalAmt       = records.reduce((s, r) => s + Number(r.amount || 0), 0);
  const pendingAmt     = records.filter(r => r.status !== "Recovered").reduce((s, r) => s + Number(r.amount || 0), 0);
  const recoveredAmt   = records.filter(r => r.status === "Recovered").reduce((s, r) => s + Number(r.amount || 0), 0);
  const officeOwesAmt  = records.filter(r => r.officeOwesStaff === true || r.officeOwesStaff === "true").reduce((s, r) => s + Number(r.amount || 0), 0);

  // ── Month options ─────────────────────────────────────────────────────────────
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push(`${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{S}</style>
      <div className="rb-body">

        {/* TOPBAR */}
        <div className="rb-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/dashboard")} style={{ background: "none", border: "none", color: "#7ab8f5", cursor: "pointer", fontSize: 18 }}>←</button>
            <div className="rb-logo">CA <span>Office</span></div>
            <span style={{ background: "#c9933a22", color: "#f0c060", border: "1px solid #c9933a44", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
              {currentUser.role}
            </span>
          </div>
          <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{currentUser.name}</span>
        </div>

        {/* TABS */}
        <div className="rb-tabs">
          <button
            className={`rb-tab ${tab === "add" ? "active" : ""}`}
            onClick={() => {
            setTab("add");
            loadClients();   // 👈 ADD THIS
          }}
>
            + Add Reimbursement
          </button>
          <button className={`rb-tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>
            All Records {records.length > 0 && `(${records.length})`}
          </button>
          <button className={`rb-tab ${tab === "staff_receivable" ? "active" : ""}`} onClick={() => setTab("staff_receivable")}>
            Office Owes Staff {officeOwesAmt > 0 && `· ${fmtINR(officeOwesAmt)}`}
          </button>
        </div>

        {/* ── ADD TAB ── */}
        {tab === "add" && (
          <div className="rb-page">
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Add Reimbursement</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Track tax payments made on behalf of clients</div>

            <div className="rb-card">
              <div className="rb-section-title">Client & Payment Details</div>

              {/* Client + Date */}
              <div className="rb-form-row">
                <div>
                  <label className="rb-form-lbl">Client Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <select name="clientName" value={form.clientName} onChange={handle}onClick={loadClients}  className="rb-sel">
                    <option value="">— Select Client —</option>
                    {clients.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="rb-form-lbl">Date of Payment</label>
                  <input type="date" name="date" value={form.date} onChange={handle} className="rb-inp" />
                </div>
              </div>

              {/* Tax Type */}
              <div style={{ marginBottom: 12 }}>
                <label className="rb-form-lbl">Tax / Payment Type <span style={{ color: "#ef4444" }}>*</span></label>
                <select name="taxType" value={form.taxType} onChange={handle} className="rb-sel">
                  <option value="">— Select Type —</option>
                  {TAX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Remark Period + Detail */}
              <div className="rb-form-row">
                <div>
                  <label className="rb-form-lbl">Period / Month</label>
                  <select name="remarkPeriod" value={form.remarkPeriod} onChange={handle} className="rb-sel">
                    <option value="">— Select Month / Period —</option>
                    <optgroup label="Financial Year">
                      <option>FY 2025-26</option>
                      <option>FY 2024-25</option>
                      <option>FY 2023-24</option>
                      <option>Q1 FY 2025-26 (Apr–Jun)</option>
                      <option>Q2 FY 2025-26 (Jul–Sep)</option>
                      <option>Q3 FY 2025-26 (Oct–Dec)</option>
                      <option>Q4 FY 2025-26 (Jan–Mar)</option>
                    </optgroup>
                    <optgroup label="Month">
                      {monthOptions.map(m => <option key={m}>{m}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="rb-form-lbl">Additional Remark</label>
                  <input
                    name="remarkDetail"
                    value={form.remarkDetail}
                    onChange={handle}
                    className="rb-inp"
                    placeholder="e.g. Late fees for GSTR-3B, Challan no. 12345…"
                  />
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 12 }}>
                <label className="rb-form-lbl">Amount (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handle}
                  className="rb-inp"
                  placeholder="0"
                  style={{ fontFamily: "var(--mono)", fontSize: 15 }}
                />
              </div>

              <div className="rb-divider" />
              <div className="rb-section-title">Who Paid? <span style={{ textTransform: "none", fontWeight: 500 }}>— This determines cash flow tracking</span></div>

              {/* Payment Source Toggle */}
              <div style={{ marginBottom: 12 }}>
                <label className="rb-form-lbl">Payment Made From</label>
                <div className="rb-source-toggle">
                  <button
                    type="button"
                    className={`rb-source-btn ${form.paymentSource === "office" ? "active-office" : ""}`}
                    onClick={() => setForm(p => ({ ...p, paymentSource: "office", paidBy: "Office" }))}
                  >
                    <span className="rb-source-icon">🏦</span>
                    <span>Office Bank Account</span>
                    <span className="rb-source-sub">Direct debit from office</span>
                  </button>
                  <button
                    type="button"
                    className={`rb-source-btn ${form.paymentSource === "staff" ? "active-staff" : ""}`}
                    onClick={() => setForm(p => ({ ...p, paymentSource: "staff" }))}
                  >
                    <span className="rb-source-icon">👤</span>
                    <span>Staff / CA Paid</span>
                    <span className="rb-source-sub">Personal money used</span>
                  </button>
                </div>
              </div>

              {/* If Office → just show confirmation */}
              {form.paymentSource === "office" && (
                <div className="rb-info-banner rb-info-office">
                  🏦 Payment will be recorded as deducted from the <strong>Office Bank Account</strong>. Will be recovered from client.
                </div>
              )}

              {/* If Staff → pick who + from where */}
              {form.paymentSource === "staff" && (
                <>
                  <div className="rb-form-row" style={{ marginBottom: 10 }}>
                    <div>
                      <label className="rb-form-lbl">Paid By (Staff / CA) <span style={{ color: "#ef4444" }}>*</span></label>
                      <select name="paidBy" value={form.paidBy} onChange={handle} className="rb-sel">
                        <option value="">— Select Person —</option>
                        {staffList.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="rb-form-lbl">Staff Paid From</label>
                      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                        <button
                          type="button"
                          onClick={() => setForm(p => ({ ...p, staffPaidFrom: "own_pocket" }))}
                          style={{
                            flex: 1, padding: "10px 8px", borderRadius: 8, border: "1.5px solid",
                            fontFamily: "var(--font)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                            borderColor: form.staffPaidFrom === "own_pocket" ? "#be185d" : "#e2e8f0",
                            background: form.staffPaidFrom === "own_pocket" ? "#fce7f3" : "white",
                            color: form.staffPaidFrom === "own_pocket" ? "#be185d" : "#64748b",
                          }}
                        >
                          Own Pocket
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(p => ({ ...p, staffPaidFrom: "office_given" }))}
                          style={{
                            flex: 1, padding: "10px 8px", borderRadius: 8, border: "1.5px solid",
                            fontFamily: "var(--font)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                            borderColor: form.staffPaidFrom === "office_given" ? "#0e7490" : "#e2e8f0",
                            background: form.staffPaidFrom === "office_given" ? "#cffafe" : "white",
                            color: form.staffPaidFrom === "office_given" ? "#0e7490" : "#64748b",
                          }}
                        >
                          Office Gave Cash
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info banner based on selection */}
                  {form.staffPaidFrom === "own_pocket" && (
                    <div className="rb-info-banner rb-info-staff">
                      💳 <strong>{form.paidBy || "Staff"}</strong> paid from personal pocket.
                      This will show as <strong>Receivable from Office</strong> — office must reimburse staff first,
                      then recover from client.
                    </div>
                  )}
                  {form.staffPaidFrom === "office_given" && (
                    <div className="rb-info-banner rb-info-office">
                      🏦 Office gave cash/bank to staff who then made the payment.
                      Will be tracked as office expense, recovered from client.
                    </div>
                  )}
                </>
              )}

              {/* Invoice preview */}
              {form.clientName && form.taxType && form.amount && (
                <>
                  <div className="rb-divider" />
                  <div className="rb-section-title">Invoice Line Preview</div>
                  <div style={{
                    background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 9,
                    padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 13,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>
                          {form.taxType}
                          {form.remarkPeriod ? ` — ${form.remarkPeriod}` : ""}
                        </div>
                        {form.remarkDetail && (
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{form.remarkDetail}</div>
                        )}
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                          Reimbursement · Paid on {form.date}
                          {form.paidBy ? ` by ${form.paidBy}` : ""}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b" }}>
                        {form.amount ? fmtINR(form.amount) : "₹—"}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {msg && (
                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600,
                  color: msg.startsWith("✅") ? "#16a34a" : msg.startsWith("⚠️") ? "#d97706" : "#dc2626" }}>
                  {msg}
                </div>
              )}

              <button className="rb-submit-btn" onClick={handleSave} disabled={saving} style={{ marginTop: 16 }}>
                {saving ? "Saving…" : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Reimbursement
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── LIST TAB ── */}
        {tab === "list" && (
          <div className="rb-page">
            {/* Summary cards */}
            <div className="rb-summary-grid">
              {[
                { label: "Total Reimbursements", val: fmtINR(totalAmt),      color: "#0f172a" },
                { label: "Pending Recovery",      val: fmtINR(pendingAmt),    color: "#d97706" },
                { label: "Recovered from Clients",val: fmtINR(recoveredAmt),  color: "#16a34a" },
                { label: "Office Owes Staff",      val: fmtINR(officeOwesAmt), color: "#7c3aed" },
              ].map(s => (
                <div className="rb-sum-card" key={s.label} style={{ borderTopColor: s.color }}>
                  <div className="rb-sum-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="rb-sum-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters + Export */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div className="rb-filters" style={{ marginBottom: 0 }}>
                {[
                  { key: "all",       label: "All" },
                  { key: "pending",   label: "⏳ Pending Recovery" },
                  { key: "recovered", label: "✅ Recovered" },
                  { key: "staff",     label: "💳 Office Owes Staff" },
                ].map(f => (
                  <button key={f.key} className={`rb-filter-btn ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
              <button className="rb-export-btn" onClick={exportCSV}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="rb-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>
                    No records found.
                  </div>
                ) : (
                  <table className="rb-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Type</th>
                        <th>Period / Remark</th>
                        <th>Amount</th>
                        <th>Paid By</th>
                        <th>Source</th>
                        <th>Office Owes</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r, i) => {
                        const owes = r.officeOwesStaff === true || r.officeOwesStaff === "true";
                        return (
                          <tr key={i}>
                            <td style={{ color: "#475569", fontFamily: "var(--mono)", fontSize: 12 }}>{r.date || "—"}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Avatar name={r.clientName || "?"} size={26} />
                                <span style={{ fontWeight: 700, color: "#1e293b" }}>{r.clientName}</span>
                              </div>
                            </td>
                            <td style={{ color: "#334155" }}>{r.taxType}</td>
                            <td style={{ fontSize: 12, color: "#64748b", maxWidth: 200 }}>
                              <div>{r.remarkPeriod || ""}</div>
                              {r.remarkDetail && <div style={{ color: "#94a3b8", fontSize: 11 }}>{r.remarkDetail}</div>}
                            </td>
                            <td>
                              <span className="rb-amount" style={{ color: "#1e293b", fontSize: 14 }}>
                                {fmtINR(r.amount)}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <Avatar name={r.paidBy || "O"} size={22} />
                                <span style={{ fontSize: 12 }}>{r.paidBy || "Office"}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${r.paymentSource === "staff" ? "badge-staff-paid" : "badge-office-bank"}`}>
                                {r.paymentSource === "staff" ? "Staff" : "Office Bank"}
                              </span>
                            </td>
                            <td>
                              {owes ? (
                                <span className="badge badge-receivable">Yes — Owes {r.paidBy}</span>
                              ) : (
                                <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${r.status === "Recovered" ? "badge-recovered" : "badge-pending"}`}>
                                {r.status || "Pending"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                {r.status !== "Recovered" && (
                                  <button className="rb-recover-btn" onClick={() => markRecovered(r._id || i)}>
                                    ✓ Recovered
                                  </button>
                                )}
                                {owes && (
                                  <button
                                    onClick={() => markOfficePaid(r._id || i)}
                                    style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #7c3aed", background: "#ede9fe", color: "#7c3aed", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", whiteSpace: "nowrap" }}
                                  >
                                    Office Paid Staff
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── OFFICE OWES STAFF TAB ── */}
        {tab === "staff_receivable" && (
          <div className="rb-page">
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>Office Owes Staff</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
              Staff paid from personal pocket — office must reimburse them before recovering from client
            </div>

            {/* Group by staff member */}
            {(() => {
              const owingRecords = records.filter(r => r.officeOwesStaff === true || r.officeOwesStaff === "true");
              if (owingRecords.length === 0) {
                return (
                  <div className="rb-card" style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 4 }}>All cleared!</div>
                    <div style={{ fontSize: 13 }}>No pending amounts owed to staff by office.</div>
                  </div>
                );
              }

              // Group by paidBy
              const byStaff = {};
              owingRecords.forEach(r => {
                const name = r.paidBy || "Unknown";
                if (!byStaff[name]) byStaff[name] = [];
                byStaff[name].push(r);
              });

              return Object.entries(byStaff).map(([staffName, staffRecs]) => {
                const totalOwed = staffRecs.reduce((s, r) => s + Number(r.amount || 0), 0);
                return (
                  <div key={staffName} className="rb-card">
                    {/* Staff header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={staffName} size={36} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{staffName}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{staffRecs.length} pending payment{staffRecs.length > 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 800, color: "#7c3aed" }}>
                          {fmtINR(totalOwed)}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Office owes this staff</div>
                      </div>
                    </div>

                    {/* Records */}
                    {staffRecs.map((r, j) => (
                      <div key={j} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 12px", background: "#f8fafc", borderRadius: 8,
                        marginBottom: 6, gap: 8, flexWrap: "wrap",
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>
                            {r.clientName} — {r.taxType}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                            {r.remarkPeriod} {r.remarkDetail ? `· ${r.remarkDetail}` : ""} · {r.date}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, color: "#7c3aed" }}>
                            {fmtINR(r.amount)}
                          </span>
                          <button
                            onClick={() => markOfficePaid(r._id || j)}
                            style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "#7c3aed", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)" }}
                          >
                            Mark Paid to Staff
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </div>
        )}

      </div>
    </>
  );
}
