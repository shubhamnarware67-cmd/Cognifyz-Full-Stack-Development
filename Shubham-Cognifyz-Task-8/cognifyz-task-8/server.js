const express = require("express");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const app = express();
const port = process.env.PORT || 3008;
const jobs = [];
const completedJobs = [];
const cache = new Map();
const startedAt = new Date().toISOString();
let processing = false;
let processedCount = 0;

app.use((req, res, next) => {
  const started = Date.now();
  res.on("finish", () => console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`));
  next();
});
app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function cleanCache() {
  const now = Date.now();
  for (const [key, item] of cache) if (item.expiresAt < now) cache.delete(key);
}
function getCached(key) {
  cleanCache();
  const item = cache.get(key);
  return item ? { value: item.value, ageMs: Date.now() - item.createdAt } : null;
}
function setCached(key, value, ttlMs = 30_000) {
  cache.set(key, { value, createdAt: Date.now(), expiresAt: Date.now() + ttlMs });
  return value;
}
async function processNextJob() {
  if (processing || !jobs.length) return;
  processing = true;
  const job = jobs.shift();
  job.status = "processing";
  await new Promise((resolve) => setTimeout(resolve, 700));
  job.status = "completed";
  job.completedAt = new Date().toISOString();
  job.result = `Prepared ${job.payload.type} for ${job.payload.recipient || "the team"}.`;
  completedJobs.unshift(job);
  processedCount += 1;
  processing = false;
  setImmediate(processNextJob);
}
setInterval(processNextJob, 1000).unref();

app.get("/api/stats", (req, res) => {
  const cached = getCached("stats");
  if (cached) return res.json({ data: cached.value, cache: { hit: true, ageMs: cached.ageMs } });
  const stats = { uptimeSeconds: Math.round(process.uptime()), startedAt, queued: jobs.length, completed: completedJobs.length, processedCount, cacheEntries: cache.size, worker: processing ? "working" : "waiting" };
  res.json({ data: setCached("stats", stats), cache: { hit: false, ageMs: 0 } });
});
app.get("/api/jobs", (req, res) => res.json({ data: [...jobs, ...completedJobs].slice(0, 20) }));
app.post("/api/jobs", (req, res) => {
  const { type = "digest", recipient = "the team", message = "" } = req.body;
  if (!String(message).trim()) return res.status(400).json({ error: "A message is required for the background job." });
  const job = { id: randomUUID(), status: "queued", createdAt: new Date().toISOString(), payload: { type, recipient: String(recipient).trim(), message: String(message).trim() } };
  jobs.push(job);
  res.status(202).json({ data: job, message: "Job accepted and placed in the queue." });
  processNextJob();
});
app.get("/api/cache/:key", (req, res) => {
  const item = getCached(req.params.key);
  res.json({ key: req.params.key, hit: Boolean(item), value: item?.value ?? null, ageMs: item?.ageMs ?? null });
});
app.post("/api/cache/:key", (req, res) => {
  setCached(req.params.key, req.body.value ?? null);
  res.status(201).json({ key: req.params.key, stored: true, ttlSeconds: 30 });
});
app.get("/api/health", (req, res) => res.json({ ok: true, queue: jobs.length, worker: processing ? "working" : "waiting" }));
app.listen(port, () => console.log(`Shubham's operations room is running at http://localhost:${port}`));