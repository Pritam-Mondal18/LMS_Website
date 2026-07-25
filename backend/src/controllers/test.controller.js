const Test = require("../models/Test.model");
const Result = require("../models/Result.model");
const Course = require("../models/Course.model");

// @desc  Create a new MCQ test
// @route POST /api/tests
const createTest = async (req, res) => {
  const { title, description, courseId, questions, duration, hasNegativeMarking, testType, category, scheduledAt, endsAt } = req.body;

  if (!title || !duration || !questions || questions.length === 0) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  const test = await Test.create({
    title,
    description,
    course: courseId || null,
    instructor: req.user.id,
    questions,
    duration,
    hasNegativeMarking,
    testType,
    category,
    scheduledAt,
    endsAt,
    isPublished: true,
  });

  res.status(201).json({ success: true, message: "Test created successfully", test });
};

// @desc  Get available tests (by course or category)
// @route GET /api/tests
const getTests = async (req, res) => {
  const { courseId, category } = req.query;
  const filter = { isPublished: true };
  if (courseId) filter.course = courseId;
  if (category) filter.category = category;

  const tests = await Test.find(filter).select("-questions.correctOption -questions.explanation");
  res.json({ success: true, tests });
};

// @desc  Get single test details (without correct answers) for taking the exam
// @route GET /api/tests/:id
const getTestById = async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) {
    return res.status(404).json({ success: false, message: "Test not found" });
  }

  // Strip correct answers if user is a student
  const testData = test.toObject();
  if (req.user.role === "student") {
    testData.questions = testData.questions.map((q) => {
      const { correctOption, explanation, ...rest } = q;
      return rest;
    });
  }

  res.json({ success: true, test: testData });
};

// @desc  Submit test answers and calculate result
// @route POST /api/tests/:id/submit
const submitTest = async (req, res) => {
  const { answers, timeTaken } = req.body; // answers is [{ questionId, selectedOption, timeTaken }]
  const testId = req.params.id;

  const test = await Test.findById(testId);
  if (!test) {
    return res.status(404).json({ success: false, message: "Test not found" });
  }

  let obtainedMarks = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedAnswers = 0;
  const processedAnswers = [];

  test.questions.forEach((q) => {
    const submission = answers.find((ans) => ans.questionId === q._id.toString());
    const selectedOption = submission ? submission.selectedOption : null;

    if (!selectedOption) {
      skippedAnswers++;
      processedAnswers.push({
        question: q._id.toString(),
        selectedOption: null,
        isCorrect: false,
        marksObtained: 0,
        timeTaken: submission ? submission.timeTaken : 0,
      });
    } else if (selectedOption === q.correctOption) {
      correctAnswers++;
      obtainedMarks += q.marks;
      processedAnswers.push({
        question: q._id.toString(),
        selectedOption,
        isCorrect: true,
        marksObtained: q.marks,
        timeTaken: submission.timeTaken || 0,
      });
    } else {
      wrongAnswers++;
      const penalty = test.hasNegativeMarking ? q.negativeMark : 0;
      obtainedMarks -= penalty;
      processedAnswers.push({
        question: q._id.toString(),
        selectedOption,
        isCorrect: false,
        marksObtained: -penalty,
        timeTaken: submission.timeTaken || 0,
      });
    }
  });

  const percentageScore = Math.max(0, Math.round((obtainedMarks / test.totalMarks) * 100));
  const isPassed = obtainedMarks >= test.passingMarks;

  // Save Result
  const result = await Result.create({
    user: req.user.id,
    test: testId,
    answers: processedAnswers,
    totalMarks: test.totalMarks,
    obtainedMarks,
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    percentageScore,
    timeTaken: timeTaken || 0,
    isPassed,
  });

  // Calculate rank dynamically
  const rankCount = await Result.countDocuments({
    test: testId,
    obtainedMarks: { $gt: obtainedMarks },
  });
  result.rank = rankCount + 1;
  await result.save();

  res.status(201).json({
    success: true,
    message: "Test submitted successfully",
    result: {
      _id: result._id,
      totalMarks: result.totalMarks,
      obtainedMarks: result.obtainedMarks,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      skippedAnswers: result.skippedAnswers,
      percentageScore: result.percentageScore,
      rank: result.rank,
      isPassed: result.isPassed,
    },
  });
};

// @desc  Get test leaderboard
// @route GET /api/tests/:id/leaderboard
const getLeaderboard = async (req, res) => {
  const results = await Result.find({ test: req.params.id })
    .populate("user", "name avatar")
    .sort("-obtainedMarks timeTaken")
    .limit(20);

  res.json({ success: true, leaderboard: results });
};

// @desc  Get student test results
// @route GET /api/tests/results/my
const getMyResults = async (req, res) => {
  const results = await Result.find({ user: req.user.id })
    .populate("test", "title totalMarks duration testType")
    .sort("-createdAt");
  res.json({ success: true, results });
};

module.exports = { createTest, getTests, getTestById, submitTest, getLeaderboard, getMyResults };
