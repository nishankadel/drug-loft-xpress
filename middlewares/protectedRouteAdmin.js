module.exports = {
  ensureAuthAdmin: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "In order to access this page, please login first.");
    res.redirect("/admin/login");
  },

  unEnsuredAuthAdmin: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "In order  to login/register, please logout first.");
    res.redirect("/admin");
  },
};
