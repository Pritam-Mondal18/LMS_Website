const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
    attachments: [{ title: String, fileUrl: String }],
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        submittedAt: { type: Date, default: Date.now },
        fileUrl: String,
        comment: String,
        grade: Number,
        feedback: String,
        isGraded: { type: Boolean, default: false },
      },
    ],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assignmentSchema.index({ course: 1, isPublished: 1 });
assignmentSchema.index({ instructor: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
