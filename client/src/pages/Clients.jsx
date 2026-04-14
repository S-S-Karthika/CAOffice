import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./PageWrapper";
import { Avatar, StatusBadge } from "./AppShell";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const Icon = ({ d, size=20, stroke="currentColor", fill="none", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const ICONS = {
  search:"M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  close:"M18 6L6 18M6 6l12 12",
  plus:"M12 5v14M5 12h14",
  clock:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  sync:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  trash:"M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
  warn:"M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
};
const STATUS_CFG = {
  "Pending":     { color:"#f59e0b",bg:"#fef3c7",text:"#d97706" },
  "In Progress": { color:"#3b82f6",bg:"#dbeafe",text:"#2563eb" },
  "Completed":   { color:"#10b981",bg:"#d1fae5",text:"#059669" },
  "On Hold":     { color:"#8b5cf6",bg:"#ede9fe",text:"#7c3aed" },
  "Review":      { color:"#8b5cf6",bg:"#ede9fe",text:"#7c3aed" },
};
const PENDING_STATUSES = ["Pending","In Progress","On Hold","Review"];
const WORK_TYPES = ["ITR Filing (Individual)","ITR Filing (Business)","ITR Filing (Firm/LLP)","GST Return (GSTR-1)","GST Return (GSTR-3B)","GST Return (GSTR-9)","GST Registration","Statutory Audit (TNCS)","Tax Audit (3CD)","MCA / ROC Filing","Company Incorporation","TDS Return (24Q)","TDS Return (26Q)","Net Worth Certificate","Projected P&L","Accounting / Bookkeeping","Loan Processing","Other"];
const MONTHS_LIST=["January","February","March","April","May","June","July","August","September","October","November","December"];
function getCurrentMonthLabel(){const d=new Date();return`${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}`;}

// ─── Pending Works Popup ──────────────────────────────────────────────────────
function PendingWorksPopup({ clientName, works, onClose }) {
  const pending = works.filter(w=>w.clientName?.toLowerCase()===clientName.toLowerCase()&&PENDING_STATUSES.includes(w.status||"Pending"));
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:400,cursor:"pointer" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",borderRadius:14,width:"min(480px,calc(100vw - 24px))",maxHeight:"80vh",display:"flex",flexDirection:"column",zIndex:401,boxShadow:"0 16px 48px rgba(0,0,0,.22)" }}>
        <div style={{ background:"var(--navy)",borderRadius:"14px 14px 0 0",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <div style={{ color:"#fff",fontWeight:700,fontSize:15 }}>Pending Works</div>
            <div style={{ color:"rgba(255,255,255,.5)",fontSize:12,marginTop:2 }}>{clientName} · {pending.length} pending</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#fff",padding:8,cursor:"pointer",display:"flex" }}><Icon d={ICONS.close} size={18}/></button>
        </div>
        <div style={{ overflowY:"auto",padding:16 }}>
          {pending.length===0?<div style={{ textAlign:"center",color:"#94a3b8",padding:"30px 0",fontSize:13 }}>No pending works</div>
          :pending.map((w,i)=>{const cfg=STATUS_CFG[w.status]||STATUS_CFG["Pending"];return(
            <div key={i} style={{ border:"1px solid #f1f5f9",borderLeft:`3px solid ${cfg.color}`,borderRadius:10,padding:"12px 14px",marginBottom:8 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                <div>
                  <div style={{ fontWeight:700,fontSize:13,color:"#1e293b" }}>{w.workNature||"—"}</div>
                  <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{w.month||""}</div>
                </div>
                <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:10,background:cfg.bg,color:cfg.text }}>{w.status}</span>
              </div>
              <div style={{ display:"flex",gap:12,marginTop:8,flexWrap:"wrap" }}>
                {w.assignedTo&&<div style={{ display:"flex",alignItems:"center",gap:5 }}><Avatar name={w.assignedTo} size={18}/><span style={{ fontSize:11,color:"#64748b" }}>{w.assignedTo}</span></div>}
                {w.expectedCompletion&&<div style={{ display:"flex",alignItems:"center",gap:4 }}><Icon d={ICONS.clock} size={12} stroke="#94a3b8"/><span style={{ fontSize:11,color:"#94a3b8" }}>Due {w.expectedCompletion}</span></div>}
                {w.priority==="Urgent"&&<span style={{ fontSize:10,fontWeight:700,color:"#ef4444" }}>🔴 URGENT</span>}
              </div>
            </div>
          );})}
        </div>
      </div>
    </>
  );
}

// ─── Add Work Modal ───────────────────────────────────────────────────────────
function AddWorkModal({ clientRow, staffList, caList, onClose, onSaved }) {
  const [form,setForm] = useState({ workNature:"",month:getCurrentMonthLabel(),assignedTo:"",referredBy:"",startDate:"",dueDate:"",docObtained:"Yes",pendingRemarks:"",checklist:"Yes",priority:"Normal",notes:"",fees:"" });
  const [saving,setSaving] = useState(false);
  const handle = e => setForm(p=>({...p,[e.target.name]:e.target.value}));
  const derivedStatus = form.docObtained==="Yes"?"In Progress":"Pending";
  const isUrgent = form.priority==="Urgent";
  const inp = { width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,fontFamily:"var(--font)",color:"#1e293b",background:"#fff",outline:"none" };
  const lbl = { fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:5 };
  const row2 = { display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 };
  const handleSave = async()=>{
    if(!form.workNature){alert("Work Nature required");return;} if(!form.assignedTo){alert("Assigned To required");return;}
    setSaving(true);
    try {
      await axios.post(`${API}/add-client`,{clientName:clientRow.clientName,pan:clientRow.pan||"",contactNo:clientRow.contactNo||"",address:clientRow.address||"",referredBy:form.referredBy||clientRow.referredBy||"",workNature:form.workNature,month:form.month,assignedTo:form.assignedTo,workStartDate:form.startDate,expectedCompletion:form.dueDate,documentObtained:form.docObtained,pendingRemarks:form.pendingRemarks,checklist:form.checklist,priority:form.priority,notes:form.notes,fees:form.fees,status:derivedStatus});
      onSaved(); onClose();
    } catch(err){alert("Error saving work ❌");console.error(err);} finally{setSaving(false);}
  };
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:400,cursor:"pointer" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",borderRadius:14,width:"min(520px,calc(100vw - 24px))",maxHeight:"88vh",display:"flex",flexDirection:"column",zIndex:401,boxShadow:"0 16px 48px rgba(0,0,0,.22)" }}>
        <div style={{ background:"var(--navy)",borderRadius:"14px 14px 0 0",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <Avatar name={clientRow.clientName} size={36}/>
            <div>
              <div style={{ color:"#fff",fontWeight:700,fontSize:15 }}>Add New Work</div>
              <div style={{ color:"rgba(255,255,255,.5)",fontSize:12,marginTop:1 }}>{clientRow.clientName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#fff",padding:8,cursor:"pointer",display:"flex" }}><Icon d={ICONS.close} size={18}/></button>
        </div>
        <div style={{ overflowY:"auto",padding:20 }}>
          <div style={{ marginBottom:12 }}><label style={lbl}>Work Nature *</label><select name="workNature" value={form.workNature} onChange={handle} style={inp}><option value="">+ Select work type</option>{WORK_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{ ...row2,marginBottom:10 }}>
            <div><label style={lbl}>Assigned To *</label><select name="assignedTo" value={form.assignedTo} onChange={handle} style={inp}><option value="">— Select —</option>{caList.map(n=><option key={n}>{n}</option>)}{staffList.map(n=><option key={n}>{n}</option>)}</select></div>
            <div><label style={lbl}>Referred By</label><select name="referredBy" value={form.referredBy} onChange={handle} style={inp}><option value="">— None —</option>{caList.map(n=><option key={n}>{n}</option>)}{staffList.map(n=><option key={n}>{n}</option>)}</select></div>
          </div>
          <div style={{ ...row2,marginBottom:10 }}>
            <div><label style={lbl}>Work Starts On</label><input type="date" name="startDate" value={form.startDate} onChange={handle} style={inp}/></div>
            <div><label style={lbl}>Due Date</label><input type="date" name="dueDate" value={form.dueDate} onChange={handle} style={inp}/></div>
          </div>
          <div style={{ marginBottom:10 }}><label style={lbl}>Document Obtained?</label><select name="docObtained" value={form.docObtained} onChange={handle} style={inp}><option value="Yes">Yes — Documents received</option><option value="No">No — Pending from client</option><option value="Partial">Partial</option></select></div>
          <div style={{ ...row2,marginBottom:10 }}>
            <div><label style={lbl}>Fees (₹)</label><input type="number" name="fees" placeholder="0" value={form.fees} onChange={handle} style={inp}/></div>
            <div><label style={lbl}>Priority</label>
              <div style={{ display:"flex",gap:6 }}>
                {["Normal","Urgent"].map(v=><button key={v} type="button" onClick={()=>setForm(p=>({...p,priority:v}))} style={{ flex:1,padding:"10px 8px",borderRadius:8,border:"none",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"var(--font)",background:form.priority===v?(v==="Urgent"?"#dc2626":"var(--navy)"):"#f1f5f9",color:form.priority===v?"#fff":"#475569" }}>{v==="Urgent"?"🔴 Urgent":"Normal"}</button>)}
              </div>
            </div>
          </div>
          <div><label style={lbl}>Notes</label><textarea name="notes" rows={2} placeholder="Any additional notes…" value={form.notes} onChange={handle} style={{...inp,resize:"vertical",minHeight:60}}/></div>
        </div>
        <div style={{ padding:"14px 20px",borderTop:"1px solid #f1f5f9",display:"flex",gap:10,flexShrink:0 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:8,border:"1.5px solid #e2e8f0",background:"#f8fafc",color:"#475569",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"var(--font)" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex:2,padding:"11px",borderRadius:8,border:"none",background:"var(--navy)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"var(--font)",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <Icon d={ICONS.plus} size={16} stroke="#fff"/> {saving?"Saving…":"Save Work"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ title, message, onConfirm, onClose, danger=true }) {
  const [confirming, setConfirming] = useState(false);
  async function go() {
    setConfirming(true);
    try { await onConfirm(); onClose(); }
    catch { setConfirming(false); }
  }
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:600,cursor:"pointer" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",borderRadius:16,width:"min(380px,calc(100vw - 32px))",padding:24,zIndex:601,boxShadow:"0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"var(--red-m)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Icon d={ICONS.warn} size={20} stroke="var(--red)" sw={2}/>
          </div>
          <div style={{ fontSize:16,fontWeight:700,color:"var(--text)" }}>{title}</div>
        </div>
        <div style={{ fontSize:13,color:"var(--text3)",lineHeight:1.6,marginBottom:20 }}>{message}</div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onClose} className="ca-btn-outline" style={{ flex:1,justifyContent:"center" }}>Cancel</button>
          <button onClick={go} disabled={confirming} style={{ flex:1,padding:"10px",borderRadius:"var(--r-md)",border:"none",background:"var(--red)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"var(--font)",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            <Icon d={ICONS.trash} size={14} stroke="#fff" sw={2.5}/>
            {confirming?"Deleting…":"Delete"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Client Detail Drawer ─────────────────────────────────────────────────────
function ClientDrawer({ row, allWorks, staffList, caList, onClose, onWorkAdded, onClientDeleted }) {
  const [addingWork, setAddingWork]       = useState(false);
  const [deletingWork, setDeletingWork]   = useState(null); // work object to delete
  const [confirmDeleteClient, setConfirmDeleteClient] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem("cao_user")||'{"role":"Staff"}'); } catch { return {role:"Staff"}; } })();
  const isCA = user.role === "CA";

  if (!row) return null;
  const clientWorks = allWorks.filter(w=>w.clientName?.toLowerCase()===row.clientName?.toLowerCase());
  const stats = {
    total:clientWorks.length,
    completed:clientWorks.filter(r=>r.status==="Completed").length,
    inProgress:clientWorks.filter(r=>r.status==="In Progress").length,
    pending:clientWorks.filter(r=>PENDING_STATUSES.includes(r.status||"Pending")).length,
  };

  async function deleteWork(work) {
    await axios.delete(`${API}/works/${work.id}`);
    onWorkAdded(); // refresh list
  }

  async function deleteAllClientWorks() {
    // Delete every work for this client
    await Promise.all(clientWorks.map(w => axios.delete(`${API}/works/${w.id}`)));
    onClientDeleted(row.clientName);
    onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:300,cursor:"pointer" }}/>
      <div style={{ position:"fixed",top:0,right:0,bottom:0,width:"min(430px,100vw)",background:"#fff",zIndex:301,display:"flex",flexDirection:"column",boxShadow:"-4px 0 32px rgba(0,0,0,.16)" }}>

        {/* Header */}
        <div style={{ background:"var(--navy)",padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12,minWidth:0 }}>
            <Avatar name={row.clientName} size={40}/>
            <div style={{ minWidth:0 }}>
              <div style={{ color:"#fff",fontWeight:700,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{row.clientName}</div>
              <div style={{ color:"rgba(255,255,255,.4)",fontSize:11,marginTop:2 }}>{row.pan||"No PAN"} · {row.contactNo||"No contact"}</div>
            </div>
          </div>
          <div style={{ display:"flex",gap:6,flexShrink:0 }}>
            {isCA && (
              <button onClick={()=>setAddingWork(true)} style={{ background:"rgba(255,255,255,.12)",border:"none",borderRadius:8,color:"#fff",padding:"7px 11px",cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5,fontFamily:"var(--font)" }}>
                <Icon d={ICONS.plus} size={14} stroke="#fff"/> Add Work
              </button>
            )}
            {isCA && (
              <button onClick={()=>setConfirmDeleteClient(true)} title="Delete client & all works" style={{ background:"rgba(220,38,38,.25)",border:"1px solid rgba(220,38,38,.4)",borderRadius:8,color:"#FCA5A5",padding:"7px 9px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:"var(--font)",fontSize:11,fontWeight:700 }}>
                <Icon d={ICONS.trash} size={14} stroke="#FCA5A5"/> Delete Client
              </button>
            )}
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.1)",border:"none",borderRadius:8,color:"#fff",padding:8,cursor:"pointer",display:"flex" }}>
              <Icon d={ICONS.close} size={18}/>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"#e2e8f0",borderBottom:"1px solid #e2e8f0",flexShrink:0 }}>
          {[{label:"Total",val:stats.total,color:"var(--text)"},{label:"Completed",val:stats.completed,color:"var(--green)"},{label:"Active",val:stats.inProgress,color:"var(--blue)"},{label:"Pending",val:stats.pending,color:"var(--amber)"}].map(s=>(
            <div key={s.label} style={{ background:"#fff",padding:"11px 6px",textAlign:"center" }}>
              <div style={{ fontSize:20,fontWeight:800,color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10,color:"var(--text3)",marginTop:1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Works list */}
        <div style={{ flex:1,overflowY:"auto",padding:"12px 18px" }}>
          <div style={{ fontSize:10,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:10 }}>Works ({clientWorks.length})</div>

          {clientWorks.length===0 ? (
            <div style={{ textAlign:"center",color:"var(--text4)",fontSize:13,padding:"30px 0" }}>No works yet</div>
          ) : clientWorks.map((w,i)=>{
            const cfg = STATUS_CFG[w.status]||STATUS_CFG["Pending"];
            return (
              <div key={i} style={{ border:"1px solid var(--border)",borderLeft:`3px solid ${cfg.color}`,borderRadius:10,padding:"11px 13px",marginBottom:8 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:13,fontWeight:700,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{w.workNature||"—"}</div>
                    <div style={{ fontSize:11,color:"var(--text3)",marginTop:2 }}>{w.month||""}</div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                    <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:10,background:cfg.bg,color:cfg.text,whiteSpace:"nowrap" }}>{w.status}</span>
                    {/* Delete work button — CA only */}
                    {isCA && (
                      <button
                        onClick={()=>setDeletingWork(w)}
                        title="Delete this work"
                        style={{ padding:"4px 6px",borderRadius:6,border:"1px solid #FECACA",background:"var(--red-m)",cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0 }}>
                        <Icon d={ICONS.trash} size={12} stroke="var(--red)" sw={2.5}/>
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display:"flex",gap:12,marginTop:7,flexWrap:"wrap" }}>
                  {w.assignedTo&&<div style={{ display:"flex",alignItems:"center",gap:5 }}><Avatar name={w.assignedTo} size={18}/><span style={{ fontSize:11,color:"var(--text3)" }}>{w.assignedTo}</span></div>}
                  {w.expectedCompletion&&<span style={{ fontSize:11,color:"var(--text4)" }}>Due {w.expectedCompletion}</span>}
                  {w.priority==="Urgent"&&<span style={{ fontSize:10,fontWeight:700,color:"#ef4444" }}>🔴 URGENT</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Work Modal */}
      {addingWork && (
        <AddWorkModal clientRow={row} staffList={staffList} caList={caList} onClose={()=>setAddingWork(false)} onSaved={onWorkAdded}/>
      )}

      {/* Delete single work confirm */}
      {deletingWork && (
        <DeleteConfirmModal
          title="Delete Work"
          message={<>Are you sure you want to delete <strong>{deletingWork.workNature}</strong> for <strong>{deletingWork.clientName}</strong>? This cannot be undone.</>}
          onConfirm={()=>deleteWork(deletingWork)}
          onClose={()=>setDeletingWork(null)}
        />
      )}

      {/* Delete entire client confirm */}
      {confirmDeleteClient && (
        <DeleteConfirmModal
          title="Delete Client"
          message={<>This will permanently delete <strong>{row.clientName}</strong> and all <strong>{clientWorks.length} work record{clientWorks.length!==1?"s":""}</strong> associated with this client. This cannot be undone.</>}
          onConfirm={deleteAllClientWorks}
          onClose={()=>setConfirmDeleteClient(false)}
        />
      )}
    </>
  );
}

// ─── MAIN Clients ─────────────────────────────────────────────────────────────
export default function Clients() {
  const navigate = useNavigate();
  const user = (()=>{try{return JSON.parse(localStorage.getItem("cao_user")||'{"name":"Guest","role":"Staff"}');}catch{return{name:"Guest",role:"Staff"};}})();
  const isCA = user.role==="CA";
  const [allWorks,setAllWorks] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [selected,setSelected] = useState(null);
  const [pendingPopup,setPendingPopup] = useState(null);
  const [staffList,setStaffList] = useState([]);
  const [caList,setCaList] = useState([]);
  const [sortCol,setSortCol] = useState("clientName");
  const [sortDir,setSortDir] = useState("asc");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([axios.get(`${API}/works`),axios.get(`${API}/api/users`).catch(()=>({data:[]}))])
      .then(([worksRes,userRes])=>{
        const allW=worksRes.data||[];
        setAllWorks(isCA?allW:allW.filter(w=>w.assignedTo===user.name));
        const users=userRes.data||[];
        setStaffList(users.filter(u=>u.role==="Staff").map(u=>u.name));
        setCaList(users.filter(u=>u.role==="CA").map(u=>u.name));
      }).catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(()=>{fetchAll();},[]);

  const clientMap = new Map();
  for (const row of allWorks) {
    const name=String(row.clientName||"").trim(); if(!name)continue;
    const key=name.toLowerCase();
    if(!clientMap.has(key))clientMap.set(key,{firstRow:row,allWorks:[]});
    clientMap.get(key).allWorks.push(row);
  }
  const uniqueClients = Array.from(clientMap.values()).map(({firstRow,allWorks:cw})=>{
    const pendingWorks=cw.filter(w=>PENDING_STATUSES.includes(w.status||"Pending"));
    const pendingFees=pendingWorks.reduce((sum,w)=>sum+Number(w.fees||0),0);
    return { row:firstRow,name:String(firstRow.clientName||""),pan:String(firstRow.pan||""),contactNo:String(firstRow.contactNo||""),address:String(firstRow.address||""),referredBy:String(firstRow.referredBy||""),totalWorks:cw.length,pendingWorks:pendingWorks.length,pendingFees };
  });

  const q=search.toLowerCase().trim();
  const filtered=uniqueClients.filter(c=>c.name.toLowerCase().includes(q)||c.pan.toLowerCase().includes(q)||c.contactNo.includes(q));
  const sorted=[...filtered].sort((a,b)=>{
    let av,bv;
    if(sortCol==="pendingWorks"){av=a.pendingWorks;bv=b.pendingWorks;}
    else if(sortCol==="fees"){av=a.pendingFees;bv=b.pendingFees;}
    else{av=a.name.toLowerCase();bv=b.name.toLowerCase();}
    const cmp=typeof av==="number"?av-bv:av.localeCompare(bv);
    return sortDir==="asc"?cmp:-cmp;
  });

  function handleSort(col) {
    if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortCol(col);setSortDir(col==="clientName"?"asc":"desc");}
  }

  const thStyle = col => ({
    padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#e2e8f0",
    cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",borderBottom:"2px solid rgba(255,255,255,.1)",
    background:sortCol===col?"rgba(255,255,255,.08)":"transparent",
  });

  return (
    <PageWrapper activeKey="clients" title="Clients" subtitle={`${sorted.length} client${sorted.length!==1?"s":""}`}
      rightAction={
        <button className="ca-btn-outline" style={{ fontSize:12 }} onClick={fetchAll}>
          <Icon d={ICONS.sync} size={13} sw={2}/> Sync
        </button>
      }>
      <div style={{ padding:"18px 20px" }}>
        {/* Search */}
        <div className="ca-search-wrap" style={{ marginBottom:16 }}>
          <Icon d={ICONS.search} size={15} stroke="var(--text4)"/>
          <input className="ca-search-inp" placeholder="Search client name, PAN, mobile…" value={search} onChange={e=>setSearch(e.target.value)}/>
          {search&&<button onClick={()=>setSearch("")} style={{ position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text4)",display:"flex" }}><Icon d={ICONS.close} size={15}/></button>}
        </div>

        {/* Table */}
        <div className="ca-card" style={{ overflow:"hidden" }}>
          {loading ? <div style={{ textAlign:"center",padding:"60px 0",color:"var(--text4)",fontSize:14 }}>Loading clients…</div>
          : sorted.length===0 ? <div style={{ textAlign:"center",padding:"60px 0",color:"var(--text4)",fontSize:14 }}>{search?`No clients found for "${search}"`:"No clients yet."}</div>
          : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--navy)" }}>
                    <th style={{ ...thStyle(null),width:52,cursor:"default" }}>S.No</th>
                    <th style={thStyle("clientName")} onClick={()=>handleSort("clientName")}>Name {sortCol==="clientName"?(sortDir==="asc"?"↑":"↓"):"↕"}</th>
                    <th style={{ ...thStyle(null),cursor:"default" }}>PAN</th>
                    <th style={{ ...thStyle(null),cursor:"default" }}>Mobile</th>
                    <th style={{ ...thStyle(null),cursor:"default" }} className="ca-hide-mob">Address</th>
                    <th style={{ ...thStyle(null),cursor:"default" }} className="ca-hide-mob">Referred By</th>
                    <th style={thStyle("pendingWorks")} onClick={()=>handleSort("pendingWorks")}>Pending {sortCol==="pendingWorks"?(sortDir==="asc"?"↑":"↓"):"↕"}</th>
                    <th style={thStyle("fees")} onClick={()=>handleSort("fees")}>Fees Due {sortCol==="fees"?(sortDir==="asc"?"↑":"↓"):"↕"}</th>
                    <th style={{ ...thStyle(null),cursor:"default" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c,idx) => (
                    <tr key={idx} style={{ background:idx%2===0?"#fff":"var(--surface2)",borderBottom:"1px solid var(--border)" }}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--blue-l)"}
                      onMouseLeave={e=>e.currentTarget.style.background=idx%2===0?"#fff":"var(--surface2)"}>
                      <td style={{ padding:"12px 14px",fontSize:13,color:"var(--text4)",fontWeight:600 }}>{idx+1}</td>
                      <td style={{ padding:"12px 14px",cursor:"pointer" }} onClick={()=>setSelected(c.row)}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <Avatar name={c.name} size={30}/>
                          <div>
                            <div style={{ fontWeight:700,fontSize:14,color:"var(--text)" }}>{c.name}</div>
                            {c.referredBy&&<div style={{ fontSize:11,color:"var(--text4)",marginTop:1 }}>via {c.referredBy}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 14px",fontSize:13,color:"var(--text2)",fontFamily:"monospace" }}>{c.pan||"—"}</td>
                      <td style={{ padding:"12px 14px",fontSize:13,color:"var(--text2)" }}>{c.contactNo||"—"}</td>
                      <td style={{ padding:"12px 14px",fontSize:12,color:"var(--text3)",maxWidth:160 }} className="ca-hide-mob">
                        <div style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:150 }}>{c.address||"—"}</div>
                      </td>
                      <td style={{ padding:"12px 14px",fontSize:13,color:"var(--text3)" }} className="ca-hide-mob">{c.referredBy||"—"}</td>
                      <td style={{ padding:"12px 14px" }}>
                        {c.pendingWorks>0?(
                          <button onClick={()=>setPendingPopup(c.name)} style={{ display:"inline-flex",alignItems:"center",gap:5,background:"var(--amber-l)",color:"var(--amber)",border:"1px solid #FCD34D",borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"var(--font)" }}>
                            ⏳ {c.pendingWorks} pending
                          </button>
                        ):<span style={{ fontSize:12,color:"var(--green)",fontWeight:600 }}>✓ Clear</span>}
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        {c.pendingFees>0?<span style={{ fontSize:13,fontWeight:700,color:"var(--red)" }}>₹{c.pendingFees.toLocaleString("en-IN")}</span>:<span style={{ fontSize:12,color:"var(--green)",fontWeight:600 }}>—</span>}
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        {isCA?(
                          <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                            <button onClick={()=>navigate("/add-client",{state:{prefill:{clientName:c.name,pan:c.pan,contactNo:c.contactNo,address:c.address,referredBy:c.referredBy}}})}
                              style={{ display:"inline-flex",alignItems:"center",gap:5,background:"var(--blue-l)",color:"var(--blue)",border:"1px solid var(--blue-m)",borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"var(--font)" }}>
                              <Icon d={ICONS.plus} size={13} stroke="var(--blue)"/> Work
                            </button>
                            <button
                              onClick={()=>{ if(window.confirm(`Delete ${c.name} and all their works? This cannot be undone.`)) { Promise.all(allWorks.filter(w=>w.clientName?.toLowerCase()===c.name.toLowerCase()).map(w=>axios.delete(`${API}/works/${w.id}`))).then(()=>fetchAll()); } }}
                              title="Delete client"
                              style={{ display:"inline-flex",alignItems:"center",gap:4,background:"var(--red-m)",color:"var(--red)",border:"1px solid #FECACA",borderRadius:7,padding:"6px 8px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"var(--font)" }}>
                              <Icon d={ICONS.trash} size={13} stroke="var(--red)"/>
                            </button>
                          </div>
                        ):<span style={{ fontSize:11,color:"var(--text4)" }}>View only</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected&&<ClientDrawer row={selected} allWorks={allWorks} staffList={staffList} caList={caList} onClose={()=>setSelected(null)} onWorkAdded={()=>{fetchAll();setSelected(null);}} onClientDeleted={(name)=>{ setAllWorks(prev=>prev.filter(w=>w.clientName?.toLowerCase()!==name?.toLowerCase())); setSelected(null); }}/>}
      {pendingPopup&&<PendingWorksPopup clientName={pendingPopup} works={allWorks} onClose={()=>setPendingPopup(null)}/>}
    </PageWrapper>
  );
}