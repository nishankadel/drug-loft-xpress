// importing required modules
const express = require("express");
const connection = require("../db/connection");

//creating blogRoute
const commentRoute = express.Router();


// exporting blogRoute
module.exports = commentRoute;
