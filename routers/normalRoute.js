// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");
const connection = require("../db/connection");
const { sendEmail } = require("../middlewares/sendEmail");

//creating normalRoute
const normalRoute = express.Router();

// routing
normalRoute.get("/", (req, res) => {
  res.render("index");
});

normalRoute.get("/about", (req, res) => {
  res.render("about");
});

normalRoute.get("/contact", ensureAuth, (req, res) => {
  res.render("contact");
});

normalRoute.post("/contact", async (req, res) => {
  const message = req.body.message;
  try {
    var sql = "insert into feedback(name, email, message) values (?,?,?);";
    await connection.query(
      sql,
      [req.user.fullname, req.user.email, message],
      (err, result, fields) => {
        if (err) throw err;
        sendEmail(
          req.user.email,
          "d-c65754fe09704baaabd4d6aacdb436ce",
          req.user.fullname,
          ""
        );
        req.flash("success_msg", "Feedback given successfuly.");
        res.redirect("/contact");
      }
    );
  } catch (error) {
    console.log(error);
  }
});

normalRoute.get("/wishlist", ensureAuth, (req, res) => {
  res.send("wishlist page");
});

normalRoute.get("/add-to-cart", ensureAuth, (req, res) => {
  res.send("addtocart page");
});

// exporting normalRoute
module.exports = normalRoute;
