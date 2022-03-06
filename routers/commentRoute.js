// importing required modules
const express = require("express");
const connection = require("../db/connection");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");

//creating blogRoute
const commentRoute = express.Router();

commentRoute.post("/add-comment", ensureAuth, async (req, res) => {
  const { p_id, message } = req.body;
  try {
    var sql =
      "insert into comments(user_id, product_id, comment) values (?,?,?);";
    connection.query(
      sql,
      [req.user.id, p_id, message],
      (err, result, fields) => {
        if (err) throw err;
        req.flash("success_msg", "Comment done sucessfully.");
        res.redirect("/product/single-product/" + p_id);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

// exporting blogRoute
module.exports = commentRoute;
