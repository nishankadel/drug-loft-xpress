// import required moudles
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const loginServices = require("../services/loginServices");
const bcrypt = require("bcryptjs");

module.exports = function (passport) {
  passport.use(
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
