// importing required modules
const express = require("express");
const connection = require("../db/connection");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");
const { sendEmail } = require("../middlewares/sendEmail");

//creating labtestRoute
const labtestRoute = express.Router();

labtestRoute.get("/", ensureAuth, async (req, res) => {
  try {
    var sql = "select * from labtest where user_id = ?  order by test_id DESC;";
    connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;

      res.render("labtest/labtest", { test_list: result });
    });
  } catch (error) {
    console.log(error);
  }
});

labtestRoute.post("/", ensureAuth, async (req, res) => {
  const { labtest_type, datetime } = req.body;

  try {
    if (labtest_type == "0" || datetime == "") {
      req.flash("error_msg", "Empty values are not accepted.");
      res.redirect("/labtest");
    } else {
      var sql = "select * from labtest where duration = ?;";
      connection.query(sql, [datetime], (err, result, fields) => {
        if (err) throw err;

        if (result.length > 0) {
          req.flash(
            "error_msg",
            "This Date and Time is already reserved. Please pick another."
          );
          res.redirect("/labtest");
        } else {
          var sql =
            "insert into labtest(labtest_type,duration, user_id) values (?,?,?);";
          connection.query(
            sql,
            [labtest_type, datetime, req.user.id],
            (err, result, fields) => {
              if (err) throw err;

              sendEmail(
                req.user.email,
                "d-619e4c37f0c04e37bf5ea0619dedccb5",
                req.user.fullname,
                new Date()
              );
              req.flash("success_msg", "Lab Test Booked Successfully.");
              res.redirect("/labtest");
            }
          );
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// exporting labtestRoute
module.exports = labtestRoute;
