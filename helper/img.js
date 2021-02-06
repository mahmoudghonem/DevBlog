const multer = require("multer");

const MIME_TYPE_MAPS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAPS[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "public/uploads");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(".").join("-");
    const extension = MIME_TYPE_MAPS[file.mimetype];
    cb(null, file.fieldname + '-' + Date.now().toString().replace(/:/g, '-') + name);

  },
});

module.exports = multer({ storage: storage }).single("image");