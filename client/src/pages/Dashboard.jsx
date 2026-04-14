import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppShell, SHELL_CSS, Avatar, StatusBadge, STATUS_CFG } from "./AppShell";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const IC = ({ d, size=18, stroke="currentColor", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["S","M","T","W","T","F","S"];

function toDate(str) {
  if (!str) return null;
  if (str.includes("T")) str = str.split("T")[0];
  const p = str.split("-");
  let dt;
  if (p[0].length === 4) dt = new Date(parseInt(p[0]), parseInt(p[1])-1, parseInt(p[2]));
  else dt = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
  dt.setHours(0,0,0,0); return dt;
}
function todayDate() { const d = new Date(); d.setHours(0,0,0,0); return d; }

function DonutChart({ works }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const counts = { Pending:0, "In Progress":0, Completed:0, Other:0 };
    works.forEach(w => { if (counts[w.status]!==undefined) counts[w.status]++; else counts.Other++; });
    const total = works.length || 1;
    const slices = [
      { val:counts.Pending,        color:"#F59E0B" },
      { val:counts["In Progress"], color:"#3B82F6" },
      { val:counts.Completed,      color:"#10B981" },
      { val:counts.Other,          color:"#8B5CF6" },
    ];
    ctx.clearRect(0,0,80,80);
    let start = -Math.PI/2;
    slices.forEach(({val,color}) => {
      if (!val) return;
      const arc = (val/total)*Math.PI*2;
      ctx.beginPath(); ctx.arc(40,40,26,start,start+arc);
      ctx.strokeStyle=color; ctx.lineWidth=10; ctx.stroke(); start+=arc;
    });
    ctx.font="bold 14px DM Sans,sans-serif"; ctx.fillStyle="#111827";
    ctx.textAlign="center"; ctx.fillText(total,40,45);
  }, [works]);
  return <canvas ref={ref} width={80} height={80}/>;
}

function DueSummary({ works }) {
  const today = todayDate();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const in7 = new Date(today); in7.setDate(today.getDate()+7);
  const ago7 = new Date(today); ago7.setDate(today.getDate()-7);
  let cToday=0,cTomorrow=0,c7=0,cOver7=0,cOverdue=0;
  works.forEach(w => {
    if (w.status==="Completed") return;
    const d = toDate(w.expectedCompletion); if (!d) return;
    const t = d.getTime();
    if (t===today.getTime()) cToday++;
    else if (t===tomorrow.getTime()) cTomorrow++;
    else if (d>today&&d<=in7) c7++;
    else if (d<today&&d>=ago7) cOver7++;
    else if (d<ago7) cOverdue++;
  });
  const cards = [
    { label:"Due Today",   count:cToday,         color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
    { label:"Tomorrow",    count:cTomorrow,       color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE" },
    { label:"Next 7 Days", count:c7,              color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
    { label:"Overdue",     count:cOver7+cOverdue, color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }} className="ca-grid-3">
      {cards.map(c => (
        <div key={c.label} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:12, padding:"14px 16px" }}>
          <div style={{ fontSize:28, fontWeight:800, color:c.color, lineHeight:1 }}>{c.count}</div>
          <div style={{ fontSize:11, color:c.color, marginTop:4, fontWeight:500, opacity:.75 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function TodoSection({ works }) {
  const [tab, setTab] = useState("Today");
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [showNote, setShowNote] = useState(false);
  const today = todayDate();
  const lists = {
    Today: works.filter(w => { const d=toDate(w.expectedCompletion); return d&&d.getTime()===today.getTime()&&w.status!=="Completed"; }),
    Upcoming: works.filter(w => { const d=toDate(w.expectedCompletion); return d&&d>today&&w.status!=="Completed"; }),
    Completed: works.filter(w => w.status==="Completed"),
  };
  const list = lists[tab] || [];
  function addNote() {
    const text = noteInput.trim(); if (!text) return;
    const t = new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    setNotes(p => [{ id:Date.now(), text, time:t }, ...p]);
    setNoteInput(""); setShowNote(false);
  }
  return (
    <div className="ca-card" style={{ overflow:"hidden" }}>
      <div style={{ padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid var(--border)" }}>
        <span style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>To-Do</span>
        <button className="ca-btn-blue" style={{ fontSize:12, padding:"6px 12px" }} onClick={()=>setShowNote(v=>!v)}>
          <IC d="M12 5v14M5 12h14" size={13} stroke="#fff" sw={2.5}/> Add Note
        </button>
      </div>
      {showNote && (
        <div style={{ margin:"10px 14px", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:"12px 14px" }}>
          <textarea autoFocus value={noteInput} onChange={e=>setNoteInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNote();}if(e.key==="Escape"){setShowNote(false);setNoteInput("");}}}
            placeholder="Type a note… (Enter to save, Esc to cancel)"
            style={{ width:"100%", border:"none", background:"transparent", resize:"none", outline:"none", fontFamily:"var(--font)", fontSize:13, color:"#92400E", minHeight:52 }}/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:6 }}>
            <button className="ca-btn-outline" style={{ fontSize:12, padding:"5px 12px" }} onClick={()=>{setShowNote(false);setNoteInput("");}}>Cancel</button>
            <button style={{ background:"#D97706",color:"#fff",border:"none",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"var(--font)" }} onClick={addNote}>Save</button>
          </div>
        </div>
      )}
      <div className="ca-tabs" style={{ padding:"0 14px" }}>
        {["Today","Upcoming","Completed"].map(t => (
          <button key={t} className={`ca-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>
      {tab==="Today" && notes.map(n => (
        <div key={n.id} style={{ margin:"8px 14px", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:"10px 12px", display:"flex", gap:10 }}>
          <span style={{ width:7,height:7,borderRadius:"50%",background:"#F59E0B",flexShrink:0,marginTop:4 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:"#92400E" }}>{n.text}</div>
            <div style={{ fontSize:10, color:"#B45309", marginTop:2 }}>{n.time}</div>
          </div>
          <button onClick={()=>setNotes(p=>p.filter(x=>x.id!==n.id))} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text4)",fontSize:16,lineHeight:1,padding:0 }}>×</button>
        </div>
      ))}
      {list.length===0 && !(tab==="Today"&&notes.length>0) ? (
        <div style={{ padding:"20px 14px",textAlign:"center",color:"var(--text4)",fontSize:13 }}>No tasks for {tab.toLowerCase()}</div>
      ) : list.map(w => (
        <div key={w.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 18px",borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:STATUS_CFG[w.status]?.dot||"#9CA3AF",flexShrink:0 }}/>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:"var(--text)" }}>{w.clientName}</div>
              <div style={{ fontSize:11,color:"var(--text3)" }}>{w.workNature}</div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:11,color:"var(--text4)" }}>{w.expectedCompletion?toDate(w.expectedCompletion)?.toLocaleDateString("en-IN",{day:"numeric",month:"short"}):""}</span>
            <Avatar name={w.assignedTo||"?"} size={26}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkCalendar({ works }) {
  const today = todayDate();
  const [calYear,setCalYear] = useState(today.getFullYear());
  const [calMonth,setCalMonth] = useState(today.getMonth());
  const [popup,setPopup] = useState(null);
  const changeMonth = d => { let m=calMonth+d,y=calYear; if(m<0){m=11;y--;} if(m>11){m=0;y++;} setCalMonth(m);setCalYear(y); };
  const byDay={};
  works.forEach(w => { const d=toDate(w.expectedCompletion); if(!d) return; if(d.getFullYear()===calYear&&d.getMonth()===calMonth){const day=d.getDate();if(!byDay[day])byDay[day]=[];byDay[day].push(w);} });
  const firstDow=new Date(calYear,calMonth,1).getDay();
  const dim=new Date(calYear,calMonth+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDow;i++) cells.push({day:new Date(calYear,calMonth,0).getDate()-firstDow+1+i,cur:false,works:[]});
  for(let d=1;d<=dim;d++){const dt=new Date(calYear,calMonth,d);dt.setHours(0,0,0,0);cells.push({day:d,cur:true,isToday:dt.getTime()===today.getTime(),works:byDay[d]||[]});}
  const rem=7-(cells.length%7); if(rem<7) for(let i=1;i<=rem;i++) cells.push({day:i,cur:false,works:[]});
  return (
    <div className="ca-card" style={{ overflow:"hidden" }}>
      <div style={{ padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border)" }}>
        <span style={{ fontSize:14,fontWeight:700,color:"var(--text)" }}>Work Calendar — {MONTHS[calMonth]} {calYear}</span>
        <div style={{ display:"flex",gap:6 }}>
          {["‹","›"].map((a,i) => (
            <button key={a} onClick={()=>changeMonth(i===0?-1:1)} style={{ width:28,height:28,border:"1.5px solid var(--border)",borderRadius:7,background:"var(--surface)",cursor:"pointer",color:"var(--text3)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center" }}>{a}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"8px 14px 0" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4 }}>
          {DAY_LABELS.map((d,i) => <div key={i} style={{ textAlign:"center",fontSize:10,fontWeight:700,color:"var(--text4)",paddingBottom:4 }}>{d}</div>)}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,paddingBottom:12 }}>
          {cells.map((cell,idx) => (
            <div key={idx} onClick={()=>cell.cur&&cell.works.length>0&&setPopup({day:cell.day,works:cell.works})}
              style={{ minHeight:34,borderRadius:7,display:"flex",flexDirection:"column",alignItems:"center",padding:"2px 2px",cursor:cell.cur&&cell.works.length>0?"pointer":"default",background:cell.isToday?"var(--blue-l)":"transparent" }}>
              <div style={{ width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:cell.isToday?"var(--blue)":"transparent",color:!cell.cur?"#D1D5DB":cell.isToday?"#fff":"var(--text2)",fontSize:11,fontWeight:600 }}>{cell.day}</div>
              {cell.cur&&cell.works.length>0&&(
                <div style={{ display:"flex",gap:2,justifyContent:"center",marginTop:2 }}>
                  {cell.works.slice(0,3).map((w,i) => <div key={i} style={{ width:4,height:4,borderRadius:"50%",background:STATUS_CFG[w.status]?.dot||"#9CA3AF" }}/>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {popup && (
        <div onClick={e=>{if(e.target===e.currentTarget)setPopup(null);}} style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.4)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ background:"var(--surface)",borderRadius:16,padding:20,width:"100%",maxWidth:320,maxHeight:"70vh",overflowY:"auto",boxShadow:"var(--sh-lg)" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
              <span style={{ fontWeight:700,fontSize:15,color:"var(--text)" }}>{MONTHS[calMonth].slice(0,3)} {popup.day}</span>
              <button onClick={()=>setPopup(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text4)",fontSize:20 }}>×</button>
            </div>
            {popup.works.map((w,i) => (
              <div key={i} style={{ padding:"10px 12px",border:"1px solid var(--border)",borderRadius:10,marginBottom:8 }}>
                <div style={{ fontWeight:700,fontSize:13,color:"var(--text)",marginBottom:4 }}>{w.clientName}</div>
                <div style={{ fontSize:11,color:"var(--text3)",marginBottom:6 }}>{w.workNature}</div>
                <StatusBadge status={w.status}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskSummary({ works }) {
  const counts = { Pending:0,"In Progress":0,Completed:0,"On Hold":0 };
  works.forEach(w => { if(counts[w.status]!==undefined) counts[w.status]++; });
  const incomplete = works.filter(w => w.status!=="Completed").length;
  const legend = [
    { label:"Pending",     color:"#F59E0B", count:counts.Pending },
    { label:"In Progress", color:"#3B82F6", count:counts["In Progress"] },
    { label:"Completed",   color:"#10B981", count:counts.Completed },
    { label:"On Hold",     color:"#8B5CF6", count:counts["On Hold"] },
  ];
  const boxes = [
    { label:"Pending",     val:counts.Pending,       accent:"#D97706", bg:"#FFFBEB" },
    { label:"In Progress", val:counts["In Progress"], accent:"#2563EB", bg:"#EFF6FF" },
    { label:"Completed",   val:counts.Completed,      accent:"#059669", bg:"#ECFDF5" },
    { label:"On Hold",     val:counts["On Hold"],      accent:"#7C3AED", bg:"#F5F3FF" },
  ];
  return (
    <div className="ca-card" style={{ padding:18 }}>
      <div style={{ fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:14 }}>Task Overview</div>
      <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:14 }}>
        <DonutChart works={works}/>
        <div style={{ flex:1 }}>
          {legend.map(l => (
            <div key={l.label} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <span style={{ width:8,height:8,borderRadius:2,background:l.color,display:"inline-block",flexShrink:0 }}/>
                <span style={{ fontSize:12,color:"var(--text3)" }}>{l.label}</span>
              </div>
              <span style={{ fontSize:12,fontWeight:700,color:"var(--text)" }}>{l.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
        {boxes.map(b => (
          <div key={b.label} style={{ background:b.bg,borderRadius:10,padding:"11px 13px" }}>
            <div style={{ fontSize:22,fontWeight:800,color:b.accent }}>{b.val}</div>
            <div style={{ fontSize:11,color:b.accent,marginTop:2,opacity:.7 }}>{b.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12,background:"var(--surface2)",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <span style={{ fontSize:12,color:"var(--text3)" }}>Pending completion</span>
        <span style={{ fontSize:14,fontWeight:800,color:"var(--navy)" }}>{incomplete}</span>
      </div>
    </div>
  );
}

function TasksPanel({ works }) {
  const [filter,setFilter] = useState("All");
  const filters = ["All","Pending","Hold","In Progress","Done"];
  const statusMap = { All:null,Pending:"Pending",Hold:"On Hold","In Progress":"In Progress",Done:"Completed" };
  const filtered = filter==="All" ? works : works.filter(w => w.status===statusMap[filter]);
  const byType = {};
  filtered.forEach(w => { if(!byType[w.workNature])byType[w.workNature]={total:0,done:0}; byType[w.workNature].total++; if(w.status==="Completed")byType[w.workNature].done++; });
  return (
    <div className="ca-card" style={{ padding:18, marginTop:14 }}>
      <div style={{ fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:12 }}>Work Types</div>
      <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:12 }}>
        {filters.map(f => (
          <button key={f} className={`ca-filter-pill ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>
      {Object.keys(byType).length===0 ? (
        <div style={{ textAlign:"center",color:"var(--text4)",fontSize:13,padding:"14px 0" }}>No works found</div>
      ) : Object.entries(byType).map(([type,d]) => {
        const pct = Math.round((d.done/d.total)*100);
        return (
          <div key={type} style={{ display:"grid",gridTemplateColumns:"1fr 36px",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize:12,fontWeight:600,color:"var(--text2)",marginBottom:5 }}>{type}</div>
              <div style={{ background:"var(--surface2)",borderRadius:4,height:4,overflow:"hidden" }}>
                <div style={{ width:`${pct}%`,background:"var(--navy)",height:"100%",borderRadius:4 }}/>
              </div>
            </div>
            <span style={{ fontSize:11,color:"var(--text4)",textAlign:"right" }}>{d.total}</span>
          </div>
        );
      })}
    </div>
  );
}

function AttendanceSection({ attendance }) {
  const today = todayDate();
  const ml = `${MONTHS[today.getMonth()]} ${today.getFullYear()}`;
  const sm = {};
  attendance.forEach(r => {
    if (r.month!==ml) return;
    if (!sm[r.name]) sm[r.name]={present:0,absent:0};
    if (r.status==="Present") sm[r.name].present++;
    else if (r.status==="Absent"||r.status==="Leave") sm[r.name].absent++;
  });
  const list = Object.entries(sm);
  return (
    <div className="ca-card" style={{ overflow:"hidden" }}>
      <div style={{ padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border)" }}>
        <span style={{ fontSize:14,fontWeight:700,color:"var(--text)" }}>Attendance</span>
        <span style={{ fontSize:12,color:"var(--text4)",background:"var(--surface2)",padding:"3px 10px",borderRadius:100 }}>{ml}</span>
      </div>
      {list.length===0 ? (
        <div style={{ padding:24,textAlign:"center",color:"var(--text4)",fontSize:13 }}>No attendance data this month</div>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table className="ca-tbl">
            <thead><tr><th>Staff</th><th>Present</th><th>Absent</th><th>%</th></tr></thead>
            <tbody>
              {list.map(([name,d]) => {
                const total=d.present+d.absent;
                const pct=total>0?Math.round((d.present/total)*100):0;
                return (
                  <tr key={name}>
                    <td><div style={{ display:"flex",alignItems:"center",gap:8 }}><Avatar name={name} size={28}/><span style={{ fontWeight:600 }}>{name}</span></div></td>
                    <td style={{ color:"var(--green)",fontWeight:600 }}>{d.present}</td>
                    <td style={{ color:"var(--red)",fontWeight:600 }}>{d.absent}</td>
                    <td><span style={{ fontWeight:700,color:pct>=80?"var(--green)":pct>=50?"var(--amber)":"var(--red)" }}>{pct}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrganizationClients({ works }) {
  const orgMap = {};
  works.forEach(w => {
    const org = (w.organization||"").trim()||"Unspecified";
    if (!orgMap[org]) orgMap[org]=0; orgMap[org]++;
  });
  const orgList = Object.entries(orgMap).sort((a,b)=>b[1]-a[1]);
  const maxCount = orgList.length>0?orgList[0][1]:1;
  const COLS = ["#2563EB","#10B981","#F59E0B","#8B5CF6","#EF4444","#06B6D4","#EC4899","#14B8A6"];
  return (
    <div className="ca-card" style={{ overflow:"hidden" }}>
      <div style={{ padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--border)" }}>
        <span style={{ fontSize:14,fontWeight:700,color:"var(--text)" }}>Organization Clients</span>
        <span style={{ fontSize:11,color:"var(--text4)" }}>{orgList.length} org{orgList.length!==1?"s":""}</span>
      </div>
      {orgList.length===0 ? (
        <div style={{ padding:"20px 16px",textAlign:"center",color:"var(--text4)",fontSize:13 }}>No client data available</div>
      ) : orgList.map(([org,count],idx) => {
        const color = COLS[idx%COLS.length];
        const barPct = Math.round((count/maxCount)*100);
        return (
          <div key={org} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 18px",borderBottom:idx<orgList.length-1?"1px solid var(--border)":"none" }}>
            <div style={{ width:9,height:9,borderRadius:"50%",background:color,flexShrink:0 }}/>
            <div style={{ fontWeight:600,fontSize:13,color:"var(--text)",flex:1 }}>{org}</div>
            <div style={{ flex:2,background:"var(--surface2)",borderRadius:4,height:5,overflow:"hidden" }}>
              <div style={{ width:`${barPct}%`,background:color,height:"100%",borderRadius:4 }}/>
            </div>
            <span style={{ display:"inline-block",background:`${color}18`,color,fontSize:12,fontWeight:800,padding:"2px 9px",borderRadius:20 }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = (() => { try { return JSON.parse(localStorage.getItem("cao_user")||'{"name":"Guest","role":"Staff"}'); } catch { return {name:"Guest",role:"Staff"}; } })();
  const isCA = user.role === "CA";

  // Case-insensitive client-side fallback filter
  function filterByRole(all) {
    if (isCA) return all;
    const myName = (user.name||"").trim().toLowerCase();
    return all.filter(w => (w.assignedTo||"").trim().toLowerCase() === myName);
  }

  function loadData() {
    setLoading(true);
    // Pass assignedTo param so backend also filters — defence in depth
    const worksUrl = isCA
      ? `${API}/works`
      : `${API}/works?assignedTo=${encodeURIComponent(user.name)}`;
    Promise.all([axios.get(worksUrl), axios.get(`${API}/attendance/all`)])
      .then(([w,a]) => { setWorks(filterByRole(w.data||[])); setAttendance(a.data||[]); })
      .catch(console.error).finally(() => setLoading(false));
  }
  useEffect(() => { loadData(); }, []);

  const totalActive = works.filter(w=>w.status!=="Completed").length;
  const totalClients = [...new Set(works.map(w=>w.clientName))].length;
  const completedPct = works.length ? Math.round((works.filter(w=>w.status==="Completed").length/works.length)*100) : 0;

  return (
    <>
      <style>{SHELL_CSS}</style>
      <AppShell activeKey="dash" hasDot={totalActive>0}
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}
        rightAction={
          <button className="ca-btn-outline" style={{ fontSize:12,gap:5 }} onClick={loadData}>
            <IC d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={14} sw={2}/>
            Sync
          </button>
        }>
        <div style={{ padding:"20px",maxWidth:1200,margin:"0 auto" }}>
          {loading ? (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"80px",color:"var(--text4)",fontSize:14 }}>Loading dashboard…</div>
          ) : (
            <div style={{ display:"flex",gap:20 }}>
              {/* Main column */}
              <div style={{ flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:16 }}>
                {!isCA && (
                  <div style={{ background:"var(--blue-l)",border:"1px solid var(--blue-m)",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
                    <Avatar name={user.name} size={36}/>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700,color:"var(--navy)" }}>Staff View — {user.name}</div>
                      <div style={{ fontSize:12,color:"var(--blue)",marginTop:1 }}>Showing only works assigned to you · {totalActive} active</div>
                    </div>
                  </div>
                )}
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }} className="ca-grid-3">
                  {[
                    { label:"Active Works",  val:totalActive,    color:"var(--navy)", sub:"currently in progress" },
                    { label:"Total Clients", val:totalClients,   color:"var(--blue)", sub:"unique clients" },
                    { label:"Completion",    val:`${completedPct}%`, color:"var(--green)", sub:"works completed" },
                  ].map(s => (
                    <div key={s.label} className="ca-stat">
                      <div style={{ fontSize:11,fontWeight:600,color:"var(--text4)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8 }}>{s.label}</div>
                      <div style={{ fontSize:28,fontWeight:800,color:s.color,lineHeight:1 }}>{s.val}</div>
                      <div style={{ fontSize:11,color:"var(--text4)",marginTop:4 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <DueSummary works={works}/>
                <TodoSection works={works}/>
                <WorkCalendar works={works}/>
                <AttendanceSection attendance={attendance}/>
                <OrganizationClients works={works}/>
              </div>
              {/* Right panel — desktop */}
              <div className="ca-hide-mob" style={{ width:280,flexShrink:0,display:"flex",flexDirection:"column" }}>
                <TaskSummary works={works}/>
                <TasksPanel works={works}/>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </>
  );
}