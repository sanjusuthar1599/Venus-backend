const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    form_type: {
      type: String,
      enum: ["contact", "project_planner"],
      required: true,
    },
    name: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    project_type: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["new", "read"],
      default: "new",
    },
    read_at: { type: Date, default: null },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
