const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    author_name: { type: String, required: true, trim: true },
    author_role: { type: String, default: "Google Review", trim: true },
    text: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    author_photo: { type: String, default: null },
    source: { type: String, default: "google", trim: true },
    google_review_id: { type: String, default: null },
    published_at: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ rating: -1, published_at: -1 });
reviewSchema.index({ google_review_id: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", reviewSchema);
