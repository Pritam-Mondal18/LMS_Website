const mongoose = require("mongoose");
const slugify = require("slugify");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  videoPublicId: String,
  thumbnailUrl: String,
  duration: { type: Number, default: 0 }, // in minutes
  isPreview: { type: Boolean, default: false },
  isLive: { type: Boolean, default: false },
  scheduledAt: Date,
  zoomLink: String,
  notes: [
    {
      title: String,
      fileUrl: String,
      filePublicId: String,
    },
  ],
  order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, "Description is required"] },
    shortDescription: String,
    thumbnail: {
      public_id: String,
      url: { type: String, default: "https://via.placeholder.com/800x450/090040/B13BFF?text=Course" },
    },
    introVideo: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    category: {
      type: String,
      required: true,
      enum: ["class-5-10", "class-11-12", "jee", "neet", "commerce", "college", "boards-11-12", "foundation"],
    },
    subject: String,
    language: { type: String, default: "Hindi/English" },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lessons: [lessonSchema],
    totalEnrolled: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // in minutes
    totalLessons: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [String],
    features: [String],
    requirements: [String],
    whatYouLearn: [String],
    isPublished: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    hasCertificate: { type: Boolean, default: true },
    hasLiveClasses: { type: Boolean, default: false },
    hasNotes: { type: Boolean, default: true },
    hasAssignments: { type: Boolean, default: true },
    hasTestSeries: { type: Boolean, default: false },
    validityDays: { type: Number, default: 365 },
  },
  { timestamps: true }
);

// Auto-generate slug
courseSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  // Update computed fields
  this.totalLessons = this.lessons.length;
  this.totalDuration = this.lessons.reduce((sum, l) => sum + (l.duration || 0), 0);
  next();
});

// Indexes for query performance
courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ category: 1, isPublished: 1, isApproved: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1, isApproved: 1, isFeatured: 1 });
courseSchema.index({ title: "text", description: "text" }, { language_override: "none" });

module.exports = mongoose.model("Course", courseSchema);

