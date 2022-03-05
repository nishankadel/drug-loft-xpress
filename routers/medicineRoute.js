// importing required modules
const express = require("express");
const connection = require("../db/connection");
const { unEnsuredAuth, ensureAuth } = require("../middlewares/protectedRoute");
const cloudinary = require("../middlewares/cloudinary");
const upload = require("../middlewares/multer");
const { sendEmail } = require("../middlewares/sendEmail");

//creating authRoute
const medicineRoute = express.Router();

// request-medicine

medicineRoute.get("/request-medicine", ensureAuth, async (req, res) => {
  let request_medicine_list = [];
  try {
    var sql =
      "select * from medicine_request inner join user on medicine_request.user_id = user.id where medicine_request.user_id = ?  order by request_id DESC";
    connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      request_medicine_list = result;
      res.render("medicine/requestMedicine", { request_medicine_list });
    });
  } catch (error) {
    console.log(error);
  }
});

// request-medicine POST
medicineRoute.post(
  "/request-medicine",
  upload.single("medicineimage"),
  ensureAuth,
  async (req, res) => {
    const { medicinename, medicinemg } = req.body;
    try {
      if (req.user.phonenumber == "" || req.user.address == "") {
        req.flash("error_msg", "Update your credentials.");
        res.redirect("/user/edit-profile");
      } else {
        const output = await cloudinary.uploader.upload(req.file.path, {
          folder: "medicinerequests",
        });
        var sql =
          "insert into medicine_request(user_id, medicine_name, medicine_mg, medicine_image) values (?,?,?,?);";
        await connection.query(
          sql,
          [req.user.id, medicinename, medicinemg, output.secure_url],
          (err, result, fields) => {
            if (err) throw err;

            let a = `named ${medicinename} of ${medicinemg} MG will be reviewed. We will get back to you soon`;
            sendEmail(
              req.user.email,
              "d-abc49d90ed0c499c9e3ce2543befffec",
              req.user.fullname,
              a
            );

            req.flash("success_msg", "Medicine requested successfuly.");
            res.redirect("/medicine/request-medicine");
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// upload - prescription;
medicineRoute.get("/upload-prescription", ensureAuth, async (req, res) => {
  let prescription_list = [];
  try {
    var sql =
      "select * from prescription_upload inner join user on prescription_upload.user_id = user.id where prescription_upload.user_id = ?  order by pre_id DESC";
    connection.query(sql, [req.user.id], (err, result, fields) => {
      if (err) throw err;
      console.log(result);
      prescription_list = result;
      res.render("medicine/uploadPrescription", { prescription_list });
    });
  } catch (error) {
    console.log(error);
  }
});

// upload - prescription; POST
medicineRoute.post(
  "/upload-prescription",
  upload.single("prescriptionimage"),
  ensureAuth,
  async (req, res) => {
    try {
      if (req.user.phonenumber == "" || req.user.address == "") {
        req.flash("error_msg", "Update your credentials.");
        res.redirect("/user/edit-profile");
      } else {
        const output = await cloudinary.uploader.upload(req.file.path, {
          folder: "prescriptionupload",
        });
        var sql =
          "insert into prescription_upload(user_id,pre_image) values (?,?);";
        await connection.query(
          sql,
          [req.user.id, output.secure_url],
          (err, result, fields) => {
            if (err) throw err;

            sendEmail(
              req.user.email,
              "d-2490c7a05a394f36a0936cbfc5c7d704",
              req.user.fullname,
              "Your prescription image has been uploaded successfully. We will get back to you soon."
            );

            req.flash("success_msg", "Prescription uploaded successfuly.");
            res.redirect("/medicine/upload-prescription");
          }
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// exporting authRoute
module.exports = medicineRoute;
