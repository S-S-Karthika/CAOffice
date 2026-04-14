import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./PageWrapper";
import { Avatar } from "./AppShell";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const IC = ({ d, size=18, stroke="currentColor", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const ICONS = {
  user:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  bank:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  finance:"M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  upload:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  plus:"M12 5v14M5 12h14",
  close:"M18 6L6 18M6 6l12 12",
  key:"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  eye:"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeOff:"M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22",
  check:"M20 6L9 17l-5-5",
  trash:"M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
};

const inp  = { width:"100%",padding:"10px 13px",border:"1.5px solid var(--border)",borderRadius:"var(--r-md)",fontFamily:"var(--font)",fontSize:13,color:"var(--text)",background:"var(--surface)",outline:"none",boxSizing:"border-box",transition:"border-color .2s" };
const lbl  = { fontSize:11,fontWeight:700,color:"var(--text3)",textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:6 };

function Toast({ msg }) {
  if (!msg) return null;
  const ok=msg.startsWith("✅");const err=msg.startsWith("❌");
  return <div className={`ca-toast ${ok?"ca-toast-ok":err?"ca-toast-err":"ca-toast-warn"}`}>{msg}</div>;
}

function AddUserModal({ onClose, onSaved }) {
  const [form,setForm]=useState({name:"",password:"",role:"Staff"});
  const [showPw,setShowPw]=useState(false);
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  async function save(){
    if(!form.name.trim()){setMsg("❌ Name required");return;}
    if(!form.password.trim()||form.password.length<6){setMsg("❌ Password must be 6+ chars");return;}
    setSaving(true);
    try{await axios.post(`${API}/api/register`,form);onSaved();onClose();}
    catch(e){setMsg(e.response?.data?.error||"❌ Failed to create user");}
    finally{setSaving(false);}
  }
  return (
    <div className="ca-modal-overlay">
      <div className="ca-modal">
        <div className="ca-modal-handle"/>
        <div className="ca-modal-hd"><div className="ca-modal-title">Add New User</div><div className="ca-modal-sub">Create CA or Staff login account</div></div>
        <div className="ca-modal-body">
          <div style={{ display:"flex",gap:8,marginBottom:16 }}>
            {["CA","Staff"].map(r=>(
              <button key={r} type="button" onClick={()=>setForm(p=>({...p,role:r}))} style={{ flex:1,padding:10,borderRadius:"var(--r-md)",border:`2px solid ${form.role===r?(r==="CA"?"var(--amber)":"var(--blue)"):"var(--border)"}`,background:form.role===r?(r==="CA"?"var(--amber-l)":"var(--blue-l)"):"var(--surface)",color:form.role===r?(r==="CA"?"var(--amber)":"var(--blue)"):"var(--text3)",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"var(--font)" }}>
                {r==="CA"?"🏅 CA":"👤 Staff"}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Full Name</label>
            <input style={inp} placeholder="e.g. SK KavinRaj" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
          </div>
          <div style={{ marginBottom:16,position:"relative" }}>
            <label style={lbl}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{...inp,paddingRight:42}} type={showPw?"text":"password"} placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))}/>
              <button onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text4)",display:"flex" }}><IC d={showPw?ICONS.eyeOff:ICONS.eye} size={16}/></button>
            </div>
          </div>
          <Toast msg={msg}/>
        </div>
        <div className="ca-modal-foot">
          <button className="ca-btn-outline" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="ca-btn-primary" style={{ flex:2,justifyContent:"center" }} onClick={save} disabled={saving}>
            <IC d={ICONS.plus} size={15} stroke="#fff" sw={2.5}/>{saving?"Creating…":"Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user:targetUser, onClose, onSaved }) {
  const [password,setPassword]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  async function save(){
    if(!password.trim()||password.length<6){setMsg("❌ Minimum 6 characters");return;}
    setSaving(true);
    try{await axios.patch(`${API}/api/users/${targetUser.id}/password`,{password});onSaved();onClose();}
    catch(e){setMsg(e.response?.data?.error||"❌ Failed to update password");}
    finally{setSaving(false);}
  }
  return (
    <div className="ca-modal-overlay">
      <div className="ca-modal" style={{ maxWidth:400 }}>
        <div className="ca-modal-handle"/>
        <div className="ca-modal-hd"><div className="ca-modal-title">Reset Password</div><div className="ca-modal-sub">{targetUser.name} · {targetUser.role}</div></div>
        <div className="ca-modal-body">
          <div style={{ marginBottom:18,position:"relative" }}>
            <label style={lbl}>New Password</label>
            <div style={{ position:"relative" }}>
              <input style={{...inp,paddingRight:42}} type={showPw?"text":"password"} placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/>
              <button onClick={()=>setShowPw(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text4)",display:"flex" }}><IC d={showPw?ICONS.eyeOff:ICONS.eye} size={16}/></button>
            </div>
          </div>
          <Toast msg={msg}/>
        </div>
        <div className="ca-modal-foot">
          <button className="ca-btn-outline" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="ca-btn-blue" style={{ flex:2,justifyContent:"center" }} onClick={save} disabled={saving}>{saving?"Saving…":"Update Password"}</button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon, accent="#2563EB", children }) {
  return (
    <div className="ca-card" style={{ marginBottom:16,overflow:"hidden" }}>
      <div style={{ padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:36,height:36,borderRadius:10,background:`${accent}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <IC d={icon} size={17} stroke={accent} sw={2}/>
        </div>
        <div>
          <div style={{ fontSize:14,fontWeight:700,color:"var(--text)" }}>{title}</div>
          {subtitle&&<div style={{ fontSize:11,color:"var(--text4)",marginTop:1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding:"18px 20px" }}>{children}</div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const user     = (()=>{try{return JSON.parse(localStorage.getItem("cao_user")||'{"name":"Guest","role":"Staff"}');}catch{return{name:"Guest",role:"Staff"};}})();
  const isCA     = user.role==="CA";

  const [bank,setBank]=useState({bankName:"",accountNo:"",ifsc:"",upiId:""});
  const [balance,setBalance]=useState({openingBalance:"0"});
  const [users,setUsers]=useState([]);
  const [bulkText,setBulkText]=useState("");
  const [importResult,setImportResult]=useState(null);
  const [bankSaving,setBankSaving]=useState(false);
  const [balanceSaving,setBalanceSaving]=useState(false);
  const [bankMsg,setBankMsg]=useState("");
  const [balanceMsg,setBalanceMsg]=useState("");
  const [importSaving,setImportSaving]=useState(false);
  const [showAddUser,setShowAddUser]=useState(false);
  const [resetPwUser,setResetPwUser]=useState(null);
  const [deletingId,setDeletingId]=useState(null);

  useEffect(()=>{
    axios.get(`${API}/api/settings`).then(r=>{const s=r.data||{};setBank({bankName:s.bankName||"",accountNo:s.accountNo||"",ifsc:s.ifsc||"",upiId:s.upiId||""});setBalance({openingBalance:s.openingBalance||"0"});}).catch(()=>{});
    if(isCA) loadUsers();
  },[]);

  function loadUsers(){axios.get(`${API}/api/users/all`).then(r=>setUsers(r.data||[])).catch(()=>{});}
  async function saveBankDetails(){setBankSaving(true);setBankMsg("");try{await axios.post(`${API}/api/settings`,bank);setBankMsg("✅ Bank details saved");setTimeout(()=>setBankMsg(""),3000);}catch{setBankMsg("❌ Failed to save");}finally{setBankSaving(false);}}
  async function saveBalance(){setBalanceSaving(true);setBalanceMsg("");try{await axios.post(`${API}/api/settings`,balance);setBalanceMsg("✅ Saved");setTimeout(()=>setBalanceMsg(""),3000);}catch{setBalanceMsg("❌ Failed");}finally{setBalanceSaving(false);}}
  async function deleteUser(id,name){if(!window.confirm(`Delete "${name}"?`))return;setDeletingId(id);try{await axios.delete(`${API}/api/users/${id}`);loadUsers();}catch{alert("Failed to delete");}finally{setDeletingId(null);}}
  async function handleBulkImport(){if(!bulkText.trim()){alert("Enter at least one client");return;}setImportSaving(true);setImportResult(null);try{const r=await axios.post(`${API}/api/bulk-import`,{text:bulkText});setImportResult(r.data);if(r.data.imported>0)setBulkText("");}catch{setImportResult({imported:0,errors:["Server error"]});}finally{setImportSaving(false);}}
  async function exportCSV(type){try{const r=await axios.get(`${API}/${type==="works"?"/works":"/reimbursements"}`);const rows=r.data||[];if(!rows.length){alert("No data");return;}const h=Object.keys(rows[0]);const csv=[h.join(","),...rows.map(r=>h.map(k=>`"${String(r[k]??"")}"`).join(","))].join("\n");const b=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(b);const a=document.createElement("a");a.href=url;a.download=`${type}_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);}catch{alert("Export failed");}}
  function signOut(){localStorage.removeItem("cao_user");navigate("/");}

  function RoleBadge({role}){
    const isCAR=role==="CA";
    return <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,background:isCAR?"var(--amber-l)":"var(--blue-m)",color:isCAR?"var(--amber)":"var(--blue)",border:`1px solid ${isCAR?"#FCD34D":"#BFDBFE"}` }}>{role}</span>;
  }

  return (
    <PageWrapper activeKey="settings" title="Settings" subtitle="App configuration & preferences">
      <div style={{ padding:"20px",maxWidth:760,margin:"0 auto" }}>

        {/* Profile */}
        <SectionCard title="Profile" subtitle="Your account information" icon={ICONS.user} accent="#2563EB">
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
            <Avatar name={user.name} size={52}/>
            <div>
              <div style={{ fontSize:17,fontWeight:700,color:"var(--text)" }}>{user.name}</div>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:4 }}>
                <RoleBadge role={user.role}/>
                <span style={{ fontSize:12,color:"var(--text4)" }}>{isCA?"Full access — CA administrator":"Limited access — assigned works only"}</span>
              </div>
            </div>
          </div>
          <button className="ca-btn-danger" style={{ width:"100%",padding:13,borderRadius:"var(--r-md)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:14,fontWeight:700 }} onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </SectionCard>

        {/* Team management */}
        {isCA && (
          <SectionCard title="Team Management" subtitle="Add, remove or reset passwords for CA and Staff accounts" icon={ICONS.shield} accent="#7C3AED">
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
              <div style={{ fontSize:13,color:"var(--text3)" }}>{users.length} user{users.length!==1?"s":""} in system</div>
              <button className="ca-btn-blue" style={{ fontSize:12,padding:"7px 14px" }} onClick={()=>setShowAddUser(true)}>
                <IC d={ICONS.plus} size={14} stroke="#fff" sw={2.5}/> Add User
              </button>
            </div>
            {users.length===0 ? (
              <div style={{ textAlign:"center",color:"var(--text4)",padding:"24px 0",fontSize:13 }}>No users found</div>
            ) : (
              /* Scrollable wrapper — on mobile swipe left to see Reset/Delete */
              <div style={{ border:"1px solid var(--border)",borderRadius:"var(--r-md)",overflowX:"auto",WebkitOverflowScrolling:"touch" }}>
                <div style={{ minWidth:520 }}>
                  {/* Header row */}
                  <div style={{ display:"grid",gridTemplateColumns:"36px 1fr 80px 100px 96px",background:"var(--surface2)",padding:"9px 14px",borderBottom:"1px solid var(--border)" }}>
                    {["#","Name","Role","Created","Actions"].map(h=>(
                      <div key={h} style={{ fontSize:10,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".07em",whiteSpace:"nowrap" }}>{h}</div>
                    ))}
                  </div>
                  {/* Data rows */}
                  {users.map((u,idx)=>{
                    const isSelf=u.name===user.name;
                    const isDeleting=deletingId===u.id;
                    const created=u.created_at?new Date(u.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"}):"—";
                    return (
                      <div key={u.id} style={{ display:"grid",gridTemplateColumns:"36px 1fr 80px 100px 96px",padding:"11px 14px",borderBottom:idx<users.length-1?"1px solid var(--border)":"none",alignItems:"center",background:isSelf?"var(--surface2)":"var(--surface)",minWidth:520 }}>
                        <div style={{ fontSize:12,color:"var(--text4)",fontWeight:600 }}>{idx+1}</div>
                        <div style={{ display:"flex",alignItems:"center",gap:9,minWidth:0 }}>
                          <Avatar name={u.name} size={28}/>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:13,fontWeight:600,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                              {u.name}
                              {isSelf&&<span style={{ marginLeft:6,fontSize:10,color:"var(--blue)",fontWeight:700 }}>You</span>}
                            </div>
                          </div>
                        </div>
                        <div><RoleBadge role={u.role}/></div>
                        <div style={{ fontSize:12,color:"var(--text3)",whiteSpace:"nowrap" }}>{created}</div>
                        <div style={{ display:"flex",gap:5,flexShrink:0 }}>
                          <button
                            onClick={()=>setResetPwUser(u)}
                            title="Reset password"
                            style={{ padding:"6px 8px",borderRadius:6,border:"1px solid var(--border)",background:"var(--purple-l)",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"var(--purple)",fontSize:11,fontWeight:600,fontFamily:"var(--font)",whiteSpace:"nowrap" }}>
                            <IC d={ICONS.key} size={13} stroke="var(--purple)"/>
                            <span style={{ display:"inline" }}>Reset</span>
                          </button>
                          {!isSelf&&(
                            <button
                              onClick={()=>deleteUser(u.id,u.name)}
                              disabled={isDeleting}
                              title="Delete user"
                              style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #FECACA",background:"var(--red-m)",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"var(--red)",fontSize:11,fontWeight:600,fontFamily:"var(--font)",opacity:isDeleting?.5:1,whiteSpace:"nowrap" }}>
                              <IC d={ICONS.trash} size={13} stroke="var(--red)"/>
                              <span style={{ display:"inline" }}>Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Scroll hint on mobile */}
                <div style={{ padding:"6px 14px 8px",background:"var(--surface2)",borderTop:"1px solid var(--border)",fontSize:10,color:"var(--text4)",textAlign:"right" }} className="ca-hide-desktop-hint">
                  ← swipe to see all columns
                </div>
              </div>
            )}
            <div style={{ marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[
                { role:"CA",    color:"var(--amber)", bg:"var(--amber-l)", perms:["View all works & clients","Add / delete works","Generate invoices","Mark fees received","Manage team members","Export data"] },
                { role:"Staff", color:"var(--blue)",  bg:"var(--blue-l)",  perms:["View own assigned works","Update work status","View own attendance","Request leave","Cannot add/delete works","Cannot see other staff data"] },
              ].map(({role,color,bg,perms})=>(
                <div key={role} style={{ background:bg,borderRadius:10,padding:"12px 14px" }}>
                  <div style={{ fontSize:12,fontWeight:700,color,marginBottom:8 }}>{role} Permissions</div>
                  {perms.map(p=>(
                    <div key={p} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
                      <div style={{ width:5,height:5,borderRadius:"50%",background:color,flexShrink:0 }}/>
                      <span style={{ fontSize:11,color:"var(--text2)" }}>{p}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Bank & UPI */}
        {isCA && (
          <SectionCard title="Bank & UPI Details" subtitle="Used in invoices and WhatsApp messages" icon={ICONS.bank} accent="#059669">
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:12 }}>
              <div><label style={lbl}>Bank Name</label><input style={inp} placeholder="e.g. State Bank of India" value={bank.bankName} onChange={e=>setBank(p=>({...p,bankName:e.target.value}))}/></div>
              <div><label style={lbl}>Account No.</label><input style={{...inp,fontFamily:"monospace"}} placeholder="Account number" value={bank.accountNo} onChange={e=>setBank(p=>({...p,accountNo:e.target.value}))}/></div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
              <div><label style={lbl}>IFSC Code</label><input style={{...inp,fontFamily:"monospace",textTransform:"uppercase"}} placeholder="SBIN0001234" value={bank.ifsc} onChange={e=>setBank(p=>({...p,ifsc:e.target.value.toUpperCase()}))}/></div>
              <div><label style={lbl}>UPI ID</label><input style={inp} placeholder="yourname@upi" value={bank.upiId} onChange={e=>setBank(p=>({...p,upiId:e.target.value}))}/></div>
            </div>
            <button className="ca-btn-green" style={{ padding:"11px 24px",display:"flex",alignItems:"center",gap:7 }} onClick={saveBankDetails} disabled={bankSaving}>
              <IC d={ICONS.check} size={14} stroke="#fff" sw={2.5}/>{bankSaving?"Saving…":"Save Bank Details"}
            </button>
            <Toast msg={bankMsg}/>
          </SectionCard>
        )}

        {/* Opening Balance */}
        {isCA && (
          <SectionCard title="Opening Balance" subtitle="Set starting cash balance for Finance tracking" icon={ICONS.finance} accent="#D97706">
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Opening Cash Balance (₹)</label>
              <input style={{...inp,fontFamily:"monospace",fontSize:16}} type="number" placeholder="0" value={balance.openingBalance} onChange={e=>setBalance({openingBalance:e.target.value})}/>
            </div>
            <button style={{ padding:"11px 24px",borderRadius:"var(--r-md)",border:"none",background:"var(--amber)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"var(--font)",display:"flex",alignItems:"center",gap:7 }} onClick={saveBalance} disabled={balanceSaving}>
              <IC d={ICONS.check} size={14} stroke="#fff" sw={2.5}/>{balanceSaving?"Saving…":"Save Balance"}
            </button>
            <Toast msg={balanceMsg}/>
          </SectionCard>
        )}

        {/* Bulk Import */}
        {isCA && (
          <SectionCard title="Bulk Client Import" subtitle="One per line: Name, PAN, Mobile, Referred By" icon={ICONS.upload} accent="#2563EB">
            <div style={{ marginBottom:8,padding:"8px 12px",background:"var(--surface2)",borderRadius:8,fontSize:12,color:"var(--text3)",fontFamily:"monospace",border:"1px dashed var(--border)" }}>
              Format: Mohan Traders, ABCPM1234P, 9876543210, CA SK KavinRaj
            </div>
            <textarea className="ca-textarea" style={{ fontFamily:"monospace",fontSize:12,marginBottom:14,minHeight:90 }} placeholder={"Ramesh Traders, AABCR1234F, 9876543210\nVelu Textiles, AADFV5678K, 9123456789"} value={bulkText} onChange={e=>setBulkText(e.target.value)}/>
            <button className="ca-btn-primary" style={{ padding:"11px 24px",display:"flex",alignItems:"center",gap:7 }} onClick={handleBulkImport} disabled={importSaving}>
              <IC d={ICONS.upload} size={15} stroke="#fff"/>{importSaving?"Importing…":"Import Clients"}
            </button>
            {importResult && (
              <div style={{ marginTop:10,padding:"10px 14px",borderRadius:"var(--r-md)",background:importResult.imported>0?"var(--green-l)":"var(--red-m)",border:`1px solid ${importResult.imported>0?"#6EE7B7":"#FECACA"}` }}>
                <div style={{ fontSize:13,fontWeight:700,color:importResult.imported>0?"var(--green)":"var(--red)" }}>
                  {importResult.imported>0?`✅ ${importResult.imported} client(s) imported`:"❌ Import failed"}
                </div>
                {importResult.errors?.length>0&&<div style={{ marginTop:4,fontSize:11,color:"var(--red)" }}>{importResult.errors.map((e,i)=><div key={i}>{e}</div>)}</div>}
              </div>
            )}
          </SectionCard>
        )}

        {/* Data Export */}
        {isCA && (
          <SectionCard title="Data Export" subtitle="Download your data as CSV" icon={ICONS.download} accent="#6B7280">
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <button className="ca-btn-outline" style={{ padding:14,justifyContent:"center" }} onClick={()=>exportCSV("works")}>
                <IC d={ICONS.download} size={15} stroke="var(--blue)"/> Export Works CSV
              </button>
              <button className="ca-btn-outline" style={{ padding:14,justifyContent:"center" }} onClick={()=>exportCSV("finance")}>
                <IC d={ICONS.download} size={15} stroke="var(--green)"/> Export Finance CSV
              </button>
            </div>
          </SectionCard>
        )}

        <div style={{ textAlign:"center",padding:"14px 0",color:"var(--text4)",fontSize:12 }}>CA Office · Developed by Karthika SS</div>
      </div>

      {showAddUser  && <AddUserModal onClose={()=>setShowAddUser(false)} onSaved={loadUsers}/>}
      {resetPwUser  && <ResetPasswordModal user={resetPwUser} onClose={()=>setResetPwUser(null)} onSaved={loadUsers}/>}
    </PageWrapper>
  );
}