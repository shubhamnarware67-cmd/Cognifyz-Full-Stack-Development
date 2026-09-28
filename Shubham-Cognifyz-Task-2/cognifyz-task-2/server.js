const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3002;
const submissions = [];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

function validateSubmission(data) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2) errors.name = "Please enter at least 2 characters.";
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Use a valid email address.";
  if (!data.topic) errors.topic = "Choose a topic.";
  if (!data.message || data.message.trim().length < 12) errors.message = "Tell us a little more (12 characters minimum).";
  return errors;
}

function pageData(extra = {}) {
  return {
    owner: "Shubham",
    submissions: submissions.slice().reverse(),
    formData: {},
    errors: {},
    ...extra,
  };
}

app.get("/", (req, res) => res.render("index", pageData()));

app.post("/submit", (req, res) => {
  const errors = validateSubmission(req.body);
  if (Object.keys(errors).length) {
    return res.status(422).render("index", pageData({ formData: req.body, errors }));
  }
  submissions.push({
    id: Date.now(),
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    topic: req.body.topic,
    message: req.body.message.trim(),
    receivedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
  });
  res.redirect("/?saved=1");
});

app.get("/submissions", (req, res) => res.render("submissions", pageData()));

app.listen(port, () => console.log(`Shubham's feedback desk is running at http://localhost:${port}`));