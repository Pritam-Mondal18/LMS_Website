const express = require("express");
const router = express.Router();
const { getBlogs, getBlogBySlug, createBlog } = require("../controllers/blog.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { validate, createBlogRules } = require("../middlewares/validation.middleware");

router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/", protect, authorize("teacher", "admin"), createBlogRules, validate, createBlog);

module.exports = router;
