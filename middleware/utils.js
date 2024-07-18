const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname == "user_image") {
        cb(null, "./uploads/profile/");
      }
      else if (file.fieldname == "user_photos") {
        // console.log("photos")
        cb(null, "./uploads/user_photos/");
      }
     else if (file.fieldname == "cover_image") {
        cb(null, "./uploads/cover_image/");
      }
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
  });

  module.exports = {upload};