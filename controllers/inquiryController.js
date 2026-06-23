const Inquiry = require("../models/Inquiry");

function mapInquiry(doc) {
  return {
    id: doc._id,
    form_type: doc.form_type,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    project_type: doc.project_type,
    message: doc.message,
    meta: doc.meta || {},
    status: doc.status,
    read_at: doc.read_at,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function validateInquiry(body) {
  const form_type = String(body.form_type || "").trim();
  if (!["contact", "project_planner"].includes(form_type)) {
    return { error: "Invalid form type." };
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const project_type = String(body.project_type || "").trim();
  const message = String(body.message || "").trim();
  const meta = body.meta && typeof body.meta === "object" ? body.meta : {};

  if (form_type === "contact") {
    if (!name) return { error: "Name is required." };
    if (!email) return { error: "Email is required." };
    if (!message) return { error: "Message is required." };
  }

  if (form_type === "project_planner") {
    const rooms = Array.isArray(meta.rooms) ? meta.rooms : [];
    if (!meta.bhk) return { error: "Please select a BHK type." };
    if (!rooms.length) return { error: "Please select at least one room." };
    if (!name && !email && !phone) {
      return { error: "Please add your name and email or phone so we can reach you." };
    }
  }

  return {
    data: {
      form_type,
      name,
      email,
      phone,
      project_type,
      message,
      meta,
      status: "new",
    },
  };
}

async function createInquiry(req, res) {
  try {
    const result = validateInquiry(req.body);
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    const created = await Inquiry.create(result.data);
    res.status(201).json({
      message: "Thank you! We received your inquiry and will get back to you soon.",
      inquiry: mapInquiry(created.toObject()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not submit inquiry" });
  }
}

async function getInquiries(req, res) {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
    res.json(inquiries.map(mapInquiry));
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not load inquiries" });
  }
}

async function updateInquiryStatus(req, res) {
  try {
    const status = req.body.status === "read" ? "read" : "new";
    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        status,
        read_at: status === "read" ? new Date() : null,
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Inquiry not found" });
    res.json(mapInquiry(updated));
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not update inquiry" });
  }
}

async function deleteInquiry(req, res) {
  try {
    const deleted = await Inquiry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Inquiry not found" });
    res.json({ message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not delete inquiry" });
  }
}

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
