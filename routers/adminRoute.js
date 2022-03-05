// importing required modules
const express = require("express");
const connection = require("../db/connection");
const bcrypt = require("bcryptjs");
const loginServices = require("../services/loginServices");
const passport = require("passport");
const {
  ensureAuthAdmin,
  unEnsuredAuthAdmin,
} = require("../middlewares/protectedRouteAdmin");
const cloudinary = require("../middlewares/cloudinary");
const upload = require("../middlewares/multer");
const { sendEmail } = require("../middlewares/sendEmail");

//creating adminRoute
const adminRoute = express.Router();

const checkAdmin = (req, res, next) => {
  if (req.user.user_type == "Admin") {
    next();
  } else {
    req.flash("error_msg", "You don't have access to this resources.");
    res.redirect("/auth/login");
  }
};

// GET ROUTER CODE GOES HERE
// home page for admin
var all_users,
  all_products,
  all_orders_list,
  all_blogs_list,
  all_feedback_list,
  all_labtest_list,
  all_medical_request_list,
  all_uploaded_prescription_list;
adminRoute.get("/", ensureAuthAdmin, checkAdmin, async (req, res) => {
  try {
    // for all user
    var sql = "select * from user";
    await connection.query(sql, (err, result, fields) => {
      all_users = result.length;
    });

    var sql1 = "select * from products";
    connection.query(sql1, (err, result, fields) => {
      all_products = result.length;
    });

    var sql2 = "select * from product_order";
    connection.query(sql2, (err, result, fields) => {
      all_orders_list = result.length;
    });

    var sql3 = "select * from blogs";
    connection.query(sql3, (err, result, fields) => {
      all_blogs_list = result.length;
    });

    var sql4 = "select * from feedback";
    connection.query(sql4, (err, result, fields) => {
      all_feedback_list = result.length;
    });

    var sql5 = "select * from labtest";
    connection.query(sql5, (err, result, fields) => {
      all_labtest_list = result.length;
    });
    var sql6 = "select * from medicine_request";
    connection.query(sql6, (err, result, fields) => {
      all_medical_request_list = result.length;
    });

    var sql7 = "select * from prescription_upload";
    connection.query(sql7, (err, result, fields) => {
      all_uploaded_prescription_list = result.length;
    });

    res.render("admin/dashboard", {
      all_users,
      all_products,
      all_orders_list,
      all_blogs_list,
      all_feedback_list,
      all_labtest_list,
      all_medical_request_list,
      all_uploaded_prescription_list,
    });
  } catch (error) {
    console.log(error);
  }
});

// GET Router for admin Login
adminRoute.get("/login", unEnsuredAuthAdmin, (req, res) => {
  res.render("admin/login");
});

// logout router for admin
adminRoute.get("/logout", async (req, res) => {
  req.logout();
  req.flash("success_msg", "Logout successfully.");
  res.redirect("/admin/login");
});

// GET Router for admin profile
adminRoute.get("/profile", ensureAuthAdmin, checkAdmin, (req, res) => {
  res.render("admin/profile");
});

// GET Router for admin all user list
// var user_list;
adminRoute.get("/all-user", ensureAuthAdmin, checkAdmin, async (req, res) => {
  let user_list = [];
  try {
    var sql = "select * from user  order by id DESC";
    await connection.query(sql, (err, result, fields) => {
      user_list = result;
      res.render("admin/userList", {
        user_list,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

// GET Router for admin profile
// var product_list;
adminRoute.get(
  "/all-product",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    let product_list = [];
    try {
      var sql = "select * from products  order by id DESC";
      await connection.query(sql, (err, result, fields) => {
        product_list = result;
        res.render("admin/productList", {
          product_list,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// GET Router for admin add product
adminRoute.get("/add-product", ensureAuthAdmin, checkAdmin, (req, res) => {
  res.render("admin/addProduct");
});

// logout router for admin
adminRoute.get(
  "/update-product/:id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const id = req.params.id;
    try {
      var sql = "select * from products where id =?;";
      await connection.query(sql, [id], (err, result, fields) => {
        res.render("admin/updateProduct", {
          product: result[0],
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// list consultant page
// var consultant_list;
adminRoute.get(
  "/all-consultant",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    let consultant_list = [];
    try {
      var sql = "select * from blogs  order by id DESC";
      await connection.query(sql, (err, result, fields) => {
        consultant_list = result;
        res.render("admin/listConsultant", { consultant_list });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// update consultant page
adminRoute.get(
  "/add-consultant",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    res.render("admin/addConsultant");
  }
);

// update consultant page
adminRoute.get(
  "/update-consultant/:id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const id = req.params.id;
    try {
      var sql = "select * from blogs where id =?;";
      await connection.query(sql, [id], (err, result, fields) => {
        res.render("admin/updateConsultant", {
          consultant: result[0],
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// get all feedback
// var feedback_list;
adminRoute.get(
  "/all-feedback",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    let feedback_list = [];
    try {
      var sql = "select * from feedback  order by id DESC";
      await connection.query(sql, (err, result, fields) => {
        feedback_list = result;
        res.render("admin/listFeedback", { feedback_list });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// GET Router for admin labtest all
// var labtest_list;
adminRoute.get(
  "/all-labtest",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    let labtest_list = [];
    try {
      var sql =
        "select * from labtest inner join user on labtest.user_id = user.id  order by test_id DESC";
      await connection.query(sql, (err, result, fields) => {
        labtest_list = result;
        res.render("admin/listLabTest", {
          labtest_list,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// all orders list GET
// var all_orders;
adminRoute.get("/all-orders", ensureAuthAdmin, checkAdmin, async (req, res) => {
  let all_orders = [];

  try {
    var sql =
      "select * from product_order inner join user on product_order.user_id = user.id  order by order_id DESC";
    await connection.query(sql, (err, result, fields) => {
      all_orders = result;
      res.render("admin/allOrders", {
        all_orders,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

// all medicine request list GET
// var all_medicine_request_list;
adminRoute.get(
  "/all-medicine-request",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    let all_medicine_request_list = [];

    try {
      var sql =
        "select * from medicine_request inner join user on medicine_request.user_id = user.id  order by request_id DESC";
      await connection.query(sql, (err, result, fields) => {
        all_medicine_request_list = result;
        console.log(all_medicine_request_list);
        res.render("admin/allMedicineRequest", {
          all_medicine_request_list,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// all prescription upload list GET
adminRoute.get(
  "/all-prescription",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    let all_prescription_list = [];

    try {
      var sql =
        "select * from prescription_upload inner join user on prescription_upload.user_id = user.id  order by pre_id DESC";
      await connection.query(sql, (err, result, fields) => {
        all_prescription_list = result;
        console.log(all_prescription_list);
        res.render("admin/allPrescriptionUpload", {
          all_prescription_list,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// update consultant page
adminRoute.get(
  "/add-prescription-cart/:pre_id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const pre_id = req.params.pre_id;
    try {
      var sql =
        "select * from prescription_upload inner join user on prescription_upload.user_id = user.id where prescription_upload.pre_id = ? ;";
      await connection.query(sql, [pre_id], (err, result, fields) => {
        console.log(result);
        res.render("admin/prescriptionAddToCart", {
          data: result[0],
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// POST ROUTER CODE GOES HERE
// POSt Router for admin login
adminRoute.post("/login", async (req, res, next) => {
  passport.authenticate("admin-local", {
    successRedirect: "/admin",
    failureRedirect: "/admin/login",
    failureFlash: true,
  })(req, res, next);
  req.flash("success_msg", "Login Successful as Admin.");
});

// Post Router for admin add product
adminRoute.post(
  "/add-product",
  upload.single("productimage"),
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const {
      productname,
      category,
      description,
      price,
      brand,
      uses,
      sideeffects,
      dosages,
      pandw,
      stock,
    } = req.body;
    try {
      const output = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      var sql =
        "insert into products(name, category, description, price, image, brand, uses, sideeffects, dosages, pandw,stock) values (?,?,?,?,?,?,?,?,?,?,?);";
      await connection.query(
        sql,
        [
          productname,
          category,
          description,
          price,
          output.secure_url,
          brand,
          uses,
          sideeffects,
          dosages,
          pandw,
          stock,
        ],
        (err, result, fields) => {
          if (err) throw err;
          req.flash("success_msg", "Product added successfuly.");
          res.redirect("/admin/all-product");
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
);

// delete product
adminRoute.post(
  "/delete-product/:id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      var sql = "delete from products where id =?;";
      await connection.query(sql, [id], (err, result, fields) => {
        if (err) throw err;
        req.flash("success_msg", "Product deleted successfuly.");
        res.redirect("/admin/all-product");
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// update product
adminRoute.post(
  "/update-product/:id",
  upload.single("productimage"),
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { productname, category, description, price, brand, stock } =
      req.body;
    try {
      const output = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      var sql = "select * from products where id = ?;";

      await connection.query(sql, [id], function (err, result, fields) {
        if (err) throw err;

        var sql =
          "update products set name = ?, category = ?, description = ?, price = ?, image = ?, brand = ?, stock =? where id = ? ;";
        var p_id = result[0].id;
        p_image = output.secure_url;
        console.log(p_image);
        connection.query(
          sql,
          [
            productname,
            category,
            description,
            price,
            output.secure_url,
            brand,
            stock,
            p_id,
          ],
          (err, result, fields) => {
            if (err) throw err;

            req.flash("success_msg", "Product updated uccessfully.");
            res.redirect("/admin/all-product");
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// delete user
adminRoute.post(
  "/delete-user/:id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      var sql = "delete from user where id =?;";
      await connection.query(sql, [id], (err, result, fields) => {
        if (err) throw err;
        req.flash("success_msg", "User deleted successfuly.");
        res.redirect("/admin/all-user");
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// Post Router for admin add consultant
adminRoute.post(
  "/add-consultant",
  upload.single("consultantimage"),
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { title, content } = req.body;
    try {
      const output = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
      });
      var sql = "insert into blogs(title, description, image) values (?,?,?);";
      await connection.query(
        sql,
        [title, content, output.secure_url],
        (err, result, fields) => {
          if (err) throw err;
          req.flash("success_msg", "Consultant added successfuly.");
          res.redirect("/admin/all-consultant");
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
);

// delete feedback
adminRoute.post(
  "/delete-feedback/:id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      var sql = "delete from feedback where id =?;";
      await connection.query(sql, [id], (err, result, fields) => {
        if (err) throw err;
        req.flash("success_msg", "Feedback deleted successfuly.");
        res.redirect("/admin/all-feedback");
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// delete consultant
adminRoute.post(
  "/delete-consultant/:id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      var sql = "delete from blogs where id =?;";
      await connection.query(sql, [id], (err, result, fields) => {
        if (err) throw err;
        req.flash("success_msg", "Consultant deleted successfuly.");
        res.redirect("/admin/all-consultant");
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// update user
adminRoute.post(
  "/update-consultant/:id",
  upload.single("consultantimage"),
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
      const output = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
      });
      var sql = "select * from blogs where id = ?;";

      await connection.query(sql, [id], function (err, result, fields) {
        if (err) throw err;

        var sql =
          "update blogs set title = ?, description = ?, image = ? where id = ? ;";
        var u_id = result[0].id;
        connection.query(
          sql,
          [title, content, output.secure_url, u_id],
          (err, result, fields) => {
            if (err) throw err;

            req.flash("success_msg", "Consultant updated uccessfully.");
            res.redirect("/admin/all-consultant");
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// change order status
adminRoute.post(
  "/change-order-status",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { order_id, order_status } = req.body;
    try {
      if (order_status == "0") {
        req.flash("error_msg", "Please select status to update.");
        res.redirect("/admin/all-orders");
      } else {
        var sql = "UPDATE product_order SET status = ? WHERE order_id = ?;";
        connection.query(
          sql,
          [order_status, order_id],
          (err, result, fields) => {
            if (err) throw err;

            req.flash("success_msg", "Order Status Updated Successfully.");
            res.redirect("/admin/all-orders");
          }
        );
      }

      var sql1 =
        "select * from product_order inner join user on product_order.user_id = user.id where product_order.order_id = ?;";
      connection.query(sql1, [order_id], (err, result, fields) => {
        if (err) throw err;

        console.log(result);
        // send email
        sendEmail(
          result[0].email,
          "d-69af7da02295468cbfe634db81266541",
          result[0].fullname,
          `${result[0].order_id} status is changed to ${result[0].status}.`
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// change result status
adminRoute.post(
  "/change-result-status",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { test_id, result_status } = req.body;

    try {
      if (result_status == "0") {
        req.flash("error_msg", "Please select status to update.");
        res.redirect("/admin/all-labtest");
      } else {
        var sql = "UPDATE labtest SET status = ?, result=? WHERE test_id = ?;";
        connection.query(
          sql,
          ["done", result_status, test_id],
          (err, result, fields) => {
            if (err) throw err;
            req.flash("success_msg", "Result Status Updated Successfully.");
            res.redirect("/admin/all-labtest");
          }
        );
      }

      var sql1 =
        "select * from labtest inner join user on labtest.user_id = user.id where labtest.test_id = ?;";
      connection.query(sql1, [test_id], (err, result, fields) => {
        if (err) throw err;

        console.log(result);
        // send email
        sendEmail(
          result[0].email,
          "d-64d5681d31cc4b2d8234e7ae79f6bb12",
          result[0].fullname,
          `${result[0].test_id} status is changed to ${result[0].status} and your result is ${result[0].result}.`
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// change request status
adminRoute.post(
  "/change-request-status",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { request_id, request_status } = req.body;

    try {
      if (request_status == "0") {
        req.flash("error_msg", "Please select status to update.");
        res.redirect("/admin/all-medicine-request");
      } else {
        var sql =
          "UPDATE medicine_request SET status = ? WHERE request_id = ?;";
        connection.query(
          sql,
          [request_status, request_id],
          (err, result, fields) => {
            if (err) throw err;
            req.flash("success_msg", "Request Status Updated Successfully.");
            res.redirect("/admin/all-medicine-request");
          }
        );
      }

      var sql1 =
        "select * from medicine_request inner join user on medicine_request.user_id = user.id where medicine_request.request_id = ?;";
      connection.query(sql1, [request_id], (err, result, fields) => {
        if (err) throw err;

        console.log(result);
        // send email
        sendEmail(
          result[0].email,
          "d-cde08cb6fcda4260932e87d66b78bfac",
          result[0].fullname,
          `${result[0].request_id} and medicine name ${result[0].medicine_name} status is changed to ${result[0].status}.`
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// change prescription status
adminRoute.post(
  "/change-prescription-status",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { pre_id, prescription_status } = req.body;

    try {
      if (prescription_status == "0") {
        req.flash("error_msg", "Please select status to update.");
        res.redirect("/admin/all-prescription");
      } else {
        var sql = "UPDATE prescription_upload SET status = ? WHERE pre_id = ?;";
        connection.query(
          sql,
          [prescription_status, pre_id],
          (err, result, fields) => {
            if (err) throw err;
            req.flash(
              "success_msg",
              "Prescription Status Updated Successfully."
            );
            res.redirect("/admin/all-prescription");
          }
        );
      }

      var sql1 =
        "select * from prescription_upload inner join user on prescription_upload.user_id = user.id where prescription_upload.pre_id = ?;";
      connection.query(sql1, [pre_id], (err, result, fields) => {
        if (err) throw err;

        console.log(result);
        // send email
        sendEmail(
          result[0].email,
          "d-65049301f80d49f4bcf14d9af48f0dba",
          result[0].fullname,
          `${result[0].pre_id} status is changed to ${result[0].status}.`
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// post add prewscription to cart
adminRoute.post(
  "/add-prescription-cart",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const { product_id, user_id } = req.body;

    try {
      var sql = "select * from cart where product_id = ? and user_id = ?";
      await connection.query(
        sql,
        [product_id, user_id],
        async (err, result, fields) => {
          if (result.length == 0) {
            console.log("added");
            var sql =
              "insert into cart(user_id,product_id, quantity) values (?,?,?);";
            await connection.query(
              sql,
              [user_id, product_id, 1],
              (err, result, fields) => {
                if (err) throw err;
                req.flash("success_msg", "Product added to cart successfuly.");
                res.redirect("/admin/all-prescription");
              }
            );
            var sql1 = "select * from user where id = ?;";
            connection.query(sql1, [user_id], (err, result, fields) => {
              if (err) throw err;

              sendEmail(
                result[0].email,
                "d-dfb8c124ffc142258905a843895a7a55",
                result[0].fullname,
                `Your product of product id ${product_id} has been added to cart successfully.`
              );
            });
          } else {
            req.flash("error_msg", "This Product is already in cart.");
            res.redirect("/admin/add-prescription-cart");
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
);
// exporting adminRoute
module.exports = adminRoute;
