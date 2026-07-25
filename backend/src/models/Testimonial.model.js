const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    avatar: { type: String, default: "https://ui-avatars.com/api/?background=B13BFF&color=fff" },
    course: String,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    review: { type: String, required: true },
    achievement: String,
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

testimonialSchema.index({ isApproved: 1, isFeatured: 1 });

module.exports = mongoose.model("Testimonial", testimonialSchema);
