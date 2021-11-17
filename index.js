// Importing required modules
const express = require("express");
require("./db/connection");
const path = require("path");
require("dotenv").config();
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

// creating express app
const app = express();

// port and host
const port = process.env.PORT;

// file paths
const staticPath = path.join(__dirname, "assets");
const viewsPath = path.join(__dirname, "views");

// use static files
app.use(express.static(staticPath));

// use express parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express session middleware
app.use(
  session({
    secret: "Thereisnosecretwithme",
    resave: true,
    saveUninitialized: true,
  })
);

// connecting flash
app.use(flash());

// global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// passport middleware
app.use(passport.initialize());
app.use(passport.session());
require("./middlewares/passportLocal")(passport);

// using other middlewarres
app.use(morgan("tiny"));

// setting up router
app.use("/", require("./routers/homeRoute"));
app.use("/auth", require("./routers/authRoute"));

// setting up view engine
app.set("view engine", "ejs");

// setting up views path
app.set("views", viewsPath);

// running server
app.listen(port, () => console.log(`Server running at ${port}`));
