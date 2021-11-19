// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");

//creating productRoute
const productRoute = express.Router();

// routing
productRoute.get("/all-products", ensureAuth, (req, res) => {
  res.send("product page");
});


// exporting productRoute
module.exports = productRoute;
