/* ─── AppShell.jsx — Practice CA Design System ────────────────────────────────
   Clean white surfaces, navy sidebar, professional typography
   Font: DM Sans — modern, rounded, extremely readable
──────────────────────────────────────────────────────────────────────────── */
import { useNavigate, useLocation } from "react-router-dom";

export const NAV_ROUTES = {
  dash:    "/dashboard",
  works:   "/works",
  clients: "/clients",
  finance: "/finance",
  add:     "/add-client",
  attend:  "/attendance",
  reimb:   "/reimbursement",
  invoice: "/invoice",
  settings:"/settings",
  cal:     "/cal",
};

export const NAV_ITEMS = [
  { key:"dash",     label:"Home",     icon:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
  { key:"works",    label:"Works",    icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key:"clients",  label:"Clients",  icon:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
  { key:"invoice",  label:"Invoice",  icon:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key:"add",      label:"Add Work", icon:"M12 5v14M5 12h14" },
  { key:"attend",   label:"Attend",   icon:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z" },
  { key:"reimb",    label:"Payments", icon:"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { key:"finance",  label:"Finance",  icon:"M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
  { key:"settings", label:"Settings", icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

const IC = ({ d, size=18, stroke="currentColor", sw=1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <path d={d}/>
  </svg>
);

const AV_PALETTE = ["#2563EB","#0D9488","#D97706","#7C3AED","#DC2626","#059669","#DB2777","#0284C7"];
export function Avatar({ name="?", size=32, round=true }) {
  const c = AV_PALETTE[(String(name).charCodeAt(0)||0) % AV_PALETTE.length];
  return (
    <div style={{ width:size, height:size,
      borderRadius: round ? "50%" : Math.round(size*0.3),
      background:`${c}18`, border:`1.5px solid ${c}35`,
      display:"flex", alignItems:"center", justifyContent:"center",
      color:c, fontSize:Math.round(size*0.38), fontWeight:700,
      flexShrink:0, fontFamily:"inherit", userSelect:"none" }}>
      {String(name)[0]?.toUpperCase()||"?"}
    </div>
  );
}

export const STATUS_CFG = {
  "Pending":      { color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", dot:"#F59E0B" },
  "In Progress":  { color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE", dot:"#3B82F6" },
  "Under Review": { color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE", dot:"#8B5CF6" },
  "On Hold":      { color:"#6B7280", bg:"#F9FAFB", border:"#E5E7EB", dot:"#9CA3AF" },
  "Completed":    { color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", dot:"#10B981" },
  "Review":       { color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE", dot:"#8B5CF6" },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["Pending"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:700,
      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
      whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot, flexShrink:0 }}/>
      {status}
    </span>
  );
}

const LogoMark = ({ size=26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="3" y="9" width="18" height="14" rx="3" fill="rgba(255,255,255,0.92)"/>
    <rect x="8" y="5" width="18" height="14" rx="3" fill="rgba(255,255,255,0.4)"/>
    <rect x="7" y="13" width="10" height="1.8" rx="0.9" fill="rgba(37,99,235,0.7)"/>
    <rect x="7" y="17" width="7" height="1.8" rx="0.9" fill="rgba(37,99,235,0.4)"/>
    <circle cx="25" cy="24" r="7" fill="#2563EB"/>
    <path d="M22 24l2.5 2.5L28 21" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SHELL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

:root {
  --font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --bg:       #F2F4F7;
  --surface:  #FFFFFF;
  --surface2: #F8F9FB;
  --surface3: #F1F3F6;
  --border:   #E4E7ED;
  --border2:  #CDD0D8;
  --navy:     #0F2744;
  --navy2:    #1A3A5C;
  --blue:     #2563EB;
  --blue-l:   #EFF6FF;
  --blue-m:   #DBEAFE;
  --green:    #059669;
  --green-l:  #ECFDF5;
  --amber:    #D97706;
  --amber-l:  #FFFBEB;
  --red:      #DC2626;
  --red-l:    #FEF2F2;
  --red-m:    #FEE2E2;
  --purple:   #7C3AED;
  --purple-l: #F5F3FF;
  --text:     #111827;
  --text2:    #374151;
  --text3:    #6B7280;
  --text4:    #9CA3AF;
  --sh-xs:    0 1px 2px rgba(0,0,0,0.05);
  --sh-sm:    0 1px 4px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --sh-md:    0 4px 16px rgba(0,0,0,0.08);
  --sh-lg:    0 16px 48px rgba(0,0,0,0.14);
  --r-sm:6px; --r-md:10px; --r-lg:14px; --r-xl:18px;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body,#root{height:100%;font-family:var(--font)!important;background:var(--bg)!important;color:var(--text)!important;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:4px}

/* Page enter */
.ca-page-enter{animation:pgIn 0.2s cubic-bezier(.4,0,.2,1) both}
@keyframes pgIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}

/* ── Cards ── */
.ca-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);box-shadow:var(--sh-sm)}

/* ── Inputs ── */
.ca-inp,.ca-sel,.ca-textarea{width:100%;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r-md);padding:10px 13px;font-family:var(--font);font-size:14px;color:var(--text);outline:none;transition:border-color .15s,box-shadow .15s;-webkit-appearance:none;appearance:none}
.ca-inp:focus,.ca-sel:focus,.ca-textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1);background:var(--surface)}
.ca-inp::placeholder,.ca-textarea::placeholder{color:var(--text4)}
.ca-inp[readonly],.ca-textarea[readonly]{background:var(--surface2);color:var(--text3);cursor:default}
.ca-sel{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px}
.ca-textarea{resize:vertical;min-height:80px}

/* ── Labels ── */
.ca-lbl{font-size:12px;font-weight:600;color:var(--text3);display:block;margin-bottom:5px;letter-spacing:.1px}

/* ── Buttons ── */
.ca-btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 20px;border-radius:var(--r-md);border:none;background:var(--navy);color:#fff;font-family:var(--font);font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
.ca-btn-primary:hover{background:var(--navy2)}
.ca-btn-primary:active{transform:scale(.98)}
.ca-btn-primary:disabled{opacity:.5;cursor:not-allowed}
.ca-btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 16px;border-radius:var(--r-md);border:1.5px solid var(--border);background:var(--surface);color:var(--text2);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s}
.ca-btn-outline:hover{border-color:var(--border2);background:var(--surface2)}
.ca-btn-danger{background:var(--red-m);color:var(--red);border:1.5px solid #FECACA;padding:9px 16px;border-radius:var(--r-md);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer}
.ca-btn-blue{background:var(--blue);color:#fff;border:none;padding:9px 16px;border-radius:var(--r-md);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.ca-btn-green{background:var(--green);color:#fff;border:none;padding:9px 16px;border-radius:var(--r-md);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}

/* ── Section header ── */
.ca-section-hd{font-size:11px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)}

/* ── Toast ── */
.ca-toast{padding:10px 14px;border-radius:var(--r-md);font-size:13px;font-weight:600;margin-top:10px}
.ca-toast-ok{background:var(--green-l);color:var(--green);border:1px solid #6EE7B7}
.ca-toast-warn{background:var(--amber-l);color:var(--amber);border:1px solid #FCD34D}
.ca-toast-err{background:var(--red-m);color:var(--red);border:1px solid #FECACA}

/* ── Table ── */
.ca-tbl{width:100%;border-collapse:collapse}
.ca-tbl th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:.6px;white-space:nowrap;background:var(--surface2);border-bottom:1.5px solid var(--border)}
.ca-tbl td{padding:12px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--text2)}
.ca-tbl tbody tr:hover td{background:#F7FAFF}

/* ── Modal bottom sheet ── */
.ca-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.42);display:flex;align-items:flex-end;justify-content:center;z-index:500;backdrop-filter:blur(2px)}
@media(min-width:600px){.ca-modal-overlay{align-items:center}.ca-modal{border-radius:var(--r-xl)!important;max-width:560px!important}}
.ca-modal{background:var(--surface);border-radius:var(--r-xl) var(--r-xl) 0 0;width:100%;max-width:100%;max-height:92vh;overflow-y:auto;box-shadow:var(--sh-lg);animation:sheetUp .28s cubic-bezier(.34,1.1,.64,1) both}
@keyframes sheetUp{from{transform:translateY(100%);opacity:.5}to{transform:translateY(0);opacity:1}}
.ca-modal-handle{width:36px;height:4px;border-radius:2px;background:var(--border2);margin:12px auto 0}
.ca-modal-hd{padding:16px 20px 14px;border-bottom:1px solid var(--border)}
.ca-modal-title{font-size:17px;font-weight:700;color:var(--text)}
.ca-modal-sub{font-size:13px;color:var(--text3);margin-top:2px}
.ca-modal-body{padding:20px}
.ca-modal-foot{padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:10px;background:var(--surface);position:sticky;bottom:0}

/* ── Sidebar ── */
.ca-sidebar{width:220px;background:var(--navy);display:flex;flex-direction:column;padding:0;flex-shrink:0;overflow-y:auto}
.ca-sidebar-logo{padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:10px}
.ca-sidebar-logo-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#4F8EF7,#2563EB);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ca-sidebar-logo-text{font-size:16px;font-weight:800;color:#fff;letter-spacing:-.3px}
.ca-sidebar-logo-text span{color:#93C5FD}
.ca-sidebar-section{padding:16px 14px 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:1px}
.ca-sidebar-item{display:flex;align-items:center;gap:10px;padding:9px 12px;margin:1px 8px;border-radius:9px;border:none;background:none;cursor:pointer;font-family:var(--font);color:rgba(255,255,255,.55);font-size:13.5px;font-weight:500;transition:all .15s;text-align:left;width:calc(100% - 16px)}
.ca-sidebar-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.85)}
.ca-sidebar-item.active{background:rgba(255,255,255,.13);color:#fff;font-weight:600}
.ca-sidebar-item.active .ca-sdi-icon{opacity:1;color:#93C5FD}
.ca-sdi-icon{flex-shrink:0;opacity:.7}
.ca-sidebar-dot{width:6px;height:6px;border-radius:50%;background:#60A5FA;margin-left:auto;flex-shrink:0}

/* ── Topbar ── */
.ca-topbar{height:56px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 22px;flex-shrink:0;box-shadow:var(--sh-xs);position:sticky;top:0;z-index:100}
.ca-topbar-title{font-size:16px;font-weight:700;color:var(--text)}
.ca-topbar-sub{font-size:12px;color:var(--text4);margin-top:1px}

/* ── Bottom nav ── */
.ca-bnav{display:none;position:fixed;bottom:0;left:0;right:0;height:62px;background:var(--surface);border-top:1px solid var(--border);box-shadow:0 -4px 16px rgba(0,0,0,.06);z-index:200;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.ca-bnav::-webkit-scrollbar{display:none}
.ca-bnav-inner{display:flex;height:100%;min-width:max-content;padding:0 6px}
.ca-bn-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0 11px;border:none;background:none;cursor:pointer;font-family:var(--font);min-width:52px;color:var(--text4);position:relative;transition:color .15s}
.ca-bn-item.active{color:var(--navy)}
.ca-bn-item>span{font-size:9px;font-weight:600;white-space:nowrap}
.ca-bn-dot{position:absolute;top:8px;right:9px;width:6px;height:6px;border-radius:50%;background:var(--blue);border:1.5px solid var(--surface)}
.ca-bn-bar{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:20px;height:2.5px;border-radius:2px;background:var(--navy)}

/* ── Filters ── */
.ca-filter-pill{padding:6px 14px;border-radius:100px;font-size:12px;font-weight:600;border:1.5px solid var(--border);background:var(--surface);color:var(--text3);cursor:pointer;font-family:var(--font);transition:all .15s;white-space:nowrap}
.ca-filter-pill.active{background:var(--navy);color:#fff;border-color:var(--navy)}

/* ── Tabs ── */
.ca-tabs{display:flex;border-bottom:2px solid var(--border);overflow-x:auto;scrollbar-width:none}
.ca-tabs::-webkit-scrollbar{display:none}
.ca-tab{padding:11px 18px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;font-family:var(--font);color:var(--text3);border-bottom:2px solid transparent;margin-bottom:-2px;white-space:nowrap;transition:all .15s}
.ca-tab:hover{color:var(--text2)}
.ca-tab.active{color:var(--navy);border-bottom-color:var(--navy)}

/* ── Empty state ── */
.ca-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:10px;color:var(--text4);text-align:center}
.ca-empty-icon{width:52px;height:52px;border-radius:16px;background:var(--surface2);display:flex;align-items:center;justify-content:center;margin-bottom:4px}

/* ── Search ── */
.ca-search-wrap{position:relative}
.ca-search-wrap svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text4)}
.ca-search-inp{width:100%;background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r-md);padding:10px 14px 10px 38px;font-family:var(--font);font-size:13.5px;color:var(--text);outline:none;transition:border-color .15s}
.ca-search-inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.08)}
.ca-search-inp::placeholder{color:var(--text4)}

/* ── Spinner ── */
.ca-spin{display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:caRot .65s linear infinite}
@keyframes caRot{to{transform:rotate(360deg)}}

/* ── Stat card ── */
.ca-stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px 18px;box-shadow:var(--sh-xs)}

/* ── Responsive ── */
@media(max-width:768px){
  .ca-sidebar{display:none!important}
  .ca-bnav{display:flex!important}
  .ca-main-scroll{padding-bottom:70px!important}
  .ca-hide-mob{display:none!important}
  .ca-topbar{padding:0 14px}
}
@media(max-width:480px){
  .ca-grid-2{grid-template-columns:1fr!important}
  .ca-grid-3{grid-template-columns:1fr 1fr!important}
}
`;

export function AppShell({ activeKey, children, title, subtitle, rightAction, hasDot, user:userProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = userProp || (() => {
    try { return JSON.parse(localStorage.getItem("cao_user") || '{"name":"Guest","role":"Staff"}'); }
    catch { return { name:"Guest", role:"Staff" }; }
  })();

  const active = activeKey ||
    Object.entries(NAV_ROUTES).find(([,v]) => v === location.pathname)?.[0] || "dash";

  const go = key => { const r = NAV_ROUTES[key]; if (r) navigate(r); };

  const mainNav = NAV_ITEMS.filter(n => ["dash","works","clients","invoice"].includes(n.key));
  const mgmtNav = NAV_ITEMS.filter(n => ["add","attend","reimb","finance"].includes(n.key));
  const sysNav  = NAV_ITEMS.filter(n => ["settings"].includes(n.key));

  const SideItem = ({ item }) => {
    const isActive = active === item.key;
    return (
      <button className={`ca-sidebar-item ${isActive ? "active" : ""}`} onClick={() => go(item.key)}>
        <IC d={item.icon} size={16} stroke="currentColor" sw={isActive?2.2:1.8} className="ca-sdi-icon"/>
        {item.label}
        {hasDot && item.key === "works" && !isActive && <span className="ca-sidebar-dot"/>}
      </button>
    );
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"var(--font)", background:"var(--bg)" }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="ca-sidebar">
        <div className="ca-sidebar-logo">
          <div className="ca-sidebar-logo-icon"><LogoMark size={22}/></div>
          <div className="ca-sidebar-logo-text">CA <span>Office</span></div>
        </div>

        {/* User pill */}
        <div style={{ padding:"10px 10px 6px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 10px", background:"rgba(255,255,255,.07)", borderRadius:10 }}>
            <Avatar name={user.name} size={28}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12.5, fontWeight:600, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.32)", marginTop:1 }}>{user.role}</div>
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", paddingBottom:12 }}>
          <div className="ca-sidebar-section">Main</div>
          {mainNav.map(n => <SideItem key={n.key} item={n}/>)}
          <div className="ca-sidebar-section">Management</div>
          {mgmtNav.map(n => <SideItem key={n.key} item={n}/>)}
          <div className="ca-sidebar-section">System</div>
          {sysNav.map(n => <SideItem key={n.key} item={n}/>)}
        </div>
      </aside>

      {/* ── Right Side ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <header className="ca-topbar">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {title ? (
              <div>
                <div className="ca-topbar-title">{title}</div>
                {subtitle && <div className="ca-topbar-sub">{subtitle}</div>}
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"var(--navy)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <LogoMark size={18}/>
                </div>
                <span style={{ fontWeight:800, fontSize:15, color:"var(--navy)", letterSpacing:"-.3px" }}>CA <span style={{ color:"var(--blue)" }}>Office</span></span>
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {rightAction}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="ca-hide-mob" style={{ textAlign:"right" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{user.name}</div>
                <div style={{ fontSize:10, color:"var(--text4)" }}>{user.role}</div>
              </div>
              <Avatar name={user.name} size={34}/>
            </div>
          </div>
        </header>

        <main className="ca-main-scroll" style={{ flex:1, overflowY:"auto" }}>
          <div className="ca-page-enter">{children}</div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="ca-bnav">
        <div className="ca-bnav-inner">
          {NAV_ITEMS.map(n => {
            const isAct = active === n.key;
            return (
              <button key={n.key} className={`ca-bn-item ${isAct?"active":""}`} onClick={() => go(n.key)}>
                {hasDot && n.key==="works" && <span className="ca-bn-dot"/>}
                <IC d={n.icon} size={20} stroke={isAct?"var(--navy)":"var(--text4)"} sw={isAct?2.2:1.8}/>
                <span>{n.label}</span>
                {isAct && <span className="ca-bn-bar"/>}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
