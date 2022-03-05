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

userRoute.post("/edit-profile", ensureAuth, async (req, res) => {
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
});

// get order list
userRoute.get("/order-list", ensureAuth, async (req, res) => {
  try {
    let order_list = [];
    var sql =
      "select * from product_order inner join user on product_order.user_id = user.id where product_order.user_id = ?  order by order_id DESC;";
    // var sql = "select * from product_order where user_id = ?;";
    await connection.query(sql, [req.user.id], function (err, result, fields) {
      if (err) throw err;
      order_list = result;
      console.log(result);

      res.render("user/orderList", { order_list });
    });
  } catch (error) {
    console.log(error);
  }
});

// get order list
userRoute.get("/order-details/:order_id", ensureAuth, async (req, res) => {
  const { order_id } = req.params;
  console.log(order_id);
  try {
    let order_list = [];
    // var sql =
    //   "select * from product_order inner join user on product_order.user_id = user.id where product_order.order_id = ?";
    var sql =
      "select * from product_order where order_id = ?  order by order_id DESC;";
    await connection.query(sql, [order_id], function (err, result, fields) {
      if (err) throw err;
      const strings = result[0].product_id;

      const usingSplit = strings.split(",").map(Number);

      order_list = result;
      order_list.push(usingSplit);
      console.log(order_list);
      console.log(order_list[1]);
      let looping = order_list[1];
      let name = req.user.fullname;
      let email = req.user.email;
      let id = req.user.id;
      console.log(id);

      res.render("user/orderDetails", { order_list, looping, name, email });
    });
    // res.render("user/orderDetails");
  } catch (error) {
    console.log(error);
  }
});

// exporting userRoute
module.exports = userRoute;
