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
var all_users, all_products, all_orders;
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

    // var sql2 = "select * from product_order";
    // connection.query(sql2, (err, result, fields) => {
    //   all_orders = result.length;
    // });

    res.render("admin/dashboard", {
      all_users,
      all_products,
      // all_orders,
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
var user_list;
adminRoute.get("/all-user", ensureAuthAdmin, checkAdmin, async (req, res) => {
  try {
    var sql = "select * from user";
    await connection.query(sql, (err, result, fields) => {
      user_list = result;
    });
    await res.render("admin/userList", {
      user_list,
    });
  } catch (error) {
    console.log(error);
  }
});

// GET Router for admin profile
var product_list;
adminRoute.get(
  "/all-product",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    try {
      var sql = "select * from products";
      await connection.query(sql, (err, result, fields) => {
        product_list = result;
      });

      await res.render("admin/productList", {
        product_list,
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

// logout router for admin
adminRoute.get(
  "/update-user/:id",
  ensureAuthAdmin,
  checkAdmin,
  async (req, res) => {
    const id = req.params.id;
    try {
      var sql = "select * from user where id =?;";
      await connection.query(sql, [id], (err, result, fields) => {
        res.render("admin/updateUser", {
          users: result[0],
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
  async (req, res) => {
    const { productname, category, description, price, brand } = req.body;
    try {
      const output = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      var sql =
        "insert into products(name, category, description, price, image, brand) values (?,?,?,?,?,?);";
      await connection.query(
        sql,
        [productname, category, description, price, output.secure_url, brand],
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
adminRoute.post("/delete-product/:id", async (req, res) => {
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
});

// update product
adminRoute.post(
  "/update-product/:id",
  upload.single("productimage"),
  async (req, res) => {
    const { id } = req.params;
    const { productname, category, description, price, brand } = req.body;
    try {
      const output = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      var sql = "select * from products where id = ?;";

      await connection.query(sql, [id], function (err, result, fields) {
        if (err) throw err;

        var sql =
          "update products set name = ?, category = ?, description = ?, price = ?, image = ?, brand = ? where id = ? ;";
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
adminRoute.post("/delete-user/:id", async (req, res) => {
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
});

// update user
adminRoute.post(
  "/update-user/:id",
  upload.single("userimage"),
  async (req, res) => {
    const { id } = req.params;
    const { fullname, email, phonenumber, address, usertype } = req.body;
    try {
      const output = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
      });
      var sql = "select * from user where id = ?;";

      await connection.query(sql, [id], function (err, result, fields) {
        if (err) throw err;

        var sql =
          "update user set fullname = ?, email = ?, phonenumber = ?, address = ?, avatar = ?, user_type = ? where id = ? ;";
        var u_id = result[0].id;
        connection.query(
          sql,
          [
            fullname,
            email,
            phonenumber,
            address,
            output.secure_url,
            usertype,
            u_id,
          ],
          (err, result, fields) => {
            if (err) throw err;

            req.flash("success_msg", "User updated uccessfully.");
            res.redirect("/admin/all-user");
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// exporting adminRoute
module.exports = adminRoute;
