const jobsEl = document.querySelector("#jobs");
const emptyEl = document.querySelector("#empty");
const dialog = document.querySelector("#jobDialog");
const form = document.querySelector("#jobForm");
const errorEl = document.querySelector("#error");
const openJob = document.querySelector("#openJob");
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
async function refresh() {
  const [statsResponse, jobsResponse] = await Promise.all([fetch("/api/stats"), fetch("/api/jobs")]);
  const stats = (await statsResponse.json()).data;
  const jobs = (await jobsResponse.json()).data;
  document.querySelector("#worker").textContent = stats.worker;
  document.querySelector("#queued").textContent = stats.queued;
  document.querySelector("#cache").textContent = stats.cacheEntries;
  emptyEl.hidden = jobs.length > 0;
  jobsEl.innerHTML = jobs.map((job) => `<article class="job"><div class="job-icon ${job.status}">${job.status === "completed" ? "✓" : "↗"}</div><div class="job-body"><div class="job-top"><strong>${escapeHtml(job.payload.type)}</strong><span class="badge ${job.status}">${job.status}</span></div><p>${escapeHtml(job.result || job.payload.message)}</p><small>${escapeHtml(job.payload.recipient)} · ${new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div></article>`).join("");
}
openJob.addEventListener("click", () => { form.reset(); errorEl.textContent = ""; dialog.showModal(); document.querySelector("#message").focus(); });
document.querySelector("#close").addEventListener("click", () => dialog.close());
form.addEventListener("submit", async (event) => { event.preventDefault(); const response = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: document.querySelector("#type").value, recipient: document.querySelector("#recipient").value, message: document.querySelector("#message").value }) }); const data = await response.json(); if (!response.ok) { errorEl.textContent = data.error; return; } dialog.close(); await refresh(); });
refresh(); setInterval(refresh, 1800);