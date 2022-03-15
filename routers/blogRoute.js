// importing required modules
const express = require("express");
const connection = require("../db/connection");

//creating blogRoute
const blogRoute = express.Router();

// routing for list blog
// var blog_list;
blogRoute.get("/", async (req, res) => {
  let blog_list = [];
  try {
    var sql = "select * from blogs  order by id DESC;";
    await connection.query(sql, (err, result, fields) => {
      blog_list = result;
      res.render("blogs/blogList", { blog_list });
    });
  } catch (error) {
    console.log(error);
  }
});

// view blog route
// var single_blog;
blogRoute.get("/view-blog/:id", async (req, res) => {
  let single_blog = [];
  let commentDetails = [];
  const id = req.params.id;
  try {
    var sql = "select * from blogs where id = ?;";
    await connection.query(sql, [id], (err, result, fields) => {
      single_blog = result[0];

      var sql1 =
        "select * from blog_comments inner join user on blog_comments.user_id = user.id where blog_id = ?;";
      connection.query(sql1, [id], function (err, result, fields) {
        if (err) throw err;
        commentDetails = result;
        commentDetailsLength = result.length;

        res.render("blogs/viewBlog", { single_blog, commentDetails });
      });
    });
  } catch (error) {
    console.log(error);
  }
});

// exporting blogRoute
module.exports = blogRoute;
