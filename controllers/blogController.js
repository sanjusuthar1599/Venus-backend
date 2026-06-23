const fs = require("fs");
const path = require("path");
const Blog = require("../models/Blog");

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeUnlinkImage(filename) {
  const base = path.basename(String(filename || ""));
  if (!base || base === "." || base === "..") return;
  const full = path.join(__dirname, "..", "uploads", "images", base);
  fs.unlink(full, () => {});
}

async function ensureUniqueSlug(title, currentId) {
  const base = slugify(title) || "blog-post";
  let slug = base;
  let i = 2;

  while (true) {
    const existing = await Blog.findOne({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })
      .select("_id")
      .lean();
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ published_at: -1, createdAt: -1 }).lean();
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog id" });
    }
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createBlog = async (req, res) => {
  const { title, excerpt, body, published_at } = req.body;
  const cover_image = req.file?.filename || null;

  if (!title?.trim() || !excerpt?.trim()) {
    if (cover_image) safeUnlinkImage(cover_image);
    return res.status(400).json({ message: "Title and excerpt are required" });
  }

  try {
    const slug = await ensureUniqueSlug(title);
    const blog = await Blog.create({
      title: title.trim(),
      slug,
      excerpt: excerpt.trim(),
      body: String(body || "").trim(),
      cover_image,
      published_at: published_at ? new Date(published_at) : new Date(),
    });
    res.status(201).json(blog);
  } catch (error) {
    if (cover_image) safeUnlinkImage(cover_image);
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, excerpt, body, published_at } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      if (req.file?.filename) safeUnlinkImage(req.file.filename);
      return res.status(404).json({ message: "Blog not found" });
    }

    if (title !== undefined) {
      const value = String(title).trim();
      if (!value) {
        if (req.file?.filename) safeUnlinkImage(req.file.filename);
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      blog.title = value;
      blog.slug = await ensureUniqueSlug(value, blog._id);
    }

    if (excerpt !== undefined) {
      const value = String(excerpt).trim();
      if (!value) {
        if (req.file?.filename) safeUnlinkImage(req.file.filename);
        return res.status(400).json({ message: "Excerpt cannot be empty" });
      }
      blog.excerpt = value;
    }

    if (body !== undefined) {
      blog.body = String(body || "").trim();
    }

    if (published_at !== undefined) {
      blog.published_at = published_at ? new Date(published_at) : blog.published_at;
    }

    if (req.file?.filename) {
      const old = blog.cover_image;
      blog.cover_image = req.file.filename;
      if (old) safeUnlinkImage(old);
    }

    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog id" });
    }
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    if (blog.cover_image) safeUnlinkImage(blog.cover_image);
    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted", id: req.params.id });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog id" });
    }
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
