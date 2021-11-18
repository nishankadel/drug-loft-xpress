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
            loginServices
              .findUserByEmail(profile.emails[0].value)
              .then(async (user) => {
                if (typeof user != "undefined") {
                  if (user.service_provider == "local") {
                    return done(null, false, {
                      message:
                        "That email is registered using email & password.",
                    });
                  } else {
                    let s_p = "google";
                    var sql =
                      "insert into user(fullname, email, avatar, googleId, service_provider) values (?,?,?,?,?);";
                    connection.query(
                      sql,
                      [
                        profile.displayName,
                        profile.emails[0].value,
                        profile.photos[0].value,
                        profile.id,
                        s_p,
                      ],
                      (err, result, fields) => {
                        if (err) {
                          if (err) throw err;
                        }
                      }
                    );
                    done(null, user);
                  }
                } else {
                  let s_p = "google";
                  var sql =
                    "insert into user(fullname, email, avatar, googleId, service_provider) values (?,?,?,?,?);";
                  connection.query(
                    sql,
                    [
                      profile.displayName,
                      profile.emails[0].value,
                      profile.photos[0].value,
                      profile.id,
                      s_p,
                    ],
                    (err, result, fields) => {
                      if (err) {
                        if (err) throw err;
                      }
                    }
                  );
                  done(null, user);
                }
              });
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

// if (user.service_provider == "local") {
//   return done(null, false, {
//     message: "That email is registered using email & password.",
//   });
// }
