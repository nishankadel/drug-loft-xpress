// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");
const connection = require("../db/connection");
const { sendEmail } = require("../middlewares/sendEmail");

//creating normalRoute
const normalRoute = express.Router();

// routing
// var new_medicines;
// var new_articles;
normalRoute.get("/", async (req, res) => {
  let new_medicines = [];
  let new_articles = [];
  try {
    var sql = "select * from products order by id DESC limit 8 ;";
    await connection.query(sql, (err, result, fields) => {
      if (err) throw err;

      // new article
      var sql = "select * from blogs order by id  DESC limit 4;";
      connection.query(sql, (err, result, fields) => {
        new_articles = result;
      });
      res.render("index", {
        new_medicines: result,
        new_articles: result,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

normalRoute.get("/about", (req, res) => {
  res.render("about");
});

normalRoute.get("/contact", ensureAuth, (req, res) => {
  res.render("contact");
});

normalRoute.post("/contact", ensureAuth, async (req, res) => {
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

// exporting normalRoute
module.exports = normalRoute;
