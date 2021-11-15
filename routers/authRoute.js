// importing required modules
const express = require("express");
const mysql = require("mysql");
const connection = require("../db/connection");

//creating authRoute
const authRoute = express.Router();

// GET Router for Login Page
authRoute.get("/login", async (req, res) => {
  res.render("auth/login");
});

// POST Router for Login Page
authRoute.post("/login", async (req, res) => {});

// GET Router for Login Page
authRoute.get("/register", async (req, res) => {
  res.render("auth/register");
});

// POST Router for Login Page
authRoute.post("/register", async (req, res) => {
  const fullname = req.body.fullname;
  const email = req.body.email;
  const phonenumber = req.body.phonenumber;
  const address = req.body.address;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;
  
  try {

  } catch (error) {
    console.log(error);
  }
});

// exporting authRoute
module.exports = authRoute;
