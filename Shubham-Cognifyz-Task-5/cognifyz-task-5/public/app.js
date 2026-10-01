const notesEl = document.querySelector("#notes");
const emptyEl = document.querySelector("#empty");
const countEl = document.querySelector("#noteCount");
const dialog = document.querySelector("#noteDialog");
const form = document.querySelector("#noteForm");
const idInput = document.querySelector("#noteId");
const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const tagInput = document.querySelector("#tag");
const errorEl = document.querySelector("#dialogError");
let notes = [];

const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
function render() {
  countEl.textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;
  emptyEl.hidden = notes.length > 0;
  notesEl.innerHTML = notes.map((note, index) => `<article class="note-card"><div class="note-top"><span class="tag">${escapeHtml(note.tag)}</span><span class="index">0${index + 1}</span></div><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.body)}</p><div class="note-actions"><button data-edit="${note.id}">Edit</button><button data-delete="${note.id}">Delete</button></div></article>`).join("");
}
async function loadNotes() { const response = await fetch("/api/notes"); ({ data: notes } = await response.json()); render(); }
function openNew() { form.reset(); idInput.value = ""; document.querySelector("#dialogTitle").textContent = "New note"; errorEl.textContent = ""; dialog.showModal(); titleInput.focus(); }
function openEdit(note) { idInput.value = note.id; titleInput.value = note.title; bodyInput.value = note.body; tagInput.value = note.tag; document.querySelector("#dialogTitle").textContent = "Edit note"; errorEl.textContent = ""; dialog.showModal(); titleInput.focus(); }
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = { title: titleInput.value, body: bodyInput.value, tag: tagInput.value };
  const id = idInput.value;
  const response = await fetch(id ? `/api/notes/${id}` : "/api/notes", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) { errorEl.textContent = result.error; return; }
  dialog.close(); await loadNotes();
});
notesEl.addEventListener("click", async (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) openEdit(notes.find((note) => note.id === editId));
  if (deleteId && confirm("Delete this note?")) { await fetch(`/api/notes/${deleteId}`, { method: "DELETE" }); await loadNotes(); }
});
document.querySelector("#newNote").addEventListener("click", openNew);
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
loadNotes().catch(() => { countEl.textContent = "Could not load notes"; });