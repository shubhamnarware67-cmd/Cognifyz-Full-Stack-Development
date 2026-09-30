const routes = document.querySelectorAll("[data-route]");
const form = document.querySelector("#signupForm");
const notice = document.querySelector("#formNotice");
const password = document.querySelector("#password");
const strengthText = document.querySelector("#strengthText");
const strengthBars = [...document.querySelectorAll("#strength span")];

function showRoute() {
  const route = location.hash.replace("#", "") || "signup";
  routes.forEach((section) => { section.hidden = section.dataset.route !== route; });
  document.querySelectorAll("nav a").forEach((link) => link.classList.toggle("active", link.hash === `#${route}`));
}
function passwordScore(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}
function updateStrength() {
  const score = passwordScore(password.value);
  strengthBars.forEach((bar, index) => bar.className = index < score ? `filled level-${score}` : "");
  strengthText.textContent = !password.value ? "Use a mix of letters, numbers, and a symbol." : ["Let's add a few more characters.", "Getting there — add a number.", "Nearly there — add a symbol.", "Strong password."][score - 1] || "Strong password.";
}
function setError(field, message) {
  const input = document.querySelector(`#${field}`);
  const error = document.querySelector(`[data-error-for="${field}"]`);
  input.classList.toggle("invalid", Boolean(message));
  error.textContent = message || "";
}
function validate() {
  const data = new FormData(form);
  const errors = {};
  if (!data.get("fullName").trim() || data.get("fullName").trim().length < 2) errors.fullName = "Please add your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get("email"))) errors.email = "That email format looks incomplete.";
  if (passwordScore(data.get("password")) < 4) errors.password = "Use 8+ characters with upper/lowercase, a number, and a symbol.";
  if (data.get("password") !== data.get("confirmPassword")) errors.confirmPassword = "Passwords do not match.";
  if (!data.get("terms")) errors.terms = "Please accept the demo terms.";
  ["fullName", "email", "password", "confirmPassword", "terms"].forEach((field) => setError(field, errors[field]));
  return errors;
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const errors = validate();
  if (Object.keys(errors).length) {
    notice.hidden = false; notice.className = "notice bad"; notice.textContent = "A couple of details need your attention.";
    return;
  }
  form.hidden = true; document.querySelector("#successView").hidden = false; notice.hidden = true;
});
password.addEventListener("input", updateStrength);
document.querySelector("#togglePassword").addEventListener("click", (event) => {
  password.type = password.type === "password" ? "text" : "password";
  event.target.textContent = password.type === "password" ? "Show" : "Hide";
});
document.querySelector("#reset").addEventListener("click", () => { form.reset(); form.hidden = false; document.querySelector("#successView").hidden = true; updateStrength(); });
window.addEventListener("hashchange", showRoute);
showRoute(); updateStrength();