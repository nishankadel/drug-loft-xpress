var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "drug_loft_xpress",
});

connection.connect(function (err) {
  if (err) {
    console.error("Error Connecting My SQL DB.");
    return;
  }
  console.log("My SQL DB is Conected.");
});

module.exports = connection;
