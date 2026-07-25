const express = require("express");
const router = express.Router();
const { createTest, getTests, getTestById, submitTest, getLeaderboard, getMyResults } = require("../controllers/test.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { validate, createTestRules } = require("../middlewares/validation.middleware");

router.get("/", protect, getTests);
router.get("/results/my", protect, getMyResults);
router.post("/", protect, authorize("teacher", "admin"), createTestRules, validate, createTest);

router.get("/:id", protect, getTestById);
router.post("/:id/submit", protect, submitTest);
router.get("/:id/leaderboard", protect, getLeaderboard);

module.exports = router;
