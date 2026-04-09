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

function ComingSoon({ page }) {
  const navigate = useNavigate();
  return (
    <div style={{ display:"flex", height:"100vh" }}>
      <style>{`
        .cs-aside { width:72px; background:#0f172a; height:100vh; }
        .cs-main  { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8fafc; gap:16px; font-family:'Segoe UI',sans-serif; }
      `}</style>
      <aside className="cs-aside" />
      <div className="cs-main">
        <div style={{ fontSize:48 }}>🚧</div>
        <div style={{ fontSize:22, fontWeight:700, color:"#1e293b" }}>{page}</div>
        <div style={{ fontSize:14, color:"#94a3b8" }}>This page is coming soon</div>
        <button onClick={() => navigate("/dashboard")} style={{ marginTop:8, padding:"10px 24px", borderRadius:9, background:"#0f172a", color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>← Back to Dashboard</button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("cao_user");
  return user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Login />} />
        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/works"        element={<ProtectedRoute><Works /></ProtectedRoute>} />
        <Route path="/add-client"   element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
        <Route path="/clients"      element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/attendance"   element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/reimbursement" element={<ProtectedRoute><Reimbursement /></ProtectedRoute>} />
        <Route path="/settings"     element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/invoice"      element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
        <Route path="/finance"      element={<ProtectedRoute><ComingSoon page="Finance" /></ProtectedRoute>} />
        <Route path="/cal"          element={<ProtectedRoute><ComingSoon page="Calendar" /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
