const multer = require("multer");
const path = require('path')

const imageFilter = function (req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null, 'uploads/');

  },
  filename: (req, file, cb) => {
    //  let name=path.extname(file.originalname);
    //  cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
     cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname);
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

module.exports = multer({ storage: storage, fileFilter: imageFilter }).single("image");