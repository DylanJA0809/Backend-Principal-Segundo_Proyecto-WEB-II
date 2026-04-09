const multer = require("multer");

const upload = multer({
  dest: "uploads/images/"
});

module.exports = upload;