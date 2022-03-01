// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");
const connection = require("../db/connection");

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
productRoute.get("/single-product/:id", async (req, res) => {
  const id = req.params.id;
  try {
    var sql = "select * from products where id = ?;";
    await connection.query(sql, [id], (err, result, fields) => {
      single_product = result[0];
    });
    res.render("product/singleProduct", { single_product });
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
          res.render("product/cart", { total_cart_items });
        });
      } else {
        res.render("product/cart", { total_cart_items });
        console.log(total_cart_items.length);
      }
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
          var sql = "insert into cart(user_id,product_id) values (?,?);";
          await connection.query(
            sql,
            [req.user.id, product_id],
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
productRoute.get("/payment", async (req, res) => {
  try {
    res.render("product/payment");
  } catch (error) {
    console.log(error);
  }
});

// exporting productRoute
module.exports = productRoute;
