const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    enrolledAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
    completedLessons: [String], // lesson IDs as strings
    lastWatchedLesson: String,
    lastWatchedAt: Date,
    progressPercent: { type: Number, default: 0 },
    totalWatchTime: { type: Number, default: 0 }, // minutes
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    certificateUrl: String,
    certificateIssuedAt: Date,
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    reviewedAt: Date,
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
