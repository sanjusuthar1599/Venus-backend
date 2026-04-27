const mongoose = require("mongoose");

const PROJECT_TYPES = ["Residential", "Commercial", "Hospitality"];

const postSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: true,
      trim: true,
    },
    project_location: {
      type: String,
      required: true,
      trim: true,
    },
    project_type: {
      type: String,
      required: true,
      enum: PROJECT_TYPES,
      default: "Residential",
    },
    project_images: {
      type: [String],
      default: [],
    },
    project_video: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
module.exports.PROJECT_TYPES = PROJECT_TYPES;
