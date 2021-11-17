// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");

//creating normalRoute
const normalRoute = express.Router();

// routing
normalRoute.get("/", (req, res) => {
  res.render("index");
});

normalRoute.get("/product", ensureAuth, (req, res) => {
  res.send("product page");
});

// exporting normalRoute
module.exports = normalRoute;
