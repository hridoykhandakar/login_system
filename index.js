require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const md5 = require("md5");
const PORT = process.env.PORT || 3000;

console.log(md5("hridoy.com"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(process.env.SECRET_KEY);

// design file
app.use(express.static("public"));
app.set("view engine", "ejs");

// database connection
mongoose.connect("mongodb://localhost:27017/users").then(() => {
  console.log("connected successfully");
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// routers
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.email,
    password: md5(req.body.password),
  });
  newUser.save((err) => {
    if (err) {
      console.log(err);
    } else {
      res.render("secrect");
    }
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = md5(req.body.password);

  User.findOne({ email: email }, (err, founduser) => {
    if (err) {
      console.log(err);
    } else {
      if (founduser.password === password) {
        res.render("secrect");
      }
    }
  });
});

// server listening
app.listen(PORT, () => {
  console.log(`The app start on http://localhost:${PORT}`);
});
