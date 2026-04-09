const express = require("express");
const mysql   = require("mysql2/promise");
const cors    = require("cors");
const bcrypt  = require("bcryptjs");

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
}));
app.use(express.json());

// ─── DB Pool ──────────────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  ssl: { rejectUnauthorized: false }, // Required for Aiven
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── Init DB ──────────────────────────────────────────────────────────────────
async function initDB() {
  const rootPool = mysql.createPool({
    host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
    waitForConnections: true, connectionLimit: 2,
  });
  const rootConn = await rootPool.getConnection();
  await rootConn.query("CREATE DATABASE IF NOT EXISTS caoffice");
  rootConn.release();
  await rootPool.end();

  const conn = await pool.getConnection();

  await conn.query(`
    CREATE TABLE IF NOT EXISTS logins (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100)  NOT NULL,
      password   VARCHAR(255)  NOT NULL,
      role       VARCHAR(50)   NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // works table — workNature TEXT allows comma-separated multiple values
  await conn.query(`
    CREATE TABLE IF NOT EXISTS works (
      id                  INT AUTO_INCREMENT PRIMARY KEY,
      clientName          VARCHAR(200),
      pan                 VARCHAR(20),
      contactNo           VARCHAR(20),
      address             TEXT,
      organization        VARCHAR(100),
      workNature          TEXT,
      month               VARCHAR(50),
      assignedTo          VARCHAR(100),
      referredBy          VARCHAR(100),
      workStartDate       VARCHAR(20),
      expectedCompletion  VARCHAR(20),
      documentObtained    VARCHAR(20)    DEFAULT 'Yes',
      pendingRemarks      TEXT,
      checklist           VARCHAR(10)    DEFAULT 'Yes',
      priority            VARCHAR(20)    DEFAULT 'Normal',
      notes               TEXT,
      fees                DECIMAL(12,2)  DEFAULT 0,
      reimbAmt            DECIMAL(12,2)  DEFAULT 0,
      status              VARCHAR(50)    DEFAULT 'Pending',
      referenceNo         VARCHAR(100),
      reviewedBy          VARCHAR(100),
      completedBy         VARCHAR(100)   DEFAULT '',
      completionRemarks   TEXT,
      invoiceGenerated    VARCHAR(5)     DEFAULT 'No',
      invoiceSent         VARCHAR(5)     DEFAULT 'No',
      feesReceived        TINYINT(1)     DEFAULT 0,
      feesReceivedAmt     DECIMAL(12,2)  DEFAULT 0,
      feesReceivedMode    VARCHAR(50),
      feesReceivedDate    VARCHAR(20),
      feesReceivedRef     VARCHAR(100),
      created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safe upgrade — add any missing columns to existing DB
  const upgradeCols = [
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS organization       VARCHAR(100)",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS reimbAmt           DECIMAL(12,2) DEFAULT 0",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS referenceNo        VARCHAR(100)",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS reviewedBy         VARCHAR(100)",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS completedBy        VARCHAR(100) DEFAULT ''",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS completionRemarks  TEXT",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS invoiceGenerated   VARCHAR(5) DEFAULT 'No'",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS invoiceSent        VARCHAR(5) DEFAULT 'No'",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceived       TINYINT(1) DEFAULT 0",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedAmt    DECIMAL(12,2) DEFAULT 0",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedMode   VARCHAR(50)",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedDate   VARCHAR(20)",
    "ALTER TABLE works ADD COLUMN IF NOT EXISTS feesReceivedRef    VARCHAR(100)",
    // workNature needs to be TEXT to hold comma-separated values
    "ALTER TABLE works MODIFY COLUMN workNature TEXT",
  ];
  for (const sql of upgradeCols) {
    try { await conn.query(sql); } catch (_) {}
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      role       VARCHAR(50),
      date       VARCHAR(20)  NOT NULL,
      checkIn    VARCHAR(30),
      checkOut   VARCHAR(30),
      session    INT          DEFAULT 1,
      totalMins  INT          DEFAULT 0,
      leaveType  VARCHAR(50),
      reason     TEXT,
      status     VARCHAR(30)  DEFAULT 'Present',
      month      VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS reimbursements (
      id               INT AUTO_INCREMENT PRIMARY KEY,
      clientName       VARCHAR(200),
      taxType          VARCHAR(100),
      remarkPeriod     VARCHAR(100),
      remarkDetail     TEXT,
      fullRemark       TEXT,
      amount           DECIMAL(12,2) DEFAULT 0,
      date             VARCHAR(20),
      paidBy           VARCHAR(100),
      paymentSource    VARCHAR(20)   DEFAULT 'office',
      staffPaidFrom    VARCHAR(30),
      officeOwesStaff  TINYINT(1)    DEFAULT 0,
      officePaidStaffOn VARCHAR(20),
      status           VARCHAR(30)   DEFAULT 'Pending',
      addedBy          VARCHAR(100),
      addedOn          VARCHAR(20),
      invoiceId        VARCHAR(100),
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      key_name   VARCHAR(100) NOT NULL UNIQUE,
      value      TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // invoices table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      invoiceNo     VARCHAR(50) NOT NULL UNIQUE,
      clientName    VARCHAR(200),
      clientPan     VARCHAR(20),
      clientContact VARCHAR(30),
      clientAddress TEXT,
      invoiceDate   VARCHAR(20),
      dueDate       VARCHAR(20),
      items         JSON,
      subtotal      DECIMAL(12,2) DEFAULT 0,
      gstTotal      DECIMAL(12,2) DEFAULT 0,
      grandTotal    DECIMAL(12,2) DEFAULT 0,
      status        VARCHAR(20)   DEFAULT 'Pending',
      paidOn        VARCHAR(20),
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  conn.release();
  console.log("✅ Database & tables initialized");
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
app.post("/api/login", async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role) return res.status(400).json({ error: "Missing fields" });
  try {
    const [rows] = await pool.query("SELECT * FROM logins WHERE name = ? AND role = ?", [name, role]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ id: rows[0].id, name: rows[0].name, role: rows[0].role });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/api/register", async (req, res) => {
  const { name, password, role } = req.body;
  if (!name || !password || !role) return res.status(400).json({ error: "Missing fields" });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO logins (name, password, role) VALUES (?, ?, ?)", [name, hashed, role]);
    res.json({ message: "User created" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, role FROM logins ORDER BY role, name");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORKS
// ═══════════════════════════════════════════════════════════════════════════════
app.get("/works", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM works ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.get("/clients", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM works ORDER BY clientName, created_at DESC");
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// POST /add-client — supports multi-select workNature (array or comma string)
app.post("/add-client", async (req, res) => {
  const {
    clientName, pan, contactNo, address, organization,
    workNature, month, assignedTo, referredBy,
    workStartDate, expectedCompletion,
    documentObtained, pendingRemarks, checklist,
    priority, notes, fees, status, referenceNo, reviewedBy, reimbAmt,
  } = req.body;

  if (!clientName) return res.status(400).json({ error: "clientName is required" });

  // workNature can be array (multi-select) or string — store as comma-separated text
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
         fees, reimbAmt, status, referenceNo, reviewedBy, completedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
      [
        clientName, pan||"", contactNo||"", address||"", organization||"",
        workNatureStr, month||"", assignedTo||"", referredBy||"",
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

// PATCH /works/:id — updates any field including completedBy
app.patch("/works/:id", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.status(400).json({ error: "No fields" });
  try {
    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    await pool.query(`UPDATE works SET ${setClause} WHERE id = ?`, [...keys.map(k => fields[k]), req.params.id]);
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
app.get("/attendance/today", async (req, res) => {
  const { name, date } = req.query;
  if (!name || !date) return res.status(400).json({ error: "name and date required" });
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendance WHERE name = ? AND date = ? ORDER BY session ASC", [name, date]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

app.post("/attendance/checkin", async (req, res) => {
  const { name, role, date, checkIn, session } = req.body;
  try {
    const [d, m, y] = date.split("-");
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const monthLabel = `${MONTHS[parseInt(m)-1]} ${y}`;
    await pool.query(
      `INSERT INTO attendance (name,role,date,checkIn,session,status,month) VALUES (?,?,?,?,?,'Present',?)`,
      [name, role||"", date, checkIn, session||1, monthLabel]
    );
    res.json({ message: "Checked in" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/attendance/checkout", async (req, res) => {
  const { name, date, checkOut, session, totalMins } = req.body;
  try {
    await pool.query(
      `UPDATE attendance SET checkOut=?, totalMins=? WHERE name=? AND date=? AND session=? AND checkOut IS NULL ORDER BY id DESC LIMIT 1`,
      [checkOut, totalMins||0, name, date, session]
    );
    res.json({ message: "Checked out" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

app.post("/attendance/leave", async (req, res) => {
  const { name, role, date, leaveType, reason } = req.body;
  try {
    const [d, m, y] = date.split("-");
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const monthLabel = `${MONTHS[parseInt(m)-1]} ${y}`;
    const [exists] = await pool.query(
      "SELECT id FROM attendance WHERE name=? AND date=? AND leaveType IS NOT NULL", [name, date]
    );
    if (exists.length) {
      await pool.query(
        "UPDATE attendance SET leaveType=?, reason=? WHERE name=? AND date=? AND leaveType IS NOT NULL",
        [leaveType, reason, name, date]
      );
    } else {
      await pool.query(
        `INSERT INTO attendance (name,role,date,leaveType,reason,status,month) VALUES (?,?,?,?,?,'Leave',?)`,
        [name, role||"", date, leaveType, reason, monthLabel]
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
      "SELECT * FROM attendance WHERE name=? ORDER BY date DESC, session ASC", [name]
    );
    const grouped = {};
    for (const row of rows) {
      const key = row.date;
      if (!grouped[key]) {
        grouped[key] = { date:key, status:row.status, leaveType:row.leaveType, reason:row.reason, month:row.month, sessions:[], totalMins:0 };
      }
      if (row.checkIn) {
        grouped[key].sessions.push({ checkIn:row.checkIn, checkOut:row.checkOut });
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
  const { clientName, taxType, remarkPeriod, remarkDetail, fullRemark, amount, date, paidBy, paymentSource, staffPaidFrom, officeOwesStaff, status, addedBy, addedOn, invoiceId } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO reimbursements (clientName,taxType,remarkPeriod,remarkDetail,fullRemark,amount,date,paidBy,paymentSource,staffPaidFrom,officeOwesStaff,status,addedBy,addedOn,invoiceId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [clientName, taxType, remarkPeriod||"", remarkDetail||"", fullRemark||"", Number(amount)||0, date, paidBy, paymentSource||"office", staffPaidFrom||"", officeOwesStaff?1:0, status||"Pending", addedBy||"", addedOn||"", invoiceId||""]
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
    await pool.query(`UPDATE reimbursements SET ${setClause} WHERE id = ?`, [...keys.map(k => fields[k]), req.params.id]);
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════
app.get("/api/users/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, role, created_at FROM logins ORDER BY role DESC, name ASC");
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
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date();
  const curMonth = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  let imported = 0, errors = [];
  for (const line of lines) {
    const parts = line.split(",").map(p => p.trim());
    const [clientName, pan, contactNo, referredBy] = parts;
    if (!clientName) continue;
    try {
      await pool.query(
        `INSERT INTO works (clientName,pan,contactNo,referredBy,status,month,workNature,assignedTo,completedBy) VALUES (?,?,?,?,'Pending',?,'To be assigned','','')`,
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

// GET /invoices — all invoices
app.get("/invoices", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM invoices ORDER BY created_at DESC");
    // Parse items JSON
    const data = rows.map(r => ({ ...r, items: typeof r.items === "string" ? JSON.parse(r.items||"[]") : (r.items||[]) }));
    res.json(data);
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// GET /invoices/:id — single invoice
app.get("/invoices/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM invoices WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const r = rows[0];
    res.json({ ...r, items: typeof r.items === "string" ? JSON.parse(r.items||"[]") : (r.items||[]) });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// POST /invoices — create new invoice (auto-generate invoice number)
app.post("/invoices", async (req, res) => {
  const { clientName, clientPan, clientContact, clientAddress, invoiceDate, dueDate, items, subtotal, gstTotal, grandTotal, status } = req.body;
  try {
    // Generate invoice number: INV-YYYY-001 format
    const year = new Date().getFullYear();
    const [countRows] = await pool.query("SELECT COUNT(*) as cnt FROM invoices WHERE invoiceNo LIKE ?", [`INV-${year}-%`]);
    const seq = String(countRows[0].cnt + 1).padStart(3, "0");
    const invoiceNo = `INV-${year}-${seq}`;

    const [result] = await pool.query(
      `INSERT INTO invoices (invoiceNo, clientName, clientPan, clientContact, clientAddress, invoiceDate, dueDate, items, subtotal, gstTotal, grandTotal, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [invoiceNo, clientName, clientPan||"", clientContact||"", clientAddress||"", invoiceDate||"", dueDate||"",
       JSON.stringify(items||[]), Number(subtotal)||0, Number(gstTotal)||0, Number(grandTotal)||0, status||"Pending"]
    );
    res.json({ id: result.insertId, invoiceNo, message: "Invoice created" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// PATCH /invoices/:id — update status (Paid/Pending)
app.patch("/invoices/:id", async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  if (!keys.length) return res.status(400).json({ error: "No fields" });
  try {
    // If marking as Paid, set paidOn date
    if (fields.status === "Paid" && !fields.paidOn) {
      fields.paidOn = new Date().toISOString().split("T")[0];
      keys.push("paidOn");
    }
    const setClause = keys.map(k => `\`${k}\` = ?`).join(", ");
    await pool.query(`UPDATE invoices SET ${setClause} WHERE id = ?`, [...keys.map(k => fields[k]), req.params.id]);
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// DELETE /invoices/:id
app.delete("/invoices/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM invoices WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Server error" }); }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = 5000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 CA Office backend running on http://localhost:${PORT}`));
}).catch(err => { console.error("DB init failed:", err); process.exit(1); });
