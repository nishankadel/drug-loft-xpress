// import required moudles
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const loginServices = require("../services/loginServices");
const bcrypt = require("bcryptjs");

module.exports = function (passport) {
  passport.use("admin-local",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      (email, password, done) => {
        loginServices.findUserByEmail(email).then(async (user) => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered.",
            });
          }
          if (user) {
            if (user.user_type == "Admin") {
              bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                  return done(null, user);
                } else {
                  return done(null, false, {
                    message: "Email or Password incorrect.",
                  });
                }
              });
            }
            else{
              return done(null, false, {
                message: "You are not authorized to access this resources.",
              });
            }
          }
        });
      }
    )
  );
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  loginServices
    .findUserById(id)
    .then((user) => {
      return done(null, user);
    })
    .catch((error) => {
      return done(error, null);
    });
});
