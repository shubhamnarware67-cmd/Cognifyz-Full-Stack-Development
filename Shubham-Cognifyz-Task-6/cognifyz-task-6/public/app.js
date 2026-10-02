const authScreen = document.querySelector("#authScreen");
const appScreen = document.querySelector("#appScreen");
const authForm = document.querySelector("#authForm");
const authNotice = document.querySelector("#authNotice");
const nameField = document.querySelector("#nameField");
const authAction = document.querySelector("#authAction");
const tabs = document.querySelectorAll(".tab");
let mode = "login";
let token = localStorage.getItem("shubhamTaskToken");

function showNotice(message, type = "bad") { authNotice.hidden = false; authNotice.className = `notice ${type}`; authNotice.textContent = message; }
function setMode(next) { mode = next; tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === next)); nameField.hidden = next === "login"; authAction.textContent = next === "login" ? "Log in" : "Create account"; document.querySelector("#password").autocomplete = next === "login" ? "current-password" : "new-password"; authNotice.hidden = true; }
async function api(path, options = {}) { const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Something went wrong."); return result; }
async function enterWorkspace(user) { authScreen.hidden = true; appScreen.hidden = false; document.querySelector("#userName").textContent = user.name.split(" ")[0]; await loadTasks(); }
async function loadTasks() { const { data } = await api("/api/tasks"); const list = document.querySelector("#taskList"); document.querySelector("#taskEmpty").hidden = data.length > 0; list.innerHTML = data.map((task) => `<div class="task ${task.done ? "done" : ""}"><label><input type="checkbox" data-toggle="${task.id}" ${task.done ? "checked" : ""}/><span>${task.title.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]))}</span></label><button data-remove="${task.id}" aria-label="Delete task">×</button></div>`).join(""); }
authForm.addEventListener("submit", async (event) => { event.preventDefault(); const body = { name: document.querySelector("#name").value, email: document.querySelector("#email").value, password: document.querySelector("#password").value }; try { const result = await api(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", body: JSON.stringify(body) }); token = result.token; localStorage.setItem("shubhamTaskToken", token); await enterWorkspace(result.user); } catch (error) { showNotice(error.message); } });
tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.mode)));
document.querySelector("#taskForm").addEventListener("submit", async (event) => { event.preventDefault(); const input = document.querySelector("#taskTitle"); try { await api("/api/tasks", { method: "POST", body: JSON.stringify({ title: input.value }) }); input.value = ""; await loadTasks(); } catch (error) { alert(error.message); } });
document.querySelector("#taskList").addEventListener("click", async (event) => { const id = event.target.dataset.toggle || event.target.dataset.remove; if (!id) return; if (event.target.dataset.toggle) await api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ done: event.target.checked }) }); else await api(`/api/tasks/${id}`, { method: "DELETE" }); await loadTasks(); });
document.querySelector("#logout").addEventListener("click", () => { localStorage.removeItem("shubhamTaskToken"); token = null; location.reload(); });
if (token) api("/api/me").then(({ user }) => enterWorkspace(user)).catch(() => { localStorage.removeItem("shubhamTaskToken"); token = null; });