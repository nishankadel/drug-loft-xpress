// importing required modules
const express = require("express");

//creating homeRoute
const homeRoute = express.Router();

// routing
homeRoute.get("/", async (req, res) => {
  res.render("index");
});

// exporting homeRoute
module.exports = homeRoute;
