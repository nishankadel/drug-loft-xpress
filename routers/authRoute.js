// importing required modules
const express = require("express");
const connection = require("../db/connection");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../middlewares/sendEmail");
const { unEnsuredAuth } = require("../middlewares/protectedRoute");

//creating authRoute
const authRoute = express.Router();

// GET ROUTER CODE GOES HERE
// GET Router for Login Page
authRoute.get("/login", unEnsuredAuth, async (req, res) => {
  res.render("auth/login");
});

// GET Router for register Page
authRoute.get("/register", unEnsuredAuth, async (req, res) => {
  res.render("auth/register");
});

// GET Router for email verification Page
authRoute.get("/email-verification", unEnsuredAuth, async (req, res) => {
  res.render("auth/verification");
});

// logout route
authRoute.get("/logout", async (req, res) => {
  req.logout();
  req.flash("success_msg", "Logout successfully.");
  res.redirect("/auth/login");
});

// forgot password router
authRoute.get("/forgot-password", unEnsuredAuth, async (req, res) => {
  res.render("auth/forgotPassword");
});

// reset password router
authRoute.get(
  "/reset-password",
  unEnsuredAuth,
  unEnsuredAuth,
  async (req, res) => {
    res.render("auth/resetPassword");
  }
);

authRoute.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoute.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    successRedirect: "/",
    failureFlash: true,
  })(req, res, next);
  req.flash("success_msg", "Login Successful.");
});

// POST ROUTER CODE GOES HERE
// POST Router for Login Page
authRoute.post("/login", async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
  req.flash("success_msg", "Login Successful.");
});

// generating token randomly
const random = Math.floor(100000 + Math.random() * 900000);
console.log(random);

// POST Router for register Page
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

              // send email
              sendEmail(
                email,
                "d-3a474186823343969983726f982c4dd8",
                fullname,
                random
              );
              // send flash message
              req.flash(
                "success_msg",
                "Verification Code is sent to your email. Please check your inbox."
              );
              res.redirect("/auth/email-verification");
            }
          );
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// Post Router for email verification Page
authRoute.post("/email-verification", async (req, res) => {
  try {
    const { verificationcode } = req.body;

    if (verificationcode == random) {
      req.flash(
        "success_msg",
        "Successfully registered and verified account. Login now."
      );
      res.redirect("/auth/login");
    } else {
      req.flash(
        "error_msg",
        "Verification code doesn't match. Please check your email."
      );
      res.redirect("/auth/email-verification");
    }
  } catch (error) {
    console.log(error);
  }
});

// exporting authRoute
module.exports = authRoute;
