const express = require("express");
const path = require("node:path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3006;
const jwtSecret = process.env.JWT_SECRET || "shubham-task-6-local-secret";
const db = new Database(process.env.DB_FILE || path.join(__dirname, "shubham-workspace.db"));

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function makeToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, jwtSecret, { expiresIn: "2h" });
}
function safeUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "A Bearer token is required." });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
}

app.post("/api/auth/register", async (req, res) => {
  const { name = "", email = "", password = "" } = req.body;
  if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: "Use a name, valid email, and password of at least 8 characters." });
  }
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare("INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)").run(name.trim(), normalizedEmail, passwordHash, new Date().toISOString());
    const user = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ user: safeUser(user), token: makeToken(user) });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "An account with that email already exists." });
    res.status(500).json({ error: "Could not create the account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email = "", password = "" } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Email or password is not correct." });
  res.json({ user: safeUser(user), token: makeToken(user) });
});

app.get("/api/me", auth, (req, res) => {
  const user = db.prepare("SELECT id, name, email FROM users WHERE id = ?").get(req.user.sub);
  if (!user) return res.status(401).json({ error: "User no longer exists." });
  res.json({ user: safeUser(user) });
});

app.get("/api/tasks", auth, (req, res) => {
  const tasks = db.prepare("SELECT id, title, done, created_at AS createdAt FROM tasks WHERE user_id = ? ORDER BY id DESC").all(req.user.sub);
  res.json({ data: tasks });
});
app.post("/api/tasks", auth, (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ error: "Task title is required." });
  const result = db.prepare("INSERT INTO tasks (user_id, title, created_at) VALUES (?, ?, ?)").run(req.user.sub, req.body.title.trim(), new Date().toISOString());
  res.status(201).json({ data: db.prepare("SELECT id, title, done, created_at AS createdAt FROM tasks WHERE id = ?").get(result.lastInsertRowid) });
});
app.patch("/api/tasks/:id", auth, (req, res) => {
  const task = db.prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?").get(req.params.id, req.user.sub);
  if (!task) return res.status(404).json({ error: "Task not found." });
  if (req.body.title !== undefined) db.prepare("UPDATE tasks SET title = ? WHERE id = ? AND user_id = ?").run(String(req.body.title).trim(), req.params.id, req.user.sub);
  if (req.body.done !== undefined) db.prepare("UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?").run(req.body.done ? 1 : 0, req.params.id, req.user.sub);
  res.json({ data: db.prepare("SELECT id, title, done, created_at AS createdAt FROM tasks WHERE id = ?").get(req.params.id) });
});
app.delete("/api/tasks/:id", auth, (req, res) => {
  const result = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(req.params.id, req.user.sub);
  if (!result.changes) return res.status(404).json({ error: "Task not found." });
  res.json({ ok: true });
});

app.listen(port, () => console.log(`Shubham's private workspace is running at http://localhost:${port}`));