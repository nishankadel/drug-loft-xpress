// Importing required modules
const express = require("express");
require("./db/connection");
const path = require("path");
require("dotenv").config();
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cookieParser = require("cookie-parser");

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
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

// Express session middleware
app.use(
  session({
    secret: "Thereisnosecretwithme",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
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
require("./middlewares/passportLocalAdmin")(passport);
require("./middlewares/passportGoogle")(passport);

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  res.locals.authenticated = req.isAuthenticated;
  next();
});

// using other middlewares
app.use(morgan("tiny"));

// setting up router
app.use("/", require("./routers/normalRoute"));
app.use("/auth", require("./routers/authRoute"));
app.use("/user", require("./routers/userRoute"));
app.use("/product", require("./routers/productRoute"));
app.use("/admin", require("./routers/adminRoute"));
app.use("/blogs", require("./routers/blogRoute"));
app.use("/comments", require("./routers/commentRoute"));
app.use("/labtest", require("./routers/labtestRoute"));

// setting up view engine
app.set("view engine", "ejs");

// setting up views path
app.set("views", viewsPath);

app.get("*", function (req, res) {
  res.status(404).render("error/404Error");
});

// running server
app.listen(port, () => console.log(`Server running at ${port}`));
