const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure images folder
const imageDir = path.join(__dirname, "../uploads/images");
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const uploadImage = multer({ storage, fileFilter, limits: {files: 5 } ,
   fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"));
    }
  },
});

module.exports = uploadImage;






// middleware/multer.js
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "skblog", // Your folder on cloudinary
//     // allowed_formats: ["jpg", "jpeg", "png", "webp"],
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;
