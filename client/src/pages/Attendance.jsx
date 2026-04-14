/* ─────────────────────────────────────────────────────────────
   ATTENDANCE.JSX  — PageWrapper shell, ALL logic preserved
───────────────────────────────────────────────────────────── */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import PageWrapper from "./PageWrapper";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

const S_ATT = `
  .att-clock-time{font-family:'SF Mono','Fira Code',monospace;font-size:52px;font-weight:600;color:var(--navy);letter-spacing:2px;line-height:1;text-align:center}
  .att-clock-date{font-size:13px;color:var(--text3);margin-top:6px;text-align:center}
  .att-session-row{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface2);border-radius:8px;margin-bottom:6px;font-size:13px}
  .att-session-num{font-weight:700;color:var(--navy2);min-width:70px}
  .att-session-times{color:var(--text2);font-family:monospace;font-size:12px}
  .att-session-dur{margin-left:auto;font-size:11px;font-weight:700;color:var(--green);background:var(--green-l);padding:2px 8px;border-radius:10px}
  .att-badge{display:inline-block;font-size:10px;font-weight:700;padding:3px 9px;border-radius:10px}
  .att-badge-present{background:var(--green-l);color:var(--green)}
  .att-badge-absent{background:var(--red-m);color:var(--red)}
  .att-badge-leave{background:var(--amber-l);color:var(--amber)}
  .att-badge-halfday{background:var(--purple-l);color:var(--purple)}
  .att-salary-card{border:1px solid var(--border);border-radius:10px;padding:14px 16px;background:var(--surface)}
  .att-salary-name{font-weight:700;font-size:13px;color:var(--navy);margin-bottom:8px}
  .att-salary-row{display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;color:var(--text3)}
  .att-salary-row span:last-child{font-weight:700;color:var(--text)}
  .att-salary-total{margin-top:8px;padding-top:8px;border-top:1px solid var(--border);display:flex;justify-content:space-between;font-size:14px;font-weight:800;color:var(--navy)}
`;

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS_ATT = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getIST(){const now=new Date();const utc=now.getTime()+now.getTimezoneOffset()*60000;return new Date(utc+5.5*3600000);}
function fmtTime(d){return`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;}
function fmtTimeShort(d){return`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;}
function fmtDate(d){return`${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_ATT[d.getMonth()]} ${d.getFullYear()}`;}
function fmtDateKey(d){return`${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;}
function diffMins(start,end){return Math.max(0,Math.round((end-start)/60000));}
function minsToHM(m){return`${Math.floor(m/60)}h ${m%60}m`;}

function AttAvatar({name="?",size=30}){
  const COLS=["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#06b6d4","#ec4899"];
  const bg=COLS[(String(name).charCodeAt(0)||0)%COLS.length];
  return<div style={{width:size,height:size,borderRadius:"50%",background:bg,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*.4,fontWeight:700}}>{String(name)[0]?.toUpperCase()}</div>;
}

export function Attendance() {
  const location = useLocation();
  const currentUser=(()=>{try{return JSON.parse(localStorage.getItem("cao_user")||'{"name":"Guest","role":"Staff"}');}catch{return{name:"Guest",role:"Staff"};}})();
  const isAdmin=currentUser.role==="CA";
  const [tab,setTab]=useState("my");
  const [ist,setIst]=useState(getIST());
  const [sessions,setSessions]=useState([]);
  const [checkedIn,setCheckedIn]=useState(false);
  const [leaveForm,setLeaveForm]=useState({type:"Full Day",date:fmtDateKey(getIST()),reason:""});
  const [leaveMsg,setLeaveMsg]=useState("");
  const [history,setHistory]=useState([]);
  const [histMonth,setHistMonth]=useState(`${MONTHS_ATT[getIST().getMonth()]} ${getIST().getFullYear()}`);
  const [allStaff,setAllStaff]=useState([]);
  const [allAttendance,setAllAttendance]=useState([]);
  const [adminMonth,setAdminMonth]=useState(`${MONTHS_ATT[getIST().getMonth()]} ${getIST().getFullYear()}`);
  const [salarySettings,setSalarySettings]=useState({});

  useEffect(()=>{const t=setInterval(()=>setIst(getIST()),1000);return()=>clearInterval(t);},[]);
  useEffect(()=>{loadTodaySessions();loadHistory();if(isAdmin)loadAdminData();},[location]);

  async function loadTodaySessions(){try{const res=await axios.get(`${API}/attendance/today`,{params:{name:currentUser.name,date:fmtDateKey(getIST())}});const rows=res.data||[];const parsed=rows.map(r=>({checkIn:r.checkIn?new Date(r.checkIn):null,checkOut:r.checkOut?new Date(r.checkOut):null}));setSessions(parsed);if(parsed.length>0&&!parsed[parsed.length-1].checkOut)setCheckedIn(true);}catch{}}
  async function loadHistory(){try{const res=await axios.get(`${API}/attendance/history`,{params:{name:currentUser.name}});setHistory(res.data||[]);}catch{setHistory([]);}}
  async function loadAdminData(){try{const[usersRes,attRes]=await Promise.all([axios.get(`${API}/api/users`),axios.get(`${API}/attendance/all`)]);setAllStaff(usersRes.data||[]);setAllAttendance(attRes.data||[]);}catch{setAllStaff([]);}}

  async function handleCheckIn(){const now=getIST();const newSession={checkIn:now,checkOut:null};const updated=[...sessions,newSession];setSessions(updated);setCheckedIn(true);try{await axios.post(`${API}/attendance/checkin`,{name:currentUser.name,role:currentUser.role,date:fmtDateKey(now),checkIn:now.toISOString(),session:updated.length});}catch(e){console.error(e);}}
  async function handleCheckOut(){const now=getIST();const updated=sessions.map((s,i)=>i===sessions.length-1&&!s.checkOut?{...s,checkOut:now}:s);setSessions(updated);setCheckedIn(false);const totalMins=updated.reduce((sum,s)=>s.checkOut?sum+diffMins(s.checkIn,s.checkOut):sum,0);try{await axios.post(`${API}/attendance/checkout`,{name:currentUser.name,role:currentUser.role,date:fmtDateKey(now),checkOut:now.toISOString(),session:updated.length,totalMins});}catch(e){console.error(e);}}
  async function handleLeaveSubmit(){if(!leaveForm.reason.trim()){setLeaveMsg("Please enter a reason.");return;}try{await axios.post(`${API}/attendance/leave`,{name:currentUser.name,role:currentUser.role,date:leaveForm.date,leaveType:leaveForm.type,reason:leaveForm.reason});setLeaveMsg("✅ Leave request submitted successfully.");setLeaveForm(p=>({...p,reason:""}));loadHistory();setTimeout(()=>setLeaveMsg(""),3000);}catch{setLeaveMsg("❌ Failed to submit leave. Try again.");}}

  const totalMinsToday=sessions.reduce((sum,s)=>{const out=s.checkOut||getIST();return s.checkIn?sum+diffMins(s.checkIn,out):sum;},0);
  const filteredHistory=history.filter(h=>{if(!h.date)return false;const[d,m,y]=h.date.split("-").map(Number);const dt=new Date(y,m-1,d);return`${MONTHS_ATT[dt.getMonth()]} ${dt.getFullYear()}`===histMonth;});

  function buildAdminSummary(){return allStaff.map(staff=>{const rows=allAttendance.filter(r=>r.name===staff.name&&r.month===adminMonth);const presentDays=rows.filter(r=>r.status==="Present").length;const fullLeaves=rows.filter(r=>r.leaveType==="Full Day").length;const halfLeaves=rows.filter(r=>r.leaveType==="Half Day (AM)"||r.leaveType==="Half Day (PM)").length;const permissions=rows.filter(r=>r.leaveType==="Permission").length;const absentDays=rows.filter(r=>r.status==="Absent").length;const perDay=salarySettings[staff.name]?.perDay||0;const deductDays=fullLeaves+halfLeaves*.5;const netDays=Math.max(0,presentDays-deductDays);const salary=Math.round(perDay*netDays);return{...staff,presentDays,fullLeaves,halfLeaves,permissions,absentDays,deductDays,netDays,salary,perDay};});}

  function exportCSV(type){let rows,filename;if(type==="my"){rows=[["Date","Status","Sessions","Total Hours","Leave Type","Reason"],...filteredHistory.map(h=>[h.date||"",h.status||"",(h.sessions||[]).map(s=>`${s.checkIn||""}→${s.checkOut||""}`).join("|"),h.totalMins?minsToHM(h.totalMins):"—",h.leaveType||"",h.reason||""])];filename=`attendance_${currentUser.name}_${histMonth.replace(" ","_")}.csv`;}else{const summary=buildAdminSummary();rows=[["Name","Role","Present Days","Full Leaves","Half Leaves","Permissions","Absent","Per Day (₹)","Net Payable Days","Salary (₹)"],...summary.map(s=>[s.name,s.role,s.presentDays,s.fullLeaves,s.halfLeaves,s.permissions,s.absentDays,s.perDay,s.netDays,s.salary])];filename=`attendance_summary_${adminMonth.replace(" ","_")}.csv`;}const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}

  const monthOptions=[];const now2=getIST();for(let i=0;i<12;i++){const d=new Date(now2.getFullYear(),now2.getMonth()-i,1);monthOptions.push(`${MONTHS_ATT[d.getMonth()]} ${d.getFullYear()}`);}
  const adminSummary=buildAdminSummary();

  const cardStyle={padding:20,marginBottom:16};
  const secTitle={fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".08em",marginBottom:14};
  const inp={width:"100%",padding:"10px 13px",border:"1.5px solid var(--border)",borderRadius:9,fontFamily:"var(--font)",fontSize:13,color:"var(--text)",background:"var(--surface)",outline:"none"};
  const lbl={fontSize:11,fontWeight:700,color:"var(--text2)",textTransform:"uppercase",letterSpacing:".04em",display:"block",marginBottom:6};

  return (
    <PageWrapper activeKey="attend" title="Attendance" subtitle="Track check-ins and leave requests">
      <style>{S_ATT}</style>
      <div style={{ maxWidth:900,margin:"0 auto",padding:"0 20px 20px" }}>
        {/* Tabs */}
        <div className="ca-tabs" style={{ margin:"0 0 20px",borderBottom:"2px solid var(--border)" }}>
          <button className={`ca-tab ${tab==="my"?"active":""}`} onClick={()=>setTab("my")}>My Attendance</button>
          {isAdmin&&<button className={`ca-tab ${tab==="admin"?"active":""}`} onClick={()=>setTab("admin")}>All Staff Summary</button>}
          {isAdmin&&<button className={`ca-tab ${tab==="salary"?"active":""}`} onClick={()=>setTab("salary")}>Salary Calculator</button>}
        </div>

        {tab==="my"&&(
          <>
            {/* Clock card */}
            <div className="ca-card" style={cardStyle}>
              <div style={{ paddingBottom:16 }}>
                <div className="att-clock-time">{fmtTime(ist)}</div>
                <div className="att-clock-date">{fmtDate(ist)}</div>
                <div style={{ textAlign:"center",marginTop:4 }}><span style={{ fontSize:11,color:"var(--blue)",fontWeight:600,background:"var(--blue-l)",padding:"2px 10px",borderRadius:20,display:"inline-block" }}>India Standard Time (IST · UTC+5:30)</span></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16 }}>
                <button onClick={handleCheckIn} disabled={checkedIn} style={{ padding:14,borderRadius:10,border:"none",background:checkedIn?"#86EFAC":"var(--green)",color:"#fff",fontSize:15,fontWeight:700,cursor:checkedIn?"not-allowed":"pointer",fontFamily:"var(--font)",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Check In
                </button>
                <button onClick={handleCheckOut} disabled={!checkedIn} style={{ padding:14,borderRadius:10,border:"none",background:!checkedIn?"#FCA5A5":"var(--red)",color:"#fff",fontSize:15,fontWeight:700,cursor:!checkedIn?"not-allowed":"pointer",fontFamily:"var(--font)",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Check Out
                </button>
              </div>
              {sessions.length>0&&(
                <>
                  <div style={{ fontSize:11,fontWeight:700,color:"var(--text4)",textTransform:"uppercase",letterSpacing:".08em",margin:"16px 0 8px" }}>Today Sessions</div>
                  {sessions.map((s,i)=>{const dur=s.checkIn&&s.checkOut?diffMins(s.checkIn,s.checkOut):null;return(
                    <div className="att-session-row" key={i}>
                      <span className="att-session-num">Session {i+1}</span>
                      <span className="att-session-times">{s.checkIn?fmtTimeShort(s.checkIn):"—"} → {s.checkOut?fmtTimeShort(s.checkOut):checkedIn&&i===sessions.length-1?<span style={{color:"var(--green)",fontWeight:700}}>Ongoing</span>:"—"}</span>
                      {dur!==null&&<span className="att-session-dur">{minsToHM(dur)}</span>}
                    </div>
                  );})}
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"var(--navy)",borderRadius:8,marginTop:8 }}>
                    <span style={{ fontSize:12,color:"#94A3B8",fontWeight:600 }}>Total time today</span>
                    <span style={{ fontFamily:"monospace",fontSize:15,color:"#fff",fontWeight:700 }}>{minsToHM(totalMinsToday)}</span>
                  </div>
                </>
              )}
              {sessions.length===0&&<div style={{ textAlign:"center",color:"var(--text4)",fontSize:13,paddingTop:12 }}>No sessions today. Click Check In to start.</div>}
            </div>

            {/* Leave request */}
            <div className="ca-card" style={cardStyle}>
              <div style={secTitle}>Request Leave</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                <div><label style={lbl}>Type</label><select style={inp} value={leaveForm.type} onChange={e=>setLeaveForm(p=>({...p,type:e.target.value}))}><option>Full Day</option><option>Half Day (AM)</option><option>Half Day (PM)</option><option>Permission</option></select></div>
                <div><label style={lbl}>Date</label><input type="date" style={inp} value={leaveForm.date.split("-").reverse().join("-")} onChange={e=>{const[y,m,d]=e.target.value.split("-");setLeaveForm(p=>({...p,date:`${d}-${m}-${y}`}));}}/></div>
              </div>
              <div style={{ marginBottom:12 }}><label style={lbl}>Reason</label><input style={inp} placeholder="Brief reason…" value={leaveForm.reason} onChange={e=>setLeaveForm(p=>({...p,reason:e.target.value}))}/></div>
              <button className="ca-btn-primary" style={{ width:"100%" }} onClick={handleLeaveSubmit}>Submit Leave Request</button>
              {leaveMsg&&<div style={{ marginTop:10,fontSize:13,color:leaveMsg.startsWith("✅")?"var(--green)":"var(--red)",fontWeight:600 }}>{leaveMsg}</div>}
            </div>

            {/* History */}
            <div className="ca-card" style={{ ...cardStyle,padding:0,overflow:"hidden" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontSize:14,fontWeight:700,color:"var(--text)" }}>My Attendance History</span>
                <div style={{ display:"flex",gap:8 }}>
                  <select style={{ ...inp,width:"auto",padding:"7px 12px",fontSize:12 }} value={histMonth} onChange={e=>setHistMonth(e.target.value)}>{monthOptions.map(m=><option key={m}>{m}</option>)}</select>
                  <button className="ca-btn-green" style={{ fontSize:12,padding:"7px 14px" }} onClick={()=>exportCSV("my")}>Export CSV</button>
                </div>
              </div>
              {filteredHistory.length===0?<div style={{ textAlign:"center",color:"var(--text4)",fontSize:13,padding:"24px 0" }}>No history for {histMonth}</div>:(
                <div style={{ overflowX:"auto" }}>
                  <table className="ca-tbl">
                    <thead><tr><th>Date</th><th>Status</th><th>Sessions</th><th>Total Hours</th><th>Leave / Reason</th></tr></thead>
                    <tbody>
                      {filteredHistory.map((h,i)=>(
                        <tr key={i}>
                          <td style={{ fontWeight:600,color:"var(--text)" }}>{h.date}</td>
                          <td><span className={`att-badge ${h.status==="Present"?"att-badge-present":h.leaveType?"att-badge-leave":"att-badge-absent"}`}>{h.leaveType||h.status||"—"}</span></td>
                          <td style={{ fontFamily:"monospace",fontSize:12 }}>{(h.sessions||[]).length>0?(h.sessions||[]).map((s,j)=><div key={j}>{s.checkIn} → {s.checkOut||"ongoing"}</div>):"—"}</td>
                          <td style={{ fontFamily:"monospace",fontWeight:600 }}>{h.totalMins?minsToHM(h.totalMins):"—"}</td>
                          <td style={{ color:"var(--text3)",fontSize:12 }}>{h.reason||"—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {tab==="admin"&&isAdmin&&(
          <>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
              <div><div style={{ fontSize:18,fontWeight:700,color:"var(--text)",marginBottom:2 }}>All Staff Attendance</div><div style={{ fontSize:13,color:"var(--text3)" }}>Leave count & attendance summary</div></div>
              <div style={{ display:"flex",gap:8 }}>
                <select style={{ padding:"8px 12px",border:"1.5px solid var(--border)",borderRadius:8,fontFamily:"var(--font)",fontSize:13,color:"var(--text)",background:"var(--surface)",outline:"none",cursor:"pointer" }} value={adminMonth} onChange={e=>setAdminMonth(e.target.value)}>{monthOptions.map(m=><option key={m}>{m}</option>)}</select>
                <button className="ca-btn-green" style={{ fontSize:12,padding:"7px 14px" }} onClick={()=>exportCSV("admin")}>Export CSV</button>
              </div>
            </div>
            <div className="ca-card" style={{ overflow:"hidden",padding:0 }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:"var(--navy)" }}>{["S.No","Name","Role","Present","Full Leaves","Half Days","Permissions","Absent","Total Leaves"].map(h=><th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#E2E8F0",textTransform:"uppercase",letterSpacing:".06em",borderBottom:"2px solid rgba(255,255,255,.1)",whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {adminSummary.length===0?<tr><td colSpan={9} style={{ textAlign:"center",color:"var(--text4)",padding:32 }}>No data for {adminMonth}</td></tr>
                    :adminSummary.map((s,i)=>{const totalLeaves=s.fullLeaves+s.halfLeaves*.5+s.permissions*.25;return(
                      <tr key={i} style={{ borderBottom:"1px solid var(--border)",background:i%2===0?"var(--surface)":"var(--surface2)" }}>
                        <td style={{ padding:"11px 14px",color:"var(--text4)",fontWeight:600,fontSize:13 }}>{i+1}</td>
                        <td style={{ padding:"11px 14px" }}><div style={{ display:"flex",alignItems:"center",gap:8 }}><AttAvatar name={s.name} size={26}/><span style={{ fontWeight:700,color:"var(--text)",fontSize:13 }}>{s.name}</span></div></td>
                        <td style={{ padding:"11px 14px" }}><span style={{ fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:10,background:s.role==="CA"?"var(--amber-l)":"var(--blue-m)",color:s.role==="CA"?"var(--amber)":"var(--blue)" }}>{s.role}</span></td>
                        <td style={{ padding:"11px 14px",fontWeight:700,color:"var(--green)",fontSize:13 }}>{s.presentDays}</td>
                        <td style={{ padding:"11px 14px",fontWeight:700,color:s.fullLeaves>0?"var(--amber)":"var(--text4)",fontSize:13 }}>{s.fullLeaves}</td>
                        <td style={{ padding:"11px 14px",fontWeight:700,color:s.halfLeaves>0?"var(--purple)":"var(--text4)",fontSize:13 }}>{s.halfLeaves}</td>
                        <td style={{ padding:"11px 14px",fontWeight:700,color:s.permissions>0?"#0284C7":"var(--text4)",fontSize:13 }}>{s.permissions}</td>
                        <td style={{ padding:"11px 14px",fontWeight:700,color:s.absentDays>0?"var(--red)":"var(--text4)",fontSize:13 }}>{s.absentDays}</td>
                        <td style={{ padding:"11px 14px",fontWeight:800,fontSize:14,color:totalLeaves>3?"var(--red)":"var(--text)" }}>{totalLeaves%1===0?totalLeaves:totalLeaves.toFixed(1)}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab==="salary"&&isAdmin&&(
          <>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
              <div><div style={{ fontSize:18,fontWeight:700,color:"var(--text)",marginBottom:2 }}>Salary Calculator</div><div style={{ fontSize:13,color:"var(--text3)" }}>Based on attendance for {adminMonth}</div></div>
              <select style={{ padding:"8px 12px",border:"1.5px solid var(--border)",borderRadius:8,fontFamily:"var(--font)",fontSize:13,color:"var(--text)",background:"var(--surface)",outline:"none",cursor:"pointer" }} value={adminMonth} onChange={e=>setAdminMonth(e.target.value)}>{monthOptions.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div className="ca-card" style={cardStyle}>
              <div style={secTitle}>Set Per-Day Salary (₹)</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10 }}>
                {adminSummary.map(s=>(
                  <div key={s.name} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",border:"1.5px solid var(--border)",borderRadius:9 }}>
                    <AttAvatar name={s.name} size={26}/>
                    <span style={{ fontSize:13,fontWeight:600,color:"var(--text)",flex:1 }}>{s.name}</span>
                    <input type="number" placeholder="₹/day" value={salarySettings[s.name]?.perDay||""} onChange={e=>setSalarySettings(p=>({...p,[s.name]:{perDay:Number(e.target.value)}}))} style={{ width:80,padding:"6px 10px",border:"1.5px solid var(--border)",borderRadius:7,fontSize:13,outline:"none",textAlign:"right",fontFamily:"var(--font)" }}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10 }}>
              {adminSummary.map(s=>{const perDay=salarySettings[s.name]?.perDay||0;const deduct=s.fullLeaves+s.halfLeaves*.5;const net=Math.max(0,s.presentDays-deduct);const salary=Math.round(perDay*net);return(
                <div className="att-salary-card" key={s.name}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><AttAvatar name={s.name} size={30}/><div><div className="att-salary-name" style={{ marginBottom:0 }}>{s.name}</div><div style={{ fontSize:10,color:"var(--text3)" }}>{s.role} · {adminMonth}</div></div></div>
                  <div className="att-salary-row"><span>Present days</span><span>{s.presentDays}</span></div>
                  <div className="att-salary-row"><span>Full leaves</span><span style={{ color:s.fullLeaves>0?"var(--amber)":"inherit" }}>{s.fullLeaves}</span></div>
                  <div className="att-salary-row"><span>Half days</span><span style={{ color:s.halfLeaves>0?"var(--purple)":"inherit" }}>{s.halfLeaves}</span></div>
                  <div className="att-salary-row"><span>Net working days</span><span style={{ fontWeight:700 }}>{net}</span></div>
                  <div className="att-salary-row"><span>Per day rate</span><span>₹{perDay.toLocaleString("en-IN")}</span></div>
                  <div className="att-salary-total"><span>Net Salary</span><span style={{ color:salary>0?"var(--green)":"var(--text4)" }}>{salary>0?`₹${salary.toLocaleString("en-IN")}`:perDay===0?"Set rate ↑":"₹0"}</span></div>
                </div>
              );})}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default Attendance;
