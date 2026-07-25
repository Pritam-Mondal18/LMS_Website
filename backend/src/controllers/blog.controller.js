const Blog = require("../models/Blog.model");

// @desc  Get all published blogs
// @route GET /api/blogs
const getBlogs = async (req, res) => {
  const { category, tag, page = 1, limit = 12 } = req.query;
  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;

  const skip = (page - 1) * limit;
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate("author", "name avatar")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Blog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    blogs,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
  });
};

// @desc  Get single blog by slug
// @route GET /api/blogs/:slug
const getBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate("author", "name avatar");
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog post not found" });
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.json({ success: true, blog });
};

// @desc  Create a new blog (admin or teacher)
// @route POST /api/blogs
const createBlog = async (req, res) => {
  const { title, content, excerpt, category, tags, isPublished, thumbnail } = req.body;

  const blog = await Blog.create({
    title,
    content,
    excerpt,
    category,
    tags,
    isPublished,
    thumbnail,
    author: req.user.id,
  });

  res.status(201).json({ success: true, message: "Blog created successfully", blog });
};

module.exports = { getBlogs, getBlogBySlug, createBlog };
