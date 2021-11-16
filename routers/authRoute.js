// importing required modules
const express = require("express");
const connection = require("../db/connection");

const bcrypt = require("bcryptjs");

//creating authRoute
const authRoute = express.Router();

// GET Router for Login Page
authRoute.get("/login", async (req, res) => {
  res.render("auth/login");
});

// POST Router for Login Page
authRoute.post("/login", async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
  }
});

// GET Router for Login Page
authRoute.get("/register", async (req, res) => {
  res.render("auth/register");
});

// POST Router for Login Page
authRoute.post("/register", async (req, res) => {
  // get data from form fields
  const fullname = req.body.fullname;
  const email = req.body.email;
  const phonenumber = req.body.phonenumber;
  const address = req.body.address;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;

  try {
    let errors = [];
    const passwordRegeex = new RegExp(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    );
    const phoneRegex = new RegExp(/98[0-9]{8}$/);

    if (fullname.length < 3) {
      errors.push({ msg: "Name requires atleast 3 characters." });
    }

    // check if passwords matched
    if (password !== confirmpassword) {
      errors.push({ msg: "Passwords did not match." });
    }
    //   check length of password
    if (password.length < 8) {
      errors.push({ msg: "Password requires atleast 8 characters." });
    }

    if (passwordRegeex.test(password) == false) {
      errors.push({
        msg: "Password requires one uppercase, one lowercase and one special character.",
      });
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
      res.render("auth/register", {
        errors,
        fullname,
        email,
        phonenumber,
        address,
        password,
        confirmpassword,
      });
    } else {
      var sql = "select * from user where email = ?;";

      connection.query(sql, [email], function (err, result, fields) {
        if (err) throw err;

        if (result.length > 0) {
          req.flash(
            "error_msg",
            "This email is already registered. Please use new one."
          );
          res.redirect("/auth/register");
          //res.send("Email already used");
        } else {
          const hashPassword = bcrypt.hashSync(password, 12);
          var sql =
            "insert into user(fullname, email, phonenumber, address,password) values (?,?,?,?,?);";

          connection.query(
            sql,
            [fullname, email, phonenumber, address, hashPassword],
            (err, result, fields) => {
              if (err) throw err;
              req.flash(
                "success_msg",
                "Successfully registered your account, you can login now."
              );
              res.redirect("/auth/login");
            }
          );
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// exporting authRoute
module.exports = authRoute;
