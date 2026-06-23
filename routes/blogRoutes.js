const express = require("express");
const multer = require("multer");
const uploadImage = require("../middlewares/imageUpload");
const { auth, isAdmin } = require("../middlewares/authMiddleware");
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getBlogById);

router.post("/", auth, isAdmin, (req, res) => {
  uploadImage.single("cover_image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image size must be less than 5MB" });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    createBlog(req, res);
  });
});

router.put("/:id", auth, isAdmin, (req, res) => {
  uploadImage.single("cover_image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image size must be less than 5MB" });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    updateBlog(req, res);
  });
});

router.delete("/:id", auth, isAdmin, deleteBlog);

module.exports = router;
