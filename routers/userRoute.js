// importing required modules
const express = require("express");
const { ensureAuth } = require("../middlewares/protectedRoute");
const connection = require("../db/connection");

//creating userRoute
const userRoute = express.Router();

// routing
userRoute.get("/profile", ensureAuth, (req, res) => {
  res.render("user/profile");
});

userRoute.get("/edit-profile", ensureAuth, (req, res) => {
  res.render("user/editProfile");
});

userRoute.post(
  "/edit-profile",
  ensureAuth,
  async (req, res) => {
    if (req.user.service_provider == "local") {
      // get data from form fields
      const fullname = req.body.fullname;
      const email = req.body.email;
      const phonenumber = req.body.phonenumber;
      const address = req.body.address;
      try {
        let errors = [];

        const phoneRegex = new RegExp(/98[0-9]{8}$/);

        if (fullname.length < 3) {
          errors.push({ msg: "Name requires atleast 3 characters." });
        }

        if (phonenumber.length < 10) {
          errors.push({ msg: "Phone number must be of 10 digits." });
        }

        if (phoneRegex.test(phonenumber) == false) {
          errors.push({
            msg: "Phone number is invalid or not correct.",
          });
        }

        if (errors.length > 0) {
          res.render("user/editProfile", {
            errors,
          });
        } else {
          var sql = "select * from user where email = ?;";

          connection.query(sql, [email], function (err, result, fields) {
            if (err) throw err;

            var sql =
              "update user set fullname = ?, email = ?, phonenumber = ?, address = ? where id = ? ;";
            var id = result[0].id;
            connection.query(
              sql,
              [fullname, email, phonenumber, address, id],
              (err, result, fields) => {
                if (err) throw err;

                req.flash("success_msg", "Profile updated uccessfully.");
                res.redirect("/user/profile");
              }
            );
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (req.user.service_provider == "google") {
      // get data from form fields
      const phonenumber = req.body.phonenumber;
      const address = req.body.address;
      const email = req.body.email;

      try {
        let errors = [];

        const phoneRegex = new RegExp(/98[0-9]{8}$/);

        if (phonenumber.length < 10) {
          errors.push({ msg: "Phone number must be of 10 digits." });
        }

        if (phoneRegex.test(phonenumber) == false) {
          errors.push({
            msg: "Phone number is invalid or not correct.",
          });
        }

        if (errors.length > 0) {
          res.render("user/editProfile", {
            errors,
          });
        } else {
          var sql = "select * from user where email = ?;";

          connection.query(sql, [email], function (err, result, fields) {
            if (err) throw err;

            var sql =
              "update user set address = ?, phonenumber = ? where id = ? ;";
            var id = result[0].id;
            connection.query(
              sql,
              [address, phonenumber, id],
              (err, result, fields) => {
                if (err) throw err;

                req.flash("success_msg", "Profile updated uccessfully.");
                res.redirect("/user/profile");
              }
            );
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
);

// exporting userRoute
module.exports = userRoute;
