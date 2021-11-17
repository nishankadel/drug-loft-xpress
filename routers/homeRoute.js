// importing required modules
const express = require("express");
const { ensureAuth, unEnsuredAuth } = require("../middlewares/protectedRoute");

//creating homeRoute
const homeRoute = express.Router();

// routing
homeRoute.get("/", ensureAuth, (req, res) => {
  res.render("index", {
    user: req.user,
  });
});

// exporting homeRoute
module.exports = homeRoute;
