module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "To visit home page, please login first.");
    res.redirect("/auth/login");
  },

  unEnsuredAuth: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "In order  to login/register, please logout first.");
    res.redirect("/");
  },
};
