const fs = require("fs");
const path = require("path");
const Post = require("../models/Post");
const { PROJECT_TYPES } = require("../models/Post");

const MAX_IMAGES_PER_PROJECT = 20;

const validateProjectType = (value) => {
  const t = String(value || "").trim();
  return PROJECT_TYPES.includes(t) ? t : null;
};

function safeUnlink(folder, filename) {
  const base = path.basename(String(filename || ""));
  if (!base || base === "." || base === "..") return;
  const full = path.join(__dirname, "..", "uploads", folder, base);
  fs.unlink(full, () => {});
}

const imagecreateProject = async (req, res) => {
  const { project_name, project_location, project_type } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "At least one image is required" });
  }
  if (!project_name?.trim() || !project_location?.trim()) {
    return res
      .status(400)
      .json({ message: "Project name and location are required" });
  }

  const type = validateProjectType(project_type);
  if (!type) {
    return res.status(400).json({
      message: `project_type must be one of: ${PROJECT_TYPES.join(", ")}`,
    });
  }

  const project_images = req.files.map((file) => file.filename);

  try {
    const post = await Post.create({
      project_name: project_name.trim(),
      project_location: project_location.trim(),
      project_type: type,
      project_images,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const videocreateProject = async (req, res) => {
  const { project_name, project_location, project_type } = req.body;
  const project_video = req.file?.filename;

  if (!project_video) {
    return res.status(400).json({ message: "Video is required" });
  }
  if (!project_name?.trim() || !project_location?.trim()) {
    return res
      .status(400)
      .json({ message: "Project name and location are required" });
  }

  const type = validateProjectType(project_type);
  if (!type) {
    return res.status(400).json({
      message: `project_type must be one of: ${PROJECT_TYPES.join(", ")}`,
    });
  }

  try {
    const post = await Post.create({
      project_name: project_name.trim(),
      project_location: project_location.trim(),
      project_type: type,
      project_images: [],
      project_video,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPosts = async (req, res) => {
  try {
    const { project_type } = req.query;
    const filter = {};
    if (
      project_type &&
      project_type !== "All" &&
      PROJECT_TYPES.includes(project_type)
    ) {
      filter.project_type = project_type;
    }

    const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid project id" });
    }
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { project_name, project_location, project_type } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project_name !== undefined) {
      const v = String(project_name).trim();
      if (!v) {
        return res.status(400).json({ message: "Project name cannot be empty" });
      }
      post.project_name = v;
    }
    if (project_location !== undefined) {
      const v = String(project_location).trim();
      if (!v) {
        return res
          .status(400)
          .json({ message: "Project location cannot be empty" });
      }
      post.project_location = v;
    }
    if (project_type !== undefined) {
      const type = validateProjectType(project_type);
      if (!type) {
        return res.status(400).json({
          message: `project_type must be one of: ${PROJECT_TYPES.join(", ")}`,
        });
      }
      post.project_type = type;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid project id" });
    }
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Project not found" });
    }

    for (const img of post.project_images || []) {
      safeUnlink("images", img);
    }
    if (post.project_video) {
      safeUnlink("videos", post.project_video);
    }

    await post.deleteOne();
    res.status(200).json({ message: "Project deleted", id: req.params.id });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid project id" });
    }
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const appendProjectImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Project not found" });
    }

    const current = post.project_images?.length || 0;
    if (current + req.files.length > MAX_IMAGES_PER_PROJECT) {
      for (const f of req.files) {
        safeUnlink("images", f.filename);
      }
      return res.status(400).json({
        message: `Maximum ${MAX_IMAGES_PER_PROJECT} images per project`,
      });
    }

    const names = req.files.map((f) => f.filename);
    post.project_images = [...(post.project_images || []), ...names];
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid project id" });
    }
    console.error("Error appending images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeProjectImages = async (req, res) => {
  try {
    const { remove } = req.body;
    if (!Array.isArray(remove) || remove.length === 0) {
      return res.status(400).json({
        message: "Body must include remove: string[] of filenames",
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Project not found" });
    }

    const toRemove = new Set(
      remove.map((f) => path.basename(String(f)))
    );
    const kept = [];
    for (const img of post.project_images || []) {
      const b = path.basename(img);
      if (toRemove.has(b)) {
        safeUnlink("images", b);
      } else {
        kept.push(img);
      }
    }
    post.project_images = kept;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid project id" });
    }
    console.error("Error removing images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const replaceProjectVideo = async (req, res) => {
  const newFile = req.file?.filename;
  if (!newFile) {
    return res.status(400).json({ message: "Video file is required" });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      safeUnlink("videos", newFile);
      return res.status(404).json({ message: "Project not found" });
    }

    const old = post.project_video;
    post.project_video = newFile;
    await post.save();
    if (old) {
      safeUnlink("videos", old);
    }
    res.status(200).json(post);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid project id" });
    }
    console.error("Error replacing video:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  imagecreateProject,
  videocreateProject,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  appendProjectImages,
  removeProjectImages,
  replaceProjectVideo,
};
