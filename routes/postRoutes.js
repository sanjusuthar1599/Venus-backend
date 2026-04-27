const express = require("express");
const router = express.Router();
const uploadImage = require("../middlewares/imageUpload");
const {
  imagecreateProject,
  videocreateProject,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  appendProjectImages,
  removeProjectImages,
  replaceProjectVideo,
} = require("../controllers/postController");
const uploadVideo = require("../middlewares/videoUpload");
const multer = require("multer");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", getPosts);
router.get("/project/:id", getPostById);

router.post("/image/project", auth, isAdmin, (req, res) => {
  uploadImage.array("project_image", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Image size must be less than 5MB" });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    imagecreateProject(req, res);
  });
});

router.post("/video/project", auth, isAdmin, (req, res) => {
  uploadVideo.single("project_video")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    videocreateProject(req, res);
  });
});

router.put("/project/:id", auth, isAdmin, updatePost);

router.post("/project/:id/images", auth, isAdmin, (req, res) => {
  uploadImage.array("project_image", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Maximum 5 images per upload" });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ message: "Image size must be less than 5MB" });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    appendProjectImages(req, res);
  });
});

router.patch("/project/:id/images", auth, isAdmin, removeProjectImages);

router.put("/project/:id/video", auth, isAdmin, (req, res) => {
  uploadVideo.single("project_video")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    replaceProjectVideo(req, res);
  });
});

router.delete("/project/:id", auth, isAdmin, deletePost);

module.exports = router;
