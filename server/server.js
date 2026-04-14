const express = require("express");
const mysql   = require("mysql2/promise");
const cors    = require("cors");
const bcrypt  = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ca-office.vercel.app",
    "http://10.0.2.2:5000",
  ],
  credentials: true,
}));
app.use(express.json());

// ─── DB Pool ──────────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

setInterval(async () => {
  try { await pool.query("SELECT 1"); console.log("DB Keep Alive Ping"); }
  catch (err) { console.error("Ping Failed:", err.message); }
}, 5 * 60 * 1000);

// ─── Init DB ──────────────────────────────────────────────────────────────────
async function initDB() {
  const conn = await pool.getConnection();

  await conn.query(`
    CREATE TABLE IF NOT EXISTS logins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      password VARCHAR(255),
      role VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      role VARCHAR(50),
      status VARCHAR(20),
      date VARCHAR(20),
      checkIn VARCHAR(50),
      checkOut VARCHAR(50),
      session INT DEFAULT 1,
      totalMins INT DEFAULT 0,
      leaveType VARCHAR(50),
      reason TEXT,
      month VARCHAR(50)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS works (
      id INT AUTO_INCREMENT PRIMARY KEY,
      clientName VARCHAR(255),
      pan VARCHAR(50),
      contactNo VARCHAR(50),
      address TEXT,
      organization VARCHAR(255),
      workNature TEXT,
      month VARCHAR(50),
      assignedTo VARCHAR(100),
      referredBy VARCHAR(100),
      workStartDate VARCHAR(50),
      expectedCompletion VARCHAR(50),
      documentObtained VARCHAR(10),
      pendingRemarks TEXT,
      checklist VARCHAR(10),
      priority VARCHAR(20),
      notes TEXT,
      fees DOUBLE DEFAULT 0,
      reimbAmt DOUBLE DEFAULT 0,
      status VARCHAR(50),
      referenceNo VARCHAR(100),
      reviewedBy VARCHAR(100),
      completedBy VARCHAR(100),
      completionRemarks TEXT,
      invoiceGenerated VARCHAR(10) DEFAULT '',
      invoiceSent VARCHAR(10) DEFAULT '',
      feesReceived TINYINT DEFAULT 0,
      feesReceivedAmt DOUBLE DEFAULT 0,
      feesReceivedMode VARCHAR(50) DEFAULT '',
      feesReceivedDate VARCHAR(50) DEFAULT '',
      feesReceivedRef VARCHAR(100) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safely add missing columns to existing works table
  const worksAlters = [
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS completionRemarks TEXT",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS invoiceGenerated VARCHAR(10) DEFAULT ''",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS invoiceSent VARCHAR(10) DEFAULT ''",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceived TINYINT DEFAULT 0",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedAmt DOUBLE DEFAULT 0",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedMode VARCHAR(50) DEFAULT ''",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedDate VARCHAR(50) DEFAULT ''",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedRef VARCHAR(100) DEFAULT ''",
  ];
  for (const sql of worksAlters) {
    try { await conn.query(sql); } catch (e) { /* column may already exist on older MySQL */ }
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS reimbursements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      clientName VARCHAR(255),
      taxType VARCHAR(100),
      remarkPeriod VARCHAR(100),
      remarkDetail TEXT,
      fullRemark TEXT,
      amount DOUBLE,
      date VARCHAR(50),
      paidBy VARCHAR(100),
      paymentSource VARCHAR(50),
      staffPaidFrom VARCHAR(100),
      officeOwesStaff BOOLEAN,
      status VARCHAR(50),
      addedBy VARCHAR(100),
      addedOn VARCHAR(50),
      invoiceId VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key_name VARCHAR(100) PRIMARY KEY,
      value TEXT
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoiceNo VARCHAR(100),
      clientName VARCHAR(255),
      clientPan VARCHAR(50),
      clientContact VARCHAR(50),
      clientAddress TEXT,
      invoiceDate VARCHAR(50),
      dueDate VARCHAR(50),
      items JSON,
      subtotal DOUBLE,
      gstTotal DOUBLE,
      grandTotal DOUBLE,
      status VARCHAR(50),
      paidOn VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  conn.release();
  console.log("✅ DB initialised");
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/login
// Uses case-insensitive name + role matching so "Arthika" == "arthika"
app.post("/api/login", async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role) return res.status(400).json({ error: "Missing fields" });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM logins WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND LOWER(role) = LOWER(?)",
      [name, role]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    // Return the EXACT name as stored in DB — this is the canonical name
    // that must match assignedTo values in the works table
    res.json({ id: rows[0].id, name: rows[0].name, role: rows[0].role });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/api/register", async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role) return res.status(400).json({ error: "Missing fields" });
  try {
    // Prevent duplicate names (case-insensitive check)
    const [existing] = await pool.query(
      "SELECT id FROM logins WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))", [name]
    );
    if (existing.length) {
      return res.status(400).json({ error: "A user with this name already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO logins (name, password, role) VALUES (?, ?, ?)",
      [name.trim(), hashed, role]
    );
    res.json({ message: "User created" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, role FROM logins ORDER BY role, name");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/users/all", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, role, created_at FROM logins ORDER BY role DESC, name ASC"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM logins WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.patch("/api/users/:id/password", async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query("UPDATE logins SET password = ? WHERE id = ?", [hashed, req.params.id]);
    res.json({ message: "Password updated" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORKS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /works
// ?assignedTo=Arthika  →  staff get only their works (case-insensitive)
// no param             →  CA gets all works
app.get("/works", async (req, res) => {
  try {
    const { assignedTo } = req.query;
    if (assignedTo && assignedTo.trim()) {
      const [rows] = await pool.query(
        "SELECT * FROM works WHERE LOWER(TRIM(assignedTo)) = LOWER(TRIM(?)) ORDER BY created_at DESC",
        [assignedTo.trim()]
      );
      return res.json(rows);
    }
    const [rows] = await pool.query("SELECT * FROM works ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// GET /clients — same filtering logic
app.get("/clients", async (req, res) => {
  try {
    const { assignedTo } = req.query;
    if (assignedTo && assignedTo.trim()) {
      const [rows] = await pool.query(
        "SELECT * FROM works WHERE LOWER(TRIM(assignedTo)) = LOWER(TRIM(?)) ORDER BY clientName, created_at DESC",
        [assignedTo.trim()]
      );
      return res.json(rows);
    }
    const [rows] = await pool.query("SELECT * FROM works ORDER BY clientName, created_at DESC");
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /add-client — create a new work record
app.post("/add-client", async (req, res) => {
  const {
    clientName, pan, contactNo, address, organization,
    workNature, month, assignedTo, referredBy,
    workStartDate, expectedCompletion,
    documentObtained, pendingRemarks, checklist,
    priority, notes, fees, status, referenceNo, reviewedBy, reimbAmt,
  } = req.body;

  if (!clientName) return res.status(400).json({ error: "clientName is required" });

  const workNatureStr = Array.isArray(workNature)
    ? workNature.join(", ")
    : (workNature || "");
  if (!workNatureStr) return res.status(400).json({ error: "workNature is required" });

  try {
    const [result] = await pool.query(
      `INSERT INTO works
        (clientName, pan, contactNo, address, organization,
         workNature, month, assignedTo, referredBy,
         workStartDate, expectedCompletion, documentObtained,
         pendingRemarks, checklist, priority, notes,
         fees, reimbAmt, status, referenceNo, reviewedBy, completedBy, completionRemarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '')`,
      [
        clientName.trim(), pan||"", contactNo||"", address||"", organization||"",
        workNatureStr, month||"",
        (assignedTo||"").trim(),  // ← always trim so "Arthika " == "Arthika"
        referredBy||"",
        workStartDate||"", expectedCompletion||"",
        documentObtained||"Yes", pendingRemarks||"",
        checklist||"Yes", priority||"Normal", notes||"",
        Number(fees)||0, Number(reimbAmt)||0,
        status||"Pending", referenceNo||"", reviewedBy||"",
      ]
    );
    res.json({ id: result.insertId, message: "Work saved" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// PATCH /works/:id — update any field
app.patch("/works/:id", async (req, res) => {
  const fields = { ...req.body };
  if (fields.assignedTo !== undefined) {
    fields.assignedTo = (fields.assignedTo||"").trim();
  }
  const keys = Object.keys(fields);
  if (!keys.length) return res.status(400).json({ error: "No fields" });
  try {
    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    await pool.query(
      `UPDATE works SET ${setClause} WHERE id = ?`,
      [...keys.map(k => fields[k]), req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.delete("/works/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM works WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════
const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];

app.get("/attendance/today", async (req, res) => {
  const { name, date } = req.query;
  if (!name || !date) return res.status(400).json({ error: "name and date required" });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendance WHERE LOWER(TRIM(name))=LOWER(TRIM(?)) AND date=? ORDER BY session ASC",
      [name, date]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/attendance/checkin", async (req, res) => {
  const { name, role, date, checkIn, session } = req.body;
  try {
    const [d, m, y] = date.split("-");
    const monthLabel = `${MONTHS_LIST[parseInt(m)-1]} ${y}`;
    await pool.query(
      `INSERT INTO attendance (name,role,date,checkIn,session,status,month) VALUES (?,?,?,?,?,'Present',?)`,
      [name.trim(), role||"", date, checkIn, session||1, monthLabel]
    );
    res.json({ message: "Checked in" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/attendance/checkout", async (req, res) => {
  const { name, date, checkOut, session, totalMins } = req.body;
  try {
    await pool.query(
      `UPDATE attendance SET checkOut=?, totalMins=?
       WHERE LOWER(TRIM(name))=LOWER(TRIM(?)) AND date=? AND session=? AND checkOut IS NULL
       ORDER BY id DESC LIMIT 1`,
      [checkOut, totalMins||0, name, date, session]
    );
    res.json({ message: "Checked out" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/attendance/leave", async (req, res) => {
  const { name, role, date, leaveType, reason } = req.body;
  try {
    const [d, m, y] = date.split("-");
    const monthLabel = `${MONTHS_LIST[parseInt(m)-1]} ${y}`;
    const [exists] = await pool.query(
      "SELECT id FROM attendance WHERE LOWER(TRIM(name))=LOWER(TRIM(?)) AND date=? AND leaveType IS NOT NULL",
      [name, date]
    );
    if (exists.length) {
      await pool.query(
        "UPDATE attendance SET leaveType=?, reason=? WHERE LOWER(TRIM(name))=LOWER(TRIM(?)) AND date=? AND leaveType IS NOT NULL",
        [leaveType, reason, name, date]
      );
    } else {
      await pool.query(
        `INSERT INTO attendance (name,role,date,leaveType,reason,status,month) VALUES (?,?,?,?,?,'Leave',?)`,
        [name.trim(), role||"", date, leaveType, reason, monthLabel]
      );
    }
    res.json({ message: "Leave recorded" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.get("/attendance/history", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "name required" });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendance WHERE LOWER(TRIM(name))=LOWER(TRIM(?)) ORDER BY date DESC, session ASC",
      [name]
    );
    const grouped = {};
    for (const row of rows) {
      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = {
          date: key, status: row.status, leaveType: row.leaveType,
          reason: row.reason, month: row.month, sessions: [], totalMins: 0
        };
      }
      if (row.checkIn) {
        grouped[key].sessions.push({ checkIn: row.checkIn, checkOut: row.checkOut });
        grouped[key].totalMins += row.totalMins||0;
      }
    }
    res.json(Object.values(grouped));
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get("/attendance/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM attendance ORDER BY date DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// REIMBURSEMENTS
// ═══════════════════════════════════════════════════════════════════════════════
app.get("/reimbursements", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reimbursements ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/reimbursements", async (req, res) => {
  const {
    clientName, taxType, remarkPeriod, remarkDetail, fullRemark,
    amount, date, paidBy, paymentSource, staffPaidFrom,
    officeOwesStaff, status, addedBy, addedOn, invoiceId
  } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO reimbursements
       (clientName,taxType,remarkPeriod,remarkDetail,fullRemark,amount,date,paidBy,
        paymentSource,staffPaidFrom,officeOwesStaff,status,addedBy,addedOn,invoiceId)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        clientName, taxType, remarkPeriod||"", remarkDetail||"", fullRemark||"",
        Number(amount)||0, date, paidBy,
        paymentSource||"office", staffPaidFrom||"",
        officeOwesStaff ? 1 : 0,
        status||"Pending", addedBy||"", addedOn||"", invoiceId||""
      ]
    );
    res.json({ id: result.insertId, message: "Saved" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.patch("/reimbursements/:id", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.status(400).json({ error: "No fields" });
  try {
    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    await pool.query(
      `UPDATE reimbursements SET ${setClause} WHERE id = ?`,
      [...keys.map(k => fields[k]), req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
app.get("/api/settings", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT key_name, value FROM settings");
    const obj = {};
    rows.forEach(r => { obj[r.key_name] = r.value; });
    res.json(obj);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/settings", async (req, res) => {
  const entries = Object.entries(req.body);
  if (!entries.length) return res.status(400).json({ error: "No settings" });
  try {
    for (const [key, value] of entries) {
      await pool.query(
        "INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
        [key, value, value]
      );
    }
    res.json({ message: "Settings saved" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/bulk-import", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text" });
  const d = new Date();
  const curMonth = `${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}`;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  let imported = 0, errors = [];
  for (const line of lines) {
    const parts = line.split(",").map(p => p.trim());
    const [clientName, pan, contactNo, referredBy] = parts;
    if (!clientName) continue;
    try {
      await pool.query(
        `INSERT INTO works
         (clientName,pan,contactNo,referredBy,status,month,workNature,
          assignedTo,completedBy,completionRemarks)
         VALUES (?,?,?,?,'Pending',?,'To be assigned','','','')`,
        [clientName, pan||"", contactNo||"", referredBy||"", curMonth]
      );
      imported++;
    } catch (e) { errors.push(`${clientName}: ${e.message}`); }
  }
  res.json({ imported, errors });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════════════════════════
app.get("/invoices", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM invoices ORDER BY created_at DESC");
    const data = rows.map(r => ({
      ...r,
      items: typeof r.items === "string" ? JSON.parse(r.items||"[]") : (r.items||[])
    }));
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get("/invoices/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM invoices WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const r = rows[0];
    res.json({
      ...r,
      items: typeof r.items === "string" ? JSON.parse(r.items||"[]") : (r.items||[])
    });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/invoices", async (req, res) => {
  const {
    clientName, clientPan, clientContact, clientAddress,
    invoiceDate, dueDate, items, subtotal, gstTotal, grandTotal, status
  } = req.body;
  try {
    const year = new Date().getFullYear();
    const [countRows] = await pool.query(
      "SELECT COUNT(*) as cnt FROM invoices WHERE invoiceNo LIKE ?",
      [`INV-${year}-%`]
    );
    const seq = String(countRows[0].cnt + 1).padStart(3, "0");
    const invoiceNo = `INV-${year}-${seq}`;
    const [result] = await pool.query(
      `INSERT INTO invoices
       (invoiceNo, clientName, clientPan, clientContact, clientAddress,
        invoiceDate, dueDate, items, subtotal, gstTotal, grandTotal, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNo, clientName, clientPan||"", clientContact||"", clientAddress||"",
        invoiceDate||"", dueDate||"", JSON.stringify(items||[]),
        Number(subtotal)||0, Number(gstTotal)||0, Number(grandTotal)||0,
        status||"Pending"
      ]
    );
    res.json({ id: result.insertId, invoiceNo, message: "Invoice created" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.patch("/invoices/:id", async (req, res) => {
  const fields = { ...req.body };
  if (fields.status === "Paid" && !fields.paidOn) {
    fields.paidOn = new Date().toISOString().split("T")[0];
  }
  const keys = Object.keys(fields);
  if (!keys.length) return res.status(400).json({ error: "No fields" });
  try {
    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    await pool.query(
      `UPDATE invoices SET ${setClause} WHERE id = ?`,
      [...keys.map(k => fields[k]), req.params.id]
    );
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.delete("/invoices/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM invoices WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 CA Office backend on http://localhost:${PORT}`));
}).catch(err => { console.error("DB init failed:", err); process.exit(1); });