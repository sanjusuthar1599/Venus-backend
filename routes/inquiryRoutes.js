const express = require("express");
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", createInquiry);
router.get("/", auth, isAdmin, getInquiries);
router.patch("/:id/status", auth, isAdmin, updateInquiryStatus);
router.delete("/:id", auth, isAdmin, deleteInquiry);

module.exports = router;
