import { BrowserRouter, useNavigate, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddClient from "./pages/AddClient";
import Clients from "./pages/Clients";
import Attendance from "./pages/Attendance";
import Reimbursement from "./pages/Reimbursement";
import Works from "./pages/Works";
import Settings from "./pages/Settings";
import Invoice from "./pages/Invoice";
import { AppShell, SHELL_CSS } from "./pages/AppShell";

/* ── Inject global CSS once at root ─────────────────────────────────────────── */
const GLOBAL = `
  ${SHELL_CSS}

  /* Safe area for Capacitor / notched phones */
  @supports(padding-top: env(safe-area-inset-top)) {
    .ca-topbar {
      padding-top: env(safe-area-inset-top);
      height: calc(56px + env(safe-area-inset-top));
    }
    .ca-bnav {
      padding-bottom: env(safe-area-inset-bottom);
      height: calc(62px + env(safe-area-inset-bottom));
    }
  }

  /* Override any remaining black backgrounds — Login keeps its own styles */
  body, #root {
    background: var(--bg) !important;
  }

  /* Smooth page transitions */
  .ca-page-enter {
    animation: pgIn 0.2s cubic-bezier(0.4,0,0.2,1) both;
  }
  @keyframes pgIn {
    from { opacity:0; transform:translateY(7px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

function ComingSoon({ page }) {
  const navigate = useNavigate();
  return (
    <>
      <style>{GLOBAL}</style>
      <AppShell activeKey="dash" title={page} subtitle="Coming soon">
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center",
          justifyContent:"center", padding:"80px 20px", gap:16,
          fontFamily:"var(--font)"
        }}>
          <div style={{
            width:64, height:64, borderRadius:18,
            background:"var(--blue-l)", display:"flex",
            alignItems:"center", justifyContent:"center"
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:"var(--text)" }}>{page}</div>
          <div style={{ fontSize:13, color:"var(--text4)" }}>This page is coming soon</div>
          <button
            onClick={() => navigate("/dashboard")}
            className="ca-btn-primary"
            style={{ padding:"10px 24px" }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </AppShell>
    </>
  );
}

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("cao_user");
  return user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <>
      <style>{GLOBAL}</style>
      <BrowserRouter>
        <Routes>
          {/* Login — keeps its own dark splash UI, untouched */}
          <Route path="/"              element={<Login />} />

          {/* Protected pages — all use the new white Practice CA UI */}
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/works"         element={<ProtectedRoute><Works /></ProtectedRoute>} />
          <Route path="/add-client"    element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
          <Route path="/clients"       element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/attendance"    element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/reimbursement" element={<ProtectedRoute><Reimbursement /></ProtectedRoute>} />
          <Route path="/settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/invoice"       element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
          <Route path="/finance"       element={<ProtectedRoute><ComingSoon page="Finance" /></ProtectedRoute>} />
          <Route path="/cal"           element={<ProtectedRoute><ComingSoon page="Calendar" /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
