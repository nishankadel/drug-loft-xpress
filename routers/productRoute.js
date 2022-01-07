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
productRoute.get("/single-product/:id",  async (req, res) => {
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

// exporting productRoute
module.exports = productRoute;
