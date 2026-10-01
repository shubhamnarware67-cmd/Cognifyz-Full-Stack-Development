const express = require("express");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const app = express();
const port = process.env.PORT || 3005;
const notes = [
  { id: randomUUID(), title: "Start small", body: "A useful note is better than a crowded dashboard.", tag: "idea", createdAt: new Date().toISOString() },
  { id: randomUUID(), title: "Keep the edges soft", body: "Good products leave room for the human using them.", tag: "reminder", createdAt: new Date().toISOString() },
];
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/notes", (req, res) => res.json({ data: notes }));
app.post("/api/notes", (req, res) => {
  const { title, body, tag = "idea" } = req.body;
  if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: "Title and body are required." });
  const note = { id: randomUUID(), title: title.trim(), body: body.trim(), tag: String(tag).trim() || "idea", createdAt: new Date().toISOString() };
  notes.unshift(note);
  res.status(201).json({ data: note });
});
app.patch("/api/notes/:id", (req, res) => {
  const note = notes.find((item) => item.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found." });
  if (req.body.title !== undefined) note.title = String(req.body.title).trim();
  if (req.body.body !== undefined) note.body = String(req.body.body).trim();
  if (req.body.tag !== undefined) note.tag = String(req.body.tag).trim() || "idea";
  res.json({ data: note });
});
app.delete("/api/notes/:id", (req, res) => {
  const index = notes.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Note not found." });
  const [deleted] = notes.splice(index, 1);
  res.json({ data: deleted });
});
app.listen(port, () => console.log(`Shubham's API notebook is running at http://localhost:${port}`));