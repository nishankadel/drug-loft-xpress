const bcrypt = require("bcryptjs");
const connection = require("../db/connection");

let handleLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    //check email is exist or not
    let user = await findUserByEmail(email);
    if (user) {
      //compare password
      await bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          resolve(true);
        } else {
          reject(`The password that you've entered is incorrect`);
        }
      });
    } else {
      reject(`This user email "${email}" doesn't exist`);
    }
  });
};

let findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    try {
      connection.query(
        " SELECT * FROM user WHERE email = ? ",
        email,
        function (err, rows) {
          if (err) {
            reject(err);
          }
          let user = rows[0];
          resolve(user);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

let findUserByGoogleId = (email) => {
  return new Promise((resolve, reject) => {
    try {
      connection.query(
        " SELECT * FROM user WHERE googleId = ? ",
        email,
        function (err, rows) {
          if (err) {
            reject(err);
          }
          let user = rows[0];
          resolve(user);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

let findUserById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      connection.query(
        " SELECT * FROM user WHERE id = ?  ",
        id,
        function (err, rows) {
          if (err) {
            reject(err);
          }
          let user = rows[0];
          resolve(user);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

let comparePassword = async (password, userObject) => {
  bcrypt.compare(password, userObject, (err, isMatch) => {
    if (err) throw err;

    return isMatch;
  });
};

module.exports = {
  handleLogin: handleLogin,
  findUserByEmail: findUserByEmail,
  findUserById: findUserById,
  findUserByGoogleId: findUserByGoogleId,
  comparePassword: comparePassword,
};
