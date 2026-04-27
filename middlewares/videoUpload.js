const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure videos folder
const videoDir = path.join(__dirname, "../uploads/videos");
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "video/mp4",
    "video/mkv",
    "video/avi",
    "video/webm"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files allowed"), false);
  }
};

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB
  }
});

module.exports = uploadVideo;
