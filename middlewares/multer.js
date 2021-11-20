const multer = require("multer");
const path = require("path");

const imgExt = [".png", ".PNG", ".jpg", ".JPG", ".jpeg", ".JPEG"];

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (imgExt.includes(ext) == false) {
      cb(new Error("File type is not supported."), false);
      return;
    }
    cb(null, true);
  },
});
