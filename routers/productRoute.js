// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");
const connection = require("../db/connection");
const { sendEmail } = require("../middlewares/sendEmail");
const axios = require("axios");
require("dotenv").config();

var Publishable_Key = process.env.STRIPE_PUBLISHABLE_KEY;
var Secret_Key = process.env.STRIPE_SECRET_KEY;
var KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY;
var KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const stripe = require("stripe")(Secret_Key);

//creating productRoute
const productRoute = express.Router();

// routing
var product_list;
productRoute.get("/all-products", async (req, res) => {
  try {
    var sql = "select * from products;";
    await connection.query(sql, (err, result, fields) => {
      if (err) throw err;
      res.render("product/productList", {
        product_list: result,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

var single_product;
let commentDetails;
productRoute.get("/single-product/:id", async (req, res) => {
  const id = req.params.id;
  try {
    var sql = "select * from products where id = ?;";
    await connection.query(sql, [id], (err, result, fields) => {
      single_product = result[0];
    });
    var sql1 =
      "select * from comments inner join user on comments.user_id = user.id where product_id = ?;";
    connection.query(sql1, [id], function (err, result, fields) {
      if (err) throw err;
      commentDetails = result;
      commentDetailsLength = result.length;
    });
    console.log(commentDetails);
    res.render("product/singleProduct", { single_product, commentDetails });
  } catch (error) {
    console.log(error);
  }
});

// search
productRoute.post("/search", async (req, res) => {
  const search_name = req.body.search;
  let product_list = [];
  // var sql = "select * from products where name = ?;";
  await connection.query(
    `select * from products where name like '%${search_name}%' or category like '%${search_name}%' or brand like '%${search_name}%';`,
    (err, result, fields) => {
      if (err) throw err;
      product_list = result;
      res.render("product/productList", { product_list });
    }
  );
  try {
  } catch (error) {
    console.log(error);
  }
});

// ad to cart get method
var cart_items;
productRoute.get("/cart", ensureAuth, async (req, res) => {
  const total_cart_items = [];
  try {
    var sql = "select * from cart where user_id = ?";
    await connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      if (result.length !== 0) {
        var sql =
          "select * from cart inner join products on cart.product_id = products.id";
        connection.query(sql, (err, result, fields) => {
          if (err) throw err;
          cart_items = result;

          cart_items.forEach((element) => {
            if (req.user.id == element.user_id) {
              total_cart_items.push(element);
            }
          });
          console.log(total_cart_items.length);
          res.render("product/cart", {
            total_cart_items,
            key: Publishable_Key,
            pub_key: KHALTI_PUBLIC_KEY,
            name: req.user.name,
          });
        });
      } else {
        res.render("product/cart", {
          total_cart_items,
          key: Publishable_Key,
          pub_key: KHALTI_PUBLIC_KEY,
          name: req.user.name,
        });
        console.log(total_cart_items.length);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// update quantity
productRoute.post("/update-cart", async (req, res) => {
  const { quantityUpdate, cart_id } = req.body;

  try {
    console.log(quantityUpdate);
    console.log(cart_id);
    var sql = "update cart set quantity = ? where cart_id = ? ;";
    connection.query(
      sql,
      [parseInt(quantityUpdate), cart_id],
      (err, result, fields) => {
        if (err) throw err;
        req.flash("success_msg", "Cart Quantity is updated uccessfully.");
        res.redirect("/product/cart");
      }
    );
  } catch (error) {
    console.log(error);
  }
});

// clear cart
productRoute.post("/clear-cart", async (req, res) => {
  try {
    var sql = "DELETE FROM cart WHERE user_id = ?;";
    connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;
      req.flash("success_msg", "Cart cleared uccessfully.");
      res.redirect("/product/cart");
    });
  } catch (error) {
    console.log(error);
  }
});

// ad to cart post method
productRoute.post("/add-to-cart", ensureAuth, async (req, res) => {
  const { product_id } = req.body;

  try {
    var sql = "select * from cart where product_id = ? and user_id = ?";
    await connection.query(
      sql,
      [product_id, req.user.id],
      async (err, result, fields) => {
        if (result.length == 0) {
          console.log("added");
          var sql =
            "insert into cart(user_id,product_id, quantity) values (?,?,?);";
          await connection.query(
            sql,
            [req.user.id, product_id, 1],
            (err, result, fields) => {
              if (err) throw err;
              req.flash("success_msg", "Product added to cart successfuly.");
              res.redirect("/product/cart");
            }
          );
        } else {
          req.flash("error_msg", "This Product is already in cart.");
          res.redirect("/");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

productRoute.post("/delete-cart/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log(id);
    var sql = "delete from cart where cart_id =?;";
    await connection.query(sql, [id], (err, result, fields) => {
      if (err) throw err;
      req.flash("success_msg", "Cart deleted successfuly.");
      res.redirect("/product/cart");
    });
  } catch (error) {
    console.log(error);
  }
});

// favourite get method
var fav_items;
productRoute.get("/favourite", async (req, res) => {
  const total_fav_items = [];
  try {
    var sql = "select * from favourite where user_id = ?";
    await connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      if (result.length !== 0) {
        var sql =
          "select * from favourite inner join products on favourite.product_id = products.id";
        connection.query(sql, (err, result, fields) => {
          if (err) throw err;
          fav_items = result;

          fav_items.forEach((element) => {
            if (req.user.id == element.user_id) {
              total_fav_items.push(element);
            }
          });
          console.log(total_fav_items.length);
          res.render("product/favourite", { total_fav_items });
        });
      } else {
        res.render("product/favourite", { total_fav_items });
        console.log(total_fav_items.length);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// favourite get method
productRoute.post("/add-favourite", ensureAuth, async (req, res) => {
  const { product_id } = req.body;

  try {
    var sql = "select * from favourite where product_id = ? and user_id = ?";
    await connection.query(
      sql,
      [product_id, req.user.id],
      async (err, result, fields) => {
        if (result.length == 0) {
          console.log("added");
          var sql = "insert into favourite(user_id,product_id) values (?,?);";
          await connection.query(
            sql,
            [req.user.id, product_id],
            (err, result, fields) => {
              if (err) throw err;
              req.flash(
                "success_msg",
                "Product added to favourite successfuly."
              );
              res.redirect("/product/favourite");
            }
          );
        } else {
          req.flash("error_msg", "This Product is already in favourite.");
          res.redirect("/");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

// favourite delete method
productRoute.post("/delete-favourite/:id", async (req, res) => {
  const { id } = req.params;
  try {
    console.log(id);
    var sql = "delete from favourite where fav_id =?;";
    await connection.query(sql, [id], (err, result, fields) => {
      if (err) throw err;
      req.flash("success_msg", "Favourite deleted successfuly.");
      res.redirect("/product/favourite");
    });
  } catch (error) {
    console.log(error);
  }
});

// payment get method
productRoute.post("/payment", ensureAuth, async function (req, res) {
  const amount = req.body.amount;
  const ids = req.body.ids;
  const q = req.body.q;
  const p = req.body.p;
  const amt = req.body.amt;
  try {
    var sql = "select * from user where id = ?;";
    await connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      // Moreover you can take more details from user
      // like Address, Name, etc from form
      stripe.customers
        .create({
          email: result[0].email,
          source: req.body.stripeToken,
          name: result[0].fullname,
          address: {
            city: result[0].address,
          },
        })
        .then((customer) => {
          return stripe.charges.create({
            amount: amount, // Charing Rs 25
            description: "Product From DLX",
            currency: "USD",
            customer: customer.id,
            receipt_email: result[0].email,
          });
        })
        .then(async (charge) => {
          console.log(charge);
          let a = `product of names ${p} with quantity ${q} respectively of total price Rs ${amt} /-`;
          sendEmail(
            req.user.email,
            "d-ef7a82a80d4d44948bf54feca369a1d8",
            req.user.fullname,
            a
          );
          var sql2 =
            "insert into product_order(product_id, user_id, total_price, pay_type) values (?,?,?,?);";
          connection.query(
            sql2,
            [ids, req.user.id, amt, "Stripe"],
            (err, result, fields) => {
              if (err) throw err;
            }
          );

          var sql = "DELETE FROM cart WHERE user_id = ?;";
          await connection.query(sql, [req.user.id], (err, result, fields) => {
            if (err) throw err;
          });
          req.flash("success_msg", "Payment Done successfuly.");
          res.redirect("/"); // If no error occurs
        })
        .catch((err) => {
          req.flash("error_msg", "Payment failed due to low balance.");
          res.redirect("/");
          console.log(err);
        });
    });
  } catch (error) {
    console.log(error);
  }
});

productRoute.post("/cash-on-delivery", ensureAuth, async function (req, res) {
  const amount = req.body.amount;
  const ids = req.body.ids;
  const q = req.body.q;
  const p = req.body.p;

  try {
    var sql = "select * from user where id =?;";
    await connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      if (result[0].phonenumber == "" || result[0].address == "") {
        req.flash(
          "error_msg",
          "Update information on your profile to place order."
        );
        res.redirect("/user/edit-profile");
      } else {
        let a = `product of names ${p} with quantity ${q} respectively of total price Rs ${amount} /-`;
        sendEmail(
          req.user.email,
          "d-ef7a82a80d4d44948bf54feca369a1d8",
          req.user.fullname,
          a
        );

        // order save
        var sql2 =
          "insert into product_order(product_id, user_id, total_price, pay_type) values (?,?,?,?);";
        connection.query(
          sql2,
          [ids, req.user.id, amount, "Cash On Delivery"],
          (err, result, fields) => {
            if (err) throw err;
          }
        );

        var sql = "DELETE FROM cart WHERE user_id = ?;";
        connection.query(sql, [req.user.id], (err, result, fields) => {
          if (err) throw err;
        });
        req.flash("success_msg", "Order has been placed successfuly.");
        res.redirect("/");
      }
      // req.flash("success_msg", "Favourite deleted successfuly.");
      // res.redirect("/product/favourite");
    });
  } catch (error) {
    console.log(error);
  }
});

// khalti verify payment
productRoute.post("/verify-payment", ensureAuth, async function (req, res) {
  let payload = req.body.data;
  let { ids, quantity, product_id } = req.body;

  console.log(payload);
  console.log(ids);
  console.log(quantity);
  console.log(product_id);

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
        console.log(response.data);
        let amt = response.data.amount / 100;

        let a = `product of names ${product_id} with quantity ${quantity} respectively of total price Rs ${amt} /-`;
        sendEmail(
          req.user.email,
          "d-ef7a82a80d4d44948bf54feca369a1d8",
          req.user.fullname,
          a
        );

        // order save
        var sql2 =
          "insert into product_order(product_id, user_id, total_price, pay_type) values (?,?,?,?);";
        connection.query(
          sql2,
          [ids, req.user.id, amt, "Khalti"],
          (err, result, fields) => {
            if (err) throw err;
          }
        );

        var sql = "DELETE FROM cart WHERE user_id = ?;";
        connection.query(sql, [req.user.id], (err, result, fields) => {
          if (err) throw err;
        });
        req.flash("success_msg", "Order has been placed successfuly.");
        res.redirect("/");
      })
      .catch((error) => {
        console.log(error);
      });

    // console.log(data);
    // console.log(payload);
  } catch (error) {
    console.log(error);
  }
});

// exporting productRoute
module.exports = productRoute;
