require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(process.env.SECRET_KEY);

// design file
app.use(express.static("public"));
app.set("view engine", "ejs");

// session
app.use(
  session({
    secret: "my little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// database connection
mongoose.connect("mongodb://localhost:27017/users").then(() => {
  console.log("connected successfully");
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

app.get("/secret", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secret");
  } else {
    res.redirect("/login");
  }
});
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (!err) {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secret");
        });
      } else {
        console.log(err);
        res.redirect("/register");
      }
    }
  );
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      throw err;
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secret");
      });
    }
  });
});

// server listening
app.listen(PORT, () => {
  console.log(`The app start on http://localhost:${PORT}`);
});
