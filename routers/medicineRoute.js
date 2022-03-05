// importing required modules
const express = require("express");
const connection = require("../db/connection");
const { sendEmail } = require("../middlewares/sendEmail");
const { unEnsuredAuth, ensureAuth } = require("../middlewares/protectedRoute");

//creating authRoute
const medicineRoute = express.Router();

// request-medicine
medicineRoute.get("/request-medicine", ensureAuth, async (req, res) => {
  res.render("medicine/requestMedicine");
}); // request-medicine POST
medicineRoute.post("/request-medicine", ensureAuth, async (req, res) => {
  res.render("medicine/requestMedicine");
});

// upload - prescription;
medicineRoute.get("/upload-prescription", ensureAuth, async (req, res) => {
  res.render("medicine/uploadPrescription");
});
// upload - prescription; POST
medicineRoute.post("/upload-prescription", ensureAuth, async (req, res) => {
  res.render("medicine/uploadPrescription");
});

// exporting authRoute
module.exports = medicineRoute;
