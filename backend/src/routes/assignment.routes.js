const express = require("express");
const router = express.Router();
const { createAssignment, getAssignmentsByCourse, submitAssignment, gradeSubmission } = require("../controllers/assignment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { validate, createAssignmentRules } = require("../middlewares/validation.middleware");

router.get("/course/:courseId", protect, getAssignmentsByCourse);
router.post("/", protect, authorize("teacher", "admin"), createAssignmentRules, validate, createAssignment);
router.post("/:id/submit", protect, submitAssignment);
router.put("/:id/grade", protect, authorize("teacher", "admin"), gradeSubmission);

module.exports = router;
