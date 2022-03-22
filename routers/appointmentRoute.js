// importing required modules
const express = require("express");
const { ensureAuth } = require("../middlewares/protectedRoute");
const connection = require("../db/connection");
require("dotenv").config();
const axios = require("axios");

//creating appointmentRoute
const appointmentRoute = express.Router();

var KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY;
var KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

// get all specialities
appointmentRoute.get("/", ensureAuth, async (req, res) => {
  let specialities_list = [];
  try {
    var sql = "select * from specialist order by spec_id DESC";
    await connection.query(sql, (err, result, fields) => {
      specialities_list = result;
      res.render("appointment/specialist", { specialities_list });
    });
  } catch (error) {
    console.log(error);
  }
});

// get single specialities
appointmentRoute.get(
  "/single-specialist/:spec_id",
  ensureAuth,
  async (req, res) => {
    const { spec_id } = req.params;
    let specialities_list = [];
    let days_list = [];
    try {
      var sql =
        "select * from doctors join specialist on doctors.spec_id = specialist.spec_id where doctors.spec_id = ?";

      await connection.query(sql, [spec_id], (err, result, fields) => {
        specialities_list = result;
        specialities_list.forEach((element) => {
          days_list.push(element.days);
        });

        const unique = (value, index, self) => {
          return self.indexOf(value) === index;
        };

        const uniqueDays = days_list.filter(unique);

        res.render("appointment/singleSpecialist", {
          specialities_list,
          uniqueDays,
          pub_key: KHALTI_PUBLIC_KEY,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// khalti verify payment
appointmentRoute.post("/verify-payment", ensureAuth, async function (req, res) {
  let payload = req.body.data;
  let { app_date, app_specialist } = req.body;

  try {
    let data = {
      token: payload.token,
      amount: payload.amount,
    };

    let config = {
      headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` },
    };
    let url = "https://khalti.com/api/v2/payment/verify/";
    axios
      .post(url, data, config)
      .then((response) => {
        let amt = response.data.amount / 100;

        let a = `Your appointment of ${app_specialist} on ${app_date} is booked successfully. Payment of total price Rs ${amt} /- is done.`;
        sendEmail(
          req.user.email,
          "d-14d011c5933e437ebaa1025e2acb24da",
          req.user.fullname,
          a
        );

        // order save
        var sql2 =
          "insert into appointment_book(user_id, app_price, app_date, app_specialist) values (?,?,?,?);";
        connection.query(
          sql2,
          [req.user.id, amt, app_date, app_specialist],
          (err, result, fields) => {
            if (err) throw err;
          }
        );
        req.flash("success_msg", "Appoinment has been booked successfuly.");
        res.redirect("/");
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
});

// exporting appointmentRoute
module.exports = appointmentRoute;
