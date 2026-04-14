import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./PageWrapper";
import { Avatar } from "./AppShell";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const TAX_TYPES = [
  { label:"GST Tax Payment",         value:"GST Tax Payment" },
  { label:"TDS / TCS Payment",       value:"TDS / TCS Payment" },
  { label:"Late Fees – GST",         value:"Late Fees – GST" },
  { label:"Late Fees – IT Return",   value:"Late Fees – IT Return" },
  { label:"Advance Tax Payment",     value:"Advance Tax Payment" },
  { label:"Self Assessment Tax",     value:"Self Assessment Tax" },
  { label:"Interest Payment",        value:"Interest Payment" },
  { label:"MCA / ROC Fees",          value:"MCA / ROC Fees" },
  { label:"Stamp Duty",              value:"Stamp Duty" },
  { label:"Other Govt Payment",      value:"Other Govt Payment" },
];
const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function getCurrentDateKey() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtINR(n) { return Number(n||0).toLocaleString("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}); }

const EMPTY_FORM = {
  clientName:"", taxType:"", remarkPeriod:"", remarkDetail:"",
  amount:"", date:getCurrentDateKey(), paidBy:"", paymentSource:"office", staffPaidFrom:"own_pocket",
};

const IC = ({ d, size=16, stroke="currentColor", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);

export default function Reimbursement() {
  const navigate    = useNavigate();
  const currentUser = (()=>{try{return JSON.parse(localStorage.getItem("cao_user")||'{"name":"CA","role":"CA"}');}catch{return{name:"CA",role:"CA"};}})();

  const [tab,       setTab]      = useState("add");
  const [filter,    setFilter]   = useState("all");
  const [records,   setRecords]  = useState([]);
  const [clients,   setClients]  = useState([]);
  const [staffList, setStaffList]= useState([]);
  const [saving,    setSaving]   = useState(false);
  const [form,      setForm]     = useState(EMPTY_FORM);
  const [msg,       setMsg]      = useState("");

  useEffect(() => { loadRecords(); loadClients(); loadStaff(); }, []);

  async function loadRecords() { try { const r=await axios.get(`${API}/reimbursements`); setRecords(r.data||[]); } catch { setRecords([]); } }
  async function loadClients() {
    try {
      const r = await axios.get(`${API}/clients`);
      setClients([...new Set((r.data||[]).map(x=>String(x.clientName||"").trim()).filter(Boolean))].sort());
    } catch { setClients([]); }
  }
  async function loadStaff() {
    try {
      const r = await axios.get(`${API}/api/users`);
      setStaffList([...new Set((r.data||[]).map(u=>String(u.name||"").trim()).filter(Boolean))]);
    } catch { setStaffList([]); }
  }

  const handle = e => setForm(p=>({...p,[e.target.name]:e.target.value}));

  async function handleSave() {
    if (!form.clientName){setMsg("⚠️ Select a client");return;}
    if (!form.taxType)   {setMsg("⚠️ Select tax type");return;}
    if (!form.amount)    {setMsg("⚠️ Enter amount");return;}
    if (!form.paidBy)    {setMsg("⚠️ Select who paid");return;}
    setSaving(true); setMsg("");
    const fullRemark = [form.taxType,form.remarkPeriod,form.remarkDetail].filter(Boolean).join(" — ");
    const payload = { ...form, fullRemark, officeOwesStaff:form.paymentSource==="staff"&&form.staffPaidFrom==="own_pocket", status:"Pending", addedBy:currentUser.name, addedOn:getCurrentDateKey(), invoiceId:"" };
    try {
      await axios.post(`${API}/reimbursements`,payload);
      setMsg("✅ Reimbursement saved!");
      setForm(EMPTY_FORM); loadRecords();
      setTimeout(()=>{setTab("list");setMsg("");},1200);
    } catch { setMsg("❌ Failed to save. Try again."); }
    finally { setSaving(false); }
  }

  async function markRecovered(id) { try { await axios.patch(`${API}/reimbursements/${id}`,{status:"Recovered"}); loadRecords(); } catch { alert("Failed to update"); } }
  async function markOfficePaid(id) { try { await axios.patch(`${API}/reimbursements/${id}`,{officeOwesStaff:false,officePaidStaffOn:getCurrentDateKey()}); loadRecords(); } catch { alert("Failed"); } }

  function exportCSV() {
    const rows=[["Date","Client","Tax Type","Period","Amount","Paid By","Source","Office Owes","Status"],...filtered.map(r=>[r.date||"",r.clientName||"",r.taxType||"",r.fullRemark||"",r.amount||"",r.paidBy||"",r.paymentSource==="staff"?"Staff":"Office",r.officeOwesStaff?"Yes":"No",r.status||"Pending"])];
    const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`reimb_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);
  }

  const filtered = records.filter(r => {
    if (filter==="pending")   return r.status!=="Recovered";
    if (filter==="recovered") return r.status==="Recovered";
    if (filter==="staff")     return r.officeOwesStaff===true||r.officeOwesStaff==="true";
    return true;
  });

  const totalAmt      = records.reduce((s,r)=>s+Number(r.amount||0),0);
  const pendingAmt    = records.filter(r=>r.status!=="Recovered").reduce((s,r)=>s+Number(r.amount||0),0);
  const recoveredAmt  = records.filter(r=>r.status==="Recovered").reduce((s,r)=>s+Number(r.amount||0),0);
  const officeOwesAmt = records.filter(r=>r.officeOwesStaff===true||r.officeOwesStaff==="true").reduce((s,r)=>s+Number(r.amount||0),0);

  const monthOptions=[];const now=new Date();
  for(let i=0;i<24;i++){const d=new Date(now.getFullYear(),now.getMonth()-i,1);monthOptions.push(`${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}`);}

  const inpStyle  = { width:"100%",padding:"10px 13px",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontFamily:"var(--font)",fontSize:13,color:"var(--text)",background:"var(--surface)",outline:"none" };
  const lblStyle  = { fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:5 };
  const secTitle  = { fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14 };

  return (
    <PageWrapper activeKey="reimb" title="Payments" subtitle="Track reimbursements & tax payments"
      rightAction={
        <button className="ca-btn-green" style={{ fontSize:12,padding:"7px 14px" }} onClick={exportCSV}>
          <IC d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" size={13} stroke="#fff"/> Export CSV
        </button>
      }>

      {/* ── Tabs ── */}
      <div className="ca-tabs" style={{ padding:"0 20px", marginBottom:0 }}>
        <button className={`ca-tab ${tab==="add"?"active":""}`} onClick={()=>{ setTab("add"); loadClients(); }}>+ Add</button>
        <button className={`ca-tab ${tab==="list"?"active":""}`} onClick={()=>setTab("list")}>All Records {records.length>0&&`(${records.length})`}</button>
        <button className={`ca-tab ${tab==="staff_receivable"?"active":""}`} onClick={()=>setTab("staff_receivable")}>
          Office Owes Staff{officeOwesAmt>0&&` · ${fmtINR(officeOwesAmt)}`}
        </button>
      </div>

      <div style={{ padding:"20px",maxWidth:1000,margin:"0 auto" }}>

        {/* ── ADD TAB ── */}
        {tab==="add" && (
          <div className="ca-card" style={{ padding:22 }}>
            <div className="ca-section-hd">Client & Payment Details</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
              <div>
                <label style={lblStyle}>Client Name *</label>
                <select name="clientName" value={form.clientName} onChange={handle} onClick={loadClients} style={inpStyle}>
                  <option value="">— Select Client —</option>
                  {clients.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lblStyle}>Date of Payment</label>
                <input type="date" name="date" value={form.date} onChange={handle} style={inpStyle}/>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lblStyle}>Tax / Payment Type *</label>
              <select name="taxType" value={form.taxType} onChange={handle} style={inpStyle}>
                <option value="">— Select Type —</option>
                {TAX_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
              <div>
                <label style={lblStyle}>Period / Month</label>
                <select name="remarkPeriod" value={form.remarkPeriod} onChange={handle} style={inpStyle}>
                  <option value="">— Select Period —</option>
                  <optgroup label="Financial Year">
                    <option>FY 2025-26</option><option>FY 2024-25</option><option>FY 2023-24</option>
                    <option>Q1 FY 2025-26</option><option>Q2 FY 2025-26</option>
                    <option>Q3 FY 2025-26</option><option>Q4 FY 2025-26</option>
                  </optgroup>
                  <optgroup label="Month">{monthOptions.map(m=><option key={m}>{m}</option>)}</optgroup>
                </select>
              </div>
              <div>
                <label style={lblStyle}>Additional Remark</label>
                <input name="remarkDetail" value={form.remarkDetail} onChange={handle} style={inpStyle} placeholder="e.g. Late fees for GSTR-3B…"/>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={lblStyle}>Amount (₹) *</label>
              <input type="number" name="amount" value={form.amount} onChange={handle} style={{ ...inpStyle,fontFamily:"monospace",fontSize:15 }} placeholder="0"/>
            </div>

            <div style={{ height:1,background:"var(--border)",margin:"16px 0" }}/>
            <div style={secTitle}>Who Paid?</div>

            {/* Payment source toggle */}
            <div style={{ display:"flex",gap:10,marginBottom:12 }}>
              {[
                { val:"office", icon:"🏦", label:"Office Bank Account", sub:"Direct debit from office" },
                { val:"staff",  icon:"👤", label:"Staff / CA Paid",     sub:"Personal money used" },
              ].map(s=>(
                <button key={s.val} type="button" onClick={()=>setForm(p=>({...p,paymentSource:s.val,paidBy:s.val==="office"?"Office":p.paidBy}))}
                  style={{ flex:1,padding:"13px 10px",borderRadius:"var(--r-md)",border:`1.5px solid ${form.paymentSource===s.val?(s.val==="office"?"var(--blue)":"var(--purple)"):"var(--border)"}`,background:form.paymentSource===s.val?(s.val==="office"?"var(--blue-l)":"var(--purple-l)"):"var(--surface)",cursor:"pointer",fontFamily:"var(--font)",textAlign:"center" }}>
                  <div style={{ fontSize:20,marginBottom:3 }}>{s.icon}</div>
                  <div style={{ fontSize:12,fontWeight:700,color:form.paymentSource===s.val?(s.val==="office"?"var(--blue)":"var(--purple)"):"var(--text2)" }}>{s.label}</div>
                  <div style={{ fontSize:10,color:"var(--text4)",marginTop:1 }}>{s.sub}</div>
                </button>
              ))}
            </div>

            {form.paymentSource==="office" && (
              <div style={{ padding:"10px 14px",borderRadius:"var(--r-md)",background:"var(--blue-l)",border:"1px solid var(--blue-m)",fontSize:12,color:"var(--blue)",marginBottom:12 }}>
                🏦 Payment will be deducted from the <strong>Office Bank Account</strong>. Will be recovered from client.
              </div>
            )}

            {form.paymentSource==="staff" && (
              <>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
                  <div>
                    <label style={lblStyle}>Paid By *</label>
                    <select name="paidBy" value={form.paidBy} onChange={handle} style={inpStyle}>
                      <option value="">— Select Person —</option>
                      {staffList.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lblStyle}>Staff Paid From</label>
                    <div style={{ display:"flex",gap:6 }}>
                      {[["own_pocket","Own Pocket","#be185d","#fce7f3"],["office_given","Office Cash","#0e7490","#cffafe"]].map(([v,l,c,bg])=>(
                        <button key={v} type="button" onClick={()=>setForm(p=>({...p,staffPaidFrom:v}))} style={{ flex:1,padding:"10px 8px",borderRadius:8,border:`1.5px solid ${form.staffPaidFrom===v?c:"var(--border)"}`,background:form.staffPaidFrom===v?bg:"var(--surface)",color:form.staffPaidFrom===v?c:"var(--text3)",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"var(--font)" }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
                {form.staffPaidFrom==="own_pocket" && (
                  <div style={{ padding:"10px 14px",borderRadius:"var(--r-md)",background:"var(--purple-l)",border:"1px solid #DDD6FE",fontSize:12,color:"var(--purple)",marginBottom:12 }}>
                    💳 <strong>{form.paidBy||"Staff"}</strong> paid from personal pocket. Will show as <strong>Receivable from Office</strong>.
                  </div>
                )}
                {form.staffPaidFrom==="office_given" && (
                  <div style={{ padding:"10px 14px",borderRadius:"var(--r-md)",background:"var(--blue-l)",border:"1px solid var(--blue-m)",fontSize:12,color:"var(--blue)",marginBottom:12 }}>
                    🏦 Office gave cash to staff who made the payment.
                  </div>
                )}
              </>
            )}

            {/* Invoice preview */}
            {form.clientName&&form.taxType&&form.amount&&(
              <>
                <div style={{ height:1,background:"var(--border)",margin:"16px 0" }}/>
                <div style={secTitle}>Invoice Line Preview</div>
                <div style={{ background:"var(--surface2)",border:"1px dashed var(--border2)",borderRadius:"var(--r-md)",padding:"14px 16px",fontFamily:"monospace" }}>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontWeight:700,color:"var(--text)" }}>{form.taxType}{form.remarkPeriod?` — ${form.remarkPeriod}`:""}</div>
                      {form.remarkDetail&&<div style={{ fontSize:11,color:"var(--text3)",marginTop:2 }}>{form.remarkDetail}</div>}
                    </div>
                    <div style={{ fontWeight:800,fontSize:15,color:"var(--text)" }}>{form.amount?fmtINR(form.amount):"₹—"}</div>
                  </div>
                </div>
              </>
            )}

            {msg && <div style={{ marginTop:12,fontSize:13,fontWeight:600,color:msg.startsWith("✅")?"var(--green)":msg.startsWith("⚠️")?"var(--amber)":"var(--red)" }}>{msg}</div>}

            <button className="ca-btn-primary" style={{ width:"100%",marginTop:18,justifyContent:"center" }} onClick={handleSave} disabled={saving}>
              {saving?<span className="ca-spin"/>:null}
              {saving?"Saving…":"Save Reimbursement"}
            </button>
          </div>
        )}

        {/* ── LIST TAB ── */}
        {tab==="list" && (
          <>
            {/* Summary cards */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10,marginBottom:16 }}>
              {[
                { label:"Total",           val:fmtINR(totalAmt),     color:"var(--navy)" },
                { label:"Pending Recovery",val:fmtINR(pendingAmt),   color:"var(--amber)" },
                { label:"Recovered",       val:fmtINR(recoveredAmt), color:"var(--green)" },
                { label:"Office Owes Staff",val:fmtINR(officeOwesAmt),color:"var(--purple)" },
              ].map(s=>(
                <div key={s.label} className="ca-stat" style={{ borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:18,fontWeight:800,color:s.color,fontFamily:"monospace" }}>{s.val}</div>
                  <div style={{ fontSize:11,color:"var(--text3)",marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>
              {[{k:"all",l:"All"},{k:"pending",l:"⏳ Pending"},{k:"recovered",l:"✅ Recovered"},{k:"staff",l:"💳 Office Owes Staff"}].map(f=>(
                <button key={f.k} className={`ca-filter-pill ${filter===f.k?"active":""}`} onClick={()=>setFilter(f.k)}>{f.l}</button>
              ))}
            </div>

            <div className="ca-card" style={{ overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                {filtered.length===0 ? (
                  <div style={{ textAlign:"center",padding:"40px 0",color:"var(--text4)",fontSize:13 }}>No records found.</div>
                ) : (
                  <table className="ca-tbl">
                    <thead><tr>
                      <th>Date</th><th>Client</th><th>Type</th><th>Period</th>
                      <th>Amount</th><th>Paid By</th><th>Source</th><th>Status</th><th>Actions</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map((r,i)=>{
                        const owes=r.officeOwesStaff===true||r.officeOwesStaff==="true";
                        return (
                          <tr key={i}>
                            <td style={{ fontSize:11,color:"var(--text4)",fontFamily:"monospace" }}>{r.date||"—"}</td>
                            <td><div style={{ display:"flex",alignItems:"center",gap:7 }}><Avatar name={r.clientName||"?"} size={26}/><span style={{ fontWeight:700,color:"var(--text)" }}>{r.clientName}</span></div></td>
                            <td style={{ color:"var(--text2)" }}>{r.taxType}</td>
                            <td style={{ fontSize:11,color:"var(--text3)",maxWidth:120 }}>{r.remarkPeriod||""}{r.remarkDetail&&<div style={{ color:"var(--text4)" }}>{r.remarkDetail}</div>}</td>
                            <td style={{ fontFamily:"monospace",fontWeight:700,color:"var(--text)",fontSize:14 }}>{fmtINR(r.amount)}</td>
                            <td><div style={{ display:"flex",alignItems:"center",gap:6 }}><Avatar name={r.paidBy||"O"} size={22}/><span style={{ fontSize:12 }}>{r.paidBy||"Office"}</span></div></td>
                            <td>
                              <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:10,background:r.paymentSource==="staff"?"var(--purple-l)":"var(--blue-l)",color:r.paymentSource==="staff"?"var(--purple)":"var(--blue)" }}>
                                {r.paymentSource==="staff"?"Staff":"Office Bank"}
                              </span>
                              {owes&&<div style={{ fontSize:10,color:"#be185d",fontWeight:700,marginTop:3 }}>Owes {r.paidBy}</div>}
                            </td>
                            <td>
                              <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:10,background:r.status==="Recovered"?"var(--green-l)":"var(--amber-l)",color:r.status==="Recovered"?"var(--green)":"var(--amber)" }}>
                                {r.status||"Pending"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display:"flex",gap:5 }}>
                                {r.status!=="Recovered"&&<button onClick={()=>markRecovered(r._id||i)} style={{ padding:"5px 10px",borderRadius:7,border:"1px solid var(--green)",background:"var(--green-l)",color:"var(--green)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",whiteSpace:"nowrap" }}>✓ Recovered</button>}
                                {owes&&<button onClick={()=>markOfficePaid(r._id||i)} style={{ padding:"5px 10px",borderRadius:7,border:"1px solid var(--purple)",background:"var(--purple-l)",color:"var(--purple)",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",whiteSpace:"nowrap" }}>Office Paid</button>}
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
          </>
        )}

        {/* ── STAFF RECEIVABLE ── */}
        {tab==="staff_receivable" && (
          <>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:16,fontWeight:700,color:"var(--text)" }}>Office Owes Staff</div>
              <div style={{ fontSize:13,color:"var(--text3)",marginTop:2 }}>Staff paid from personal pocket — office must reimburse them</div>
            </div>
            {(()=>{
              const owingRecs=records.filter(r=>r.officeOwesStaff===true||r.officeOwesStaff==="true");
              if (owingRecs.length===0) return (
                <div className="ca-card" style={{ padding:"40px 20px",textAlign:"center" }}>
                  <div style={{ fontSize:32,marginBottom:10 }}>✅</div>
                  <div style={{ fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:4 }}>All cleared!</div>
                  <div style={{ fontSize:13,color:"var(--text4)" }}>No pending amounts owed to staff.</div>
                </div>
              );
              const byStaff={};
              owingRecs.forEach(r=>{const n=r.paidBy||"Unknown";if(!byStaff[n])byStaff[n]=[];byStaff[n].push(r);});
              return Object.entries(byStaff).map(([name,recs])=>{
                const total=recs.reduce((s,r)=>s+Number(r.amount||0),0);
                return (
                  <div key={name} className="ca-card" style={{ padding:18,marginBottom:14 }}>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <Avatar name={name} size={36}/>
                        <div>
                          <div style={{ fontWeight:700,fontSize:15,color:"var(--text)" }}>{name}</div>
                          <div style={{ fontSize:12,color:"var(--text3)" }}>{recs.length} pending</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"monospace",fontSize:20,fontWeight:800,color:"var(--purple)" }}>{fmtINR(total)}</div>
                        <div style={{ fontSize:11,color:"var(--text4)" }}>Office owes</div>
                      </div>
                    </div>
                    {recs.map((r,j)=>(
                      <div key={j} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"var(--surface2)",borderRadius:9,marginBottom:6,gap:8,flexWrap:"wrap" }}>
                        <div>
                          <div style={{ fontWeight:600,fontSize:13,color:"var(--text)" }}>{r.clientName} — {r.taxType}</div>
                          <div style={{ fontSize:11,color:"var(--text3)",marginTop:1 }}>{r.remarkPeriod}{r.remarkDetail?` · ${r.remarkDetail}`:""} · {r.date}</div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <span style={{ fontFamily:"monospace",fontWeight:700,fontSize:14,color:"var(--purple)" }}>{fmtINR(r.amount)}</span>
                          <button onClick={()=>markOfficePaid(r._id||j)} style={{ padding:"6px 14px",borderRadius:8,border:"none",background:"var(--purple)",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)" }}>Mark Paid</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              });
            })()}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
