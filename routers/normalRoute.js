// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");

//creating normalRoute
const normalRoute = express.Router();

// routing
normalRoute.get("/", (req, res) => {
  res.render("index");
});

normalRoute.get("/about", ensureAuth, (req, res) => {
  res.send("about page");
});

normalRoute.get("/contactus", ensureAuth, (req, res) => {
  res.send("contact us page");
});

normalRoute.get("/services", ensureAuth, (req, res) => {
  res.send("servicess page");
});

normalRoute.get("/wishlist", ensureAuth, (req, res) => {
  res.send("wishlist page");
});

normalRoute.get("/add-to-cart", ensureAuth, (req, res) => {
  res.send("addtocart page");
});

// exporting normalRoute
module.exports = normalRoute;
