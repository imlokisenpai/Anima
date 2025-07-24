const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "anima123"; // Change this to your secret

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const DATA_FILE = path.join(__dirname, "data", "posts.json");

// Homepage
app.get("/", (req, res) => {
  const posts = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  res.render("index.ejs", { posts });
});

// Admin page
app.get("/admin", (req, res) => {
  const { password } = req.query;
  if (password === ADMIN_PASSWORD) {
    const posts = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    res.render("admin.ejs", { posts, password });
  } else {
    res.send("Unauthorized. Provide correct password as `?password=...` in the URL.");
  }
});

// Handle new post
app.post("/submit", (req, res) => {
  const message = req.body.message.trim();
  if (message.length === 0) return res.redirect("/");

  const posts = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  posts.unshift({ id: Date.now(), message });
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  res.redirect("/");
});

// Delete post (admin only)
app.post("/delete", (req, res) => {
  const { id, password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(403).send("Invalid password");

  let posts = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  posts = posts.filter((p) => p.id != id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
  res.redirect(`/admin?password=${password}`);
});

app.set("view engine", "ejs");
app.listen(PORT, () => console.log(`Anima Quaerens running on ${PORT}`));
