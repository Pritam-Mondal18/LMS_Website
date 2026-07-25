const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    excerpt: String,
    thumbnail: {
      public_id: String,
      url: { type: String, default: "https://via.placeholder.com/800x400/090040/B13BFF?text=Blog" },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [String],
    category: {
      type: String,
      enum: ["study-tips", "jee", "neet", "science", "commerce", "general"],
      default: "general",
    },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 5 }, // minutes
  },
  { timestamps: true }
);

blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + "-" + Date.now();
  }
  next();
});

blogSchema.index({ isPublished: 1, createdAt: -1 });
blogSchema.index({ category: 1, isPublished: 1 });

module.exports = mongoose.model("Blog", blogSchema);
