# CA Office — MySQL Backend Setup Guide

## FOLDER STRUCTURE
```
ca-office-backend/
  server.js          ← Express + MySQL backend
  package.json
  frontend/
    Login.jsx        ← Replace your src/pages/Login.jsx
    Dashboard.jsx    ← Replace your src/pages/Dashboard.jsx
    AddClient.jsx    ← Replace your src/pages/AddClient.jsx
    Clients.jsx      ← Replace your src/pages/Clients.jsx
    Attendance.jsx   ← Replace your src/pages/Attendance.jsx
    Reimbursement.jsx (unchanged — already uses axios)
```

---

## STEP 1 — MySQL Setup

1. Open MySQL Workbench
2. Connect to your local server (root)
3. The backend **auto-creates** the `CAOffice` database and all tables on first run
4. If you want to set up manually, these are the tables created:
   - `logins`         — CA / Staff accounts
   - `works`          — All client works (from Add Work form)
   - `attendance`     — Check-in/out sessions and leave records
   - `reimbursements` — Tax payment reimbursements

---

## STEP 2 — Configure Database Credentials

Open `server.js` and update lines 8-9 and 22-23:
```js
user: "root",       // ← your MySQL username
password: "",       // ← your MySQL password (e.g. "mypassword123")
```
Both the pool AND rootPool need the same credentials.

---

## STEP 3 — Install Backend Dependencies

```bash
cd ca-office-backend
npm install
```

This installs: express, mysql2, cors, bcryptjs

---

## STEP 4 — Start the Backend

```bash
npm start
# or for auto-reload during development:
npx nodemon server.js
```

You should see:
```
✅ Database & tables initialized
🚀 CA Office backend running on http://localhost:5000
```

---

## STEP 5 — Create Your First User (CA Account)

Run this curl command or use Postman/Thunder Client:

```bash
# Create CA account
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"SK KavinRaj","password":"your_password","role":"CA"}'

# Create Staff accounts
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi","password":"staff_password","role":"Staff"}'

curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya","password":"staff_password","role":"Staff"}'

curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Karthik","password":"staff_password","role":"Staff"}'
```

Or use this simple HTML to register (save as register.html and open in browser):
```html
<form id="f">
  Name: <input id="name"><br>
  Password: <input id="pass" type="password"><br>
  Role: <select id="role"><option>CA</option><option>Staff</option></select><br>
  <button type="submit">Register</button>
</form>
<div id="msg"></div>
<script>
  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        name: document.getElementById('name').value,
        password: document.getElementById('pass').value,
        role: document.getElementById('role').value
      })
    });
    const data = await res.json();
    document.getElementById('msg').textContent = JSON.stringify(data);
  };
</script>
```

---

## STEP 6 — Update Your React App

Replace files in your React project:
- `src/pages/Login.jsx`      ← frontend/Login.jsx
- `src/pages/Dashboard.jsx`  ← frontend/Dashboard.jsx
- `src/pages/AddClient.jsx`  ← frontend/AddClient.jsx
- `src/pages/Clients.jsx`    ← frontend/Clients.jsx
- `src/pages/Attendance.jsx` ← frontend/Attendance.jsx
- Keep `Reimbursement.jsx` as-is (it already uses axios to localhost:5000)

Make sure your React project has `axios` installed:
```bash
npm install axios
```

---

## STEP 7 — React Router Setup

Your `App.jsx` / router should look like:
```jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddClient from "./pages/AddClient";
import Clients from "./pages/Clients";
import Attendance from "./pages/Attendance";
import Reimbursement from "./pages/Reimbursement";

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("cao_user");
  return user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add-client" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/reimbursement" element={<ProtectedRoute><Reimbursement /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## API ENDPOINTS REFERENCE

| Method | URL                          | Purpose                        |
|--------|------------------------------|--------------------------------|
| POST   | /api/login                   | Login (returns user object)    |
| POST   | /api/register                | Create new user                |
| GET    | /api/users                   | List all users (for dropdowns) |
| GET    | /works                       | All works (dashboard)          |
| GET    | /clients                     | All works (clients page)       |
| POST   | /add-client                  | Add new work                   |
| PATCH  | /works/:id                   | Update work status/fields      |
| DELETE | /works/:id                   | Delete a work                  |
| GET    | /attendance/today            | Today's sessions for a user    |
| POST   | /attendance/checkin          | Record check-in                |
| POST   | /attendance/checkout         | Record check-out               |
| POST   | /attendance/leave            | Submit leave request           |
| GET    | /attendance/history          | User's attendance history      |
| GET    | /attendance/all              | All staff attendance (admin)   |
| GET    | /reimbursements              | All reimbursements             |
| POST   | /reimbursements              | Add reimbursement              |
| PATCH  | /reimbursements/:id          | Update reimbursement           |

---

## HOW DATA FLOWS

1. **Login** → POST /api/login → saves user to localStorage → navigate to dashboard
2. **Add Work** → POST /add-client → saved to `works` table
3. **Dashboard** → GET /works → shows Todo (works where expectedCompletion = today), Calendar, Task Summary etc — ALL from DB
4. **Clients** → GET /works → groups by clientName to show unique clients
5. **Attendance** → Check In/Out → POST /attendance/checkin or /checkout → saved to `attendance` table
6. **Dashboard Attendance widget** → GET /attendance/all → aggregates by month

---

## TROUBLESHOOTING

**CORS error?** Backend already has `app.use(cors())` — should work fine.

**"Access denied for user root"?** Update the password in server.js

**Backend shows "ER_ACCESS_DENIED_ERROR"?**
Check MySQL is running and credentials are correct in server.js

**React can't connect to backend?**
Make sure backend is running on port 5000 and you visit http://localhost:5000 in browser — should show "Cannot GET /" (that's fine)

**Login says "Invalid credentials"?**
Make sure you created the user via /api/register first

---

## SECURITY NOTE
For production, add:
- JWT tokens instead of localStorage
- HTTPS
- Rate limiting (express-rate-limit)
- Input sanitization

This setup is designed for local office use (LAN).
