// import required moudles
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const loginServices = require("../services/loginServices");
const connection = require("../db/connection");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:
          "955386353525-7b3r7t60o5oslnbjcp6hff56osq428q5.apps.googleusercontent.com",
        clientSecret: "nC29JVjlx4Dcc5jH4wuGKFIk",
        callbackURL: "http://localhost:8000/auth/google/callback",
        passReqToCallback: true,
      },
      async function (request, accessToken, refreshToken, profile, done) {
        //get the user data from google
        loginServices.findUserByGoogleId(profile.id).then(async (user) => {
          if (user) {
            done(null, user);
          } else {
            var sql =
              "insert into user(fullname, email, avatar, googleId) values (?,?,?,?);";
            connection.query(
              sql,
              [
                profile.displayName,
                profile.emails[0].value,
                profile.photos[0].value,
                profile.id,
              ],
              (err, result, fields) => {
                if (err) throw err;
              }
            );
            done(null, user);
          }
        });
      }
    )
  );

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
};
