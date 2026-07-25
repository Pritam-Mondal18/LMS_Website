const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [
    {
      label: { type: String, enum: ["A", "B", "C", "D"] },
      text: { type: String, required: true },
    },
  ],
  correctOption: { type: String, enum: ["A", "B", "C", "D"], required: true },
  explanation: String,
  marks: { type: Number, default: 4 },
  negativeMark: { type: Number, default: 1 },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  topic: String,
  image: String,
});

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: [questionSchema],
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    duration: { type: Number, required: true }, // in minutes
    hasNegativeMarking: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    testType: {
      type: String,
      enum: ["chapter", "full-test", "mock", "dpp", "previous-year"],
      default: "chapter",
    },
    category: {
      type: String,
      enum: ["class-5-10", "class-11-12", "jee", "neet", "commerce", "college"],
    },
    scheduledAt: Date,
    endsAt: Date,
    maxAttempts: { type: Number, default: 1 },
    shuffleQuestions: { type: Boolean, default: true },
    showResults: { type: Boolean, default: true },
    instructions: [String],
  },
  { timestamps: true }
);

// Auto-calculate total marks
testSchema.pre("save", function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  this.passingMarks = Math.ceil(this.totalMarks * 0.33);
  next();
});

testSchema.index({ course: 1, isPublished: 1 });
testSchema.index({ isPublished: 1, category: 1 });

module.exports = mongoose.model("Test", testSchema);
