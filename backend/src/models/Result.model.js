const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    answers: [
      {
        question: String, // question id
        selectedOption: String,
        isCorrect: Boolean,
        marksObtained: Number,
        timeTaken: Number, // seconds
      },
    ],
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    skippedAnswers: { type: Number, default: 0 },
    percentageScore: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // total seconds
    isPassed: { type: Boolean, default: false },
    attemptNumber: { type: Number, default: 1 },
    submittedAt: { type: Date, default: Date.now },
    topicAnalysis: [
      {
        topic: String,
        correct: Number,
        wrong: Number,
        total: Number,
        percentage: Number,
      },
    ],
  },
  { timestamps: true }
);

resultSchema.index({ user: 1, createdAt: -1 });
resultSchema.index({ user: 1, test: 1 });
resultSchema.index({ test: 1, obtainedMarks: -1 }); // For leaderboard rankings

module.exports = mongoose.model("Result", resultSchema);
