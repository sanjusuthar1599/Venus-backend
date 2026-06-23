const express = require("express");
const { getReviews, syncReviews } = require("../controllers/reviewController");
const { auth, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getReviews);
router.post("/sync", auth, isAdmin, syncReviews);

module.exports = router;
