const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {
    owner: "Shubham",
    submitted: false,
    formData: {},
    error: null,
  });
});

app.post("/submit", (req, res) => {
  const { name = "", email = "", message = "" } = req.body;
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).render("index", {
      owner: "Shubham",
      submitted: false,
      formData: req.body,
      error: "Please complete all three fields before sending your note.",
    });
  }

  res.render("index", {
    owner: "Shubham",
    submitted: true,
    formData: { name: name.trim(), email: email.trim(), message: message.trim() },
    error: null,
  });
});

app.listen(port, () => {
  console.log(`Shubham's guestbook is running at http://localhost:${port}`);
});