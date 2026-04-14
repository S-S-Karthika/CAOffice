import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import PageWrapper from "./PageWrapper";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WORK_CATEGORIES = [
  { group:"ITR Filing", items:["ITR Filing (Individual)","ITR Filing (Business)","ITR Filing (Firm/LLP)","ITR Filing (HUF)","ITR Filing (Trust/NGO)"] },
  { group:"GST", items:["GST Return (GSTR-1)","GST Return (GSTR-3B)","GST Return (GSTR-9)","GST Return (GSTR-9C)","GST Registration","GST Cancellation","GST Reconciliation","GST Amendment"] },
  { group:"TDS / TCS", items:["TDS Return (24Q)","TDS Return (26Q)","TDS Return (27Q)","TCS Return (27EQ)","TDS Certificate (Form 16)","TDS Certificate (Form 16A)"] },
  { group:"Audit", items:["Statutory Audit","Tax Audit (3CD)","Internal Audit","Concurrent Audit","Stock Audit","Transfer Pricing Audit"] },
  { group:"Company / LLP", items:["MCA / ROC Filing","Company Incorporation","LLP Incorporation","Annual Return Filing","DIN / DSC Work","Director KYC"] },
  { group:"Accounting", items:["Accounting / Bookkeeping","Payroll Processing","Bank Reconciliation","MIS Reports","Projected P&L","CMA Data Preparation"] },
  { group:"Finance & Loans", items:["Loan Processing","Project Report","Net Worth Certificate","CC / OD Renewal","MSME Registration","Udyam Registration"] },
  { group:"Certificates & Notices", items:["Income Certificate","Tax Clearance Certificate","IT Notice Reply","GST Notice Reply","Demand / Scrutiny Handling"] },
  { group:"Other", items:["PAN Application","Aadhaar Linking","Form 15CA/CB","Trust Registration","Society Registration","Other"] },
];
const ORGANIZATION_TYPES = ["Sole Proprietorship","Partnership","Limited Liability Partnership","Private Limited Company","Public Limited Company","One-Person Company","Section 8 Company","Joint-Venture Company","Non-Government Organization (NGO)","Trust"];
function getCurrentMonthLabel() { const d=new Date(); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }

// ─── Multi-select Work Type ───────────────────────────────────────────────────
function WorkTypeSelector({ selected, onChange, disabled }) {
  const [search, setSearch] = useState("");
  const allItems = WORK_CATEGORIES.flatMap(c => c.items);
  const filtered = search.trim() ? allItems.filter(i => i.toLowerCase().includes(search.toLowerCase())) : null;
  function toggle(item) {
    if (disabled) return;
    if (selected.includes(item)) onChange(selected.filter(i => i !== item));
    else onChange([...selected, item]);
  }
  function renderItem(item) {
    const isSel = selected.includes(item);
    return (
      <div key={item} onClick={()=>toggle(item)} style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,cursor:"pointer",border:`1.5px solid ${isSel?"#BFDBFE":"transparent"}`,background:isSel?"#EFF6FF":"transparent" }}
        onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="#F8FAFC";}} onMouseLeave={e=>{if(!isSel)e.currentTarget.style.background="transparent";}}>
        <input type="checkbox" checked={isSel} readOnly tabIndex={-1} style={{ width:15,height:15,accentColor:"#2563EB",cursor:"pointer",flexShrink:0 }}/>
        <label style={{ fontSize:12.5,fontWeight:isSel?700:500,color:isSel?"#1E40AF":"var(--text2)",cursor:"pointer",lineHeight:1.3 }}>{item}</label>
      </div>
    );
  }
  return (
    <div>
      <input className="ca-inp" placeholder="🔍 Search work types…" value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:8,fontSize:13 }} disabled={disabled}/>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:4,maxHeight:260,overflowY:"auto",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",padding:10,background:"#FAFBFC" }}>
        {filtered ? filtered.map(renderItem)
          : WORK_CATEGORIES.map(cat => (
            <React.Fragment key={cat.group}>
              <div style={{ gridColumn:"1/-1",fontSize:10,fontWeight:800,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",padding:"4px 2px 2px" }}>{cat.group}</div>
              {cat.items.map(renderItem)}
            </React.Fragment>
          ))}
      </div>
      {selected.length>0&&(
        <>
          <div style={{ fontSize:11,color:"var(--text3)",marginTop:6 }}>{selected.length} work type{selected.length>1?"s":""} selected</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:6 }}>
            {selected.map(item => (
              <span key={item} style={{ display:"inline-flex",alignItems:"center",gap:4,background:"#DBEAFE",color:"#1E40AF",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700 }}>
                {item}
                {!disabled&&<button type="button" onClick={()=>toggle(item)} style={{ background:"none",border:"none",cursor:"pointer",color:"#1E40AF",fontSize:13,lineHeight:1,padding:0 }}>✕</button>}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN AddClient ───────────────────────────────────────────────────────────
export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = location.state?.prefill || {};
  const isAddWork = Object.keys(prefill).length > 0;
  const user = (()=>{try{return JSON.parse(localStorage.getItem("cao_user")||'{"name":"Guest","role":"Staff"}');}catch{return{name:"Guest",role:"Staff"};}})();

  const [staffList,setStaffList] = useState([]);
  const [caList,setCaList] = useState([]);
  const [loadingUsers,setLoadingUsers] = useState(true);
  const [saving,setSaving] = useState(false);
  const [msg,setMsg] = useState({ text:"",type:"" });

  const buildEmpty = () => ({
    clientName:prefill.clientName||"", pan:prefill.pan||"", contactNo:prefill.contactNo||"",
    address:prefill.address||"", referredBy:prefill.referredBy||"", organization:"",
    workNature:[], month:getCurrentMonthLabel(), assignedTo:"", workStartDate:"",
    expectedCompletion:"", documentObtained:"Yes", pendingRemarks:"", checklist:"Yes",
    priority:"Normal", notes:"",
  });
  const [form,setForm] = useState(buildEmpty);

  useEffect(() => {
    axios.get(`${API}/api/users`)
      .then(res => { const users=res.data||[]; setStaffList(users.filter(u=>u.role==="Staff").map(u=>u.name)); setCaList(users.filter(u=>u.role==="CA").map(u=>u.name)); })
      .catch(()=>{}).finally(()=>setLoadingUsers(false));
  },[]);

  const set = (key,val) => setForm(p=>({...p,[key]:val}));
  const handleChange = e => set(e.target.name,e.target.value);
  const derivedStatus = form.documentObtained==="Yes"?"In Progress":"Pending";
  const isUrgent = form.priority==="Urgent";

  async function handleSubmit() {
    if (!form.clientName.trim()) { setMsg({text:"⚠️ Client Name is required",type:"warn"}); return; }
    if (form.workNature.length===0) { setMsg({text:"⚠️ Select at least one Work Type",type:"warn"}); return; }
    if (!form.assignedTo) { setMsg({text:"⚠️ Assigned To is required",type:"warn"}); return; }
    setSaving(true); setMsg({text:"",type:""});
    try {
      await axios.post(`${API}/add-client`,{...form,status:derivedStatus});
      setMsg({text:"✅ Work saved successfully!",type:"ok"});
      setForm(p=>({...buildEmpty(),clientName:p.clientName,pan:p.pan,contactNo:p.contactNo,address:p.address,referredBy:p.referredBy,organization:p.organization}));
      setTimeout(()=>setMsg({text:"",type:""}),2500);
    } catch(err) { console.error(err); setMsg({text:"❌ Error saving work. Please try again.",type:"err"}); }
    finally { setSaving(false); }
  }

  const grpStyle = { marginBottom:14 };
  const row2Style = { display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 };

  return (
    <PageWrapper activeKey="add" title="Add Work" subtitle={isAddWork?`Adding work for ${prefill.clientName}`:"Log a new client work item"}>
      <div style={{ padding:"20px",maxWidth:720,margin:"0 auto" }}>

        {/* Pre-fill banner */}
        {isAddWork&&(
          <div style={{ display:"flex",alignItems:"flex-start",gap:10,background:"var(--green-l)",border:"1px solid #6EE7B7",borderRadius:10,padding:"12px 14px",marginBottom:16 }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:"#065F46",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"#065F46" }}>Client details pre-filled</div>
              <div style={{ fontSize:12,color:"#047857",marginTop:2 }}>Name, PAN, contact loaded from <strong>{prefill.clientName}</strong>'s record.</div>
            </div>
          </div>
        )}

        <div className="ca-card" style={{ padding:20 }}>

          {/* ── Client Information ── */}
          <div className="ca-section-hd">Client Information</div>

          <div style={grpStyle}>
            <label className="ca-lbl">Client Name <span style={{ color:"var(--red)" }}>*</span></label>
            <input className="ca-inp" name="clientName" placeholder="Full client name…" value={form.clientName} onChange={handleChange} autoComplete="off" readOnly={isAddWork}/>
          </div>
          <div style={{ ...row2Style,marginBottom:14 }}>
            <div>
              <label className="ca-lbl">PAN</label>
              <input className="ca-inp" name="pan" placeholder="ABCDE1234F" maxLength={10} value={form.pan}
                onChange={e=>{e.target.value=e.target.value.toUpperCase();handleChange(e);}}
                readOnly={isAddWork&&!!prefill.pan} style={{ textTransform:"uppercase",fontFamily:"monospace" }}/>
            </div>
            <div>
              <label className="ca-lbl">Contact No.</label>
              <input className="ca-inp" name="contactNo" type="tel" placeholder="9XXXXXXXXX" value={form.contactNo} onChange={handleChange} readOnly={isAddWork&&!!prefill.contactNo}/>
            </div>
          </div>
          <div style={grpStyle}>
            <label className="ca-lbl">Address</label>
            <textarea className="ca-textarea" name="address" placeholder="Door No., Street, City, State, Pincode…" value={form.address} onChange={handleChange} readOnly={isAddWork&&!!prefill.address} style={{ minHeight:60 }}/>
          </div>
          <div style={grpStyle}>
            <label className="ca-lbl">Organization Type</label>
            <select className="ca-sel" name="organization" value={form.organization} onChange={handleChange}>
              <option value="">— Select organization type —</option>
              {ORGANIZATION_TYPES.map(o=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ height:1,background:"var(--border)",margin:"16px 0" }}/>

          {/* ── Work Details ── */}
          <div className="ca-section-hd">Work Details</div>

          <div style={grpStyle}>
            <label className="ca-lbl">Work Nature <span style={{ color:"var(--red)" }}>*</span></label>
            <WorkTypeSelector selected={form.workNature} onChange={val=>set("workNature",val)} disabled={false}/>
          </div>
          <div style={grpStyle}>
            <label className="ca-lbl">Month</label>
            <div style={{ padding:"10px 13px",background:"var(--surface2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontSize:14,color:"var(--text2)" }}>
              <strong>{form.month}</strong> <span style={{ fontSize:11,color:"var(--text4)",marginLeft:4 }}>— auto-assigned</span>
            </div>
          </div>
          <div style={{ ...row2Style,marginBottom:14 }}>
            <div>
              <label className="ca-lbl">Assigned To <span style={{ color:"var(--red)" }}>*</span></label>
              <select className="ca-sel" name="assignedTo" value={form.assignedTo} onChange={handleChange} disabled={loadingUsers}>
                <option value="">{loadingUsers?"Loading…":"— Select —"}</option>
                {caList.length>0&&<optgroup label="CA">{caList.map(n=><option key={n}>{n}</option>)}</optgroup>}
                {staffList.length>0&&<optgroup label="Staff">{staffList.map(n=><option key={n}>{n}</option>)}</optgroup>}
              </select>
            </div>
            <div>
              <label className="ca-lbl">Referred By</label>
              <select className="ca-sel" name="referredBy" value={form.referredBy} onChange={handleChange} disabled={loadingUsers}>
                <option value="">— None —</option>
                {caList.length>0&&<optgroup label="CA">{caList.map(n=><option key={n}>{n}</option>)}</optgroup>}
                {staffList.length>0&&<optgroup label="Staff">{staffList.map(n=><option key={n}>{n}</option>)}</optgroup>}
              </select>
            </div>
          </div>
          <div style={{ ...row2Style,marginBottom:14 }}>
            <div><label className="ca-lbl">Work Starts On</label><input type="date" className="ca-inp" name="workStartDate" value={form.workStartDate} onChange={handleChange}/></div>
            <div><label className="ca-lbl">Expected Completion</label><input type="date" className="ca-inp" name="expectedCompletion" value={form.expectedCompletion} onChange={handleChange}/></div>
          </div>

          <div style={{ height:1,background:"var(--border)",margin:"16px 0" }}/>

          {/* ── Documents & Status ── */}
          <div className="ca-section-hd">Documents &amp; Status</div>

          <div style={grpStyle}>
            <label className="ca-lbl">Document Obtained?</label>
            <select className="ca-sel" name="documentObtained" value={form.documentObtained} onChange={handleChange}>
              <option value="Yes">Yes — Documents received</option>
              <option value="No">No — Pending from client</option>
              <option value="Partial">Partial — Some documents received</option>
            </select>
            <div style={{ marginTop:8,display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,padding:"4px 11px",borderRadius:6,
              background:derivedStatus==="Pending"?"#FEF3C7":"#D1FAE5",
              color:derivedStatus==="Pending"?"#D97706":"#059669",
              border:`1px solid ${derivedStatus==="Pending"?"#FCD34D":"#6EE7B7"}` }}>
              {derivedStatus==="Pending"?"⏳ Will be added as Pending Tasks":"✓ Will be added as In Progress"}
            </div>
          </div>

          {form.documentObtained!=="Yes"&&(
            <div style={grpStyle}>
              <label className="ca-lbl">Document Pending Remarks</label>
              <input className="ca-inp" name="pendingRemarks" placeholder="What documents are still pending?" value={form.pendingRemarks} onChange={handleChange}/>
            </div>
          )}

          <div style={grpStyle}>
            <label className="ca-lbl">Checklist Applicable?</label>
            <div style={{ display:"flex",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",overflow:"hidden" }}>
              {[["Yes","✓ Applicable","var(--green-l)","var(--green)"],["No","✗ Not Applicable","var(--red-m)","var(--red)"]].map(([val,label,bg,color])=>(
                <button key={val} type="button" onClick={()=>set("checklist",val)} style={{ flex:1,padding:"10px",textAlign:"center",fontSize:12,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"var(--font)",background:form.checklist===val?bg:"var(--surface)",color:form.checklist===val?color:"var(--text3)" }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ height:1,background:"var(--border)",margin:"16px 0" }}/>

          {/* ── Priority & Notes ── */}
          <div className="ca-section-hd">Priority &amp; Notes</div>

          <div style={grpStyle}>
            <label className="ca-lbl">Priority</label>
            <div style={{ display:"flex",gap:10 }}>
              <button type="button" onClick={()=>set("priority","Normal")} style={{ flex:1,padding:"10px",borderRadius:"var(--r-md)",background:!isUrgent?"var(--navy)":"var(--surface2)",color:!isUrgent?"#fff":"var(--text2)",border:`1.5px solid ${!isUrgent?"var(--navy)":"var(--border)"}`,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",fontSize:13 }}>Normal</button>
              <button type="button" onClick={()=>set("priority","Urgent")} style={{ flex:1,padding:"10px",borderRadius:"var(--r-md)",background:isUrgent?"#C62828":"var(--red-l)",color:isUrgent?"#fff":"var(--red)",border:`2px solid ${isUrgent?"#C62828":"var(--red-m)"}`,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",fontSize:13 }}>🔴 URGENT</button>
            </div>
          </div>

          <div style={grpStyle}>
            <label className="ca-lbl">Notes / Remarks</label>
            <textarea className="ca-textarea" name="notes" placeholder="Any additional notes…" value={form.notes} onChange={handleChange}/>
          </div>

          {msg.text&&<div className={`ca-toast ca-toast-${msg.type}`}>{msg.text}</div>}

          <div style={{ display:"flex",gap:10,marginTop:4 }}>
            <button type="button" className="ca-btn-outline" onClick={()=>{setForm(buildEmpty());setMsg({text:"",type:""});}}>Clear Fields</button>
            <button type="button" className="ca-btn-primary" style={{ flex:1 }} onClick={handleSubmit} disabled={saving}>
              {saving?<span className="ca-spin"/>:null}
              {saving?"Saving…":"Save Work"}
            </button>
          </div>

          {isAddWork&&(
            <div style={{ marginTop:14,padding:"10px 14px",background:"var(--blue-l)",borderRadius:9,fontSize:12,color:"var(--blue)",display:"flex",alignItems:"center",gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Client details stay filled — add another work for <strong style={{ marginLeft:2 }}>{prefill.clientName}</strong> instantly
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
