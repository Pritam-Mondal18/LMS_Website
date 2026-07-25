const express = require("express");
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, addLesson, updateProgress, addReview, getFeaturedCourses } = require("../controllers/course.controller");
const { protect, authorize, optionalAuth } = require("../middlewares/auth.middleware");
const { validate, createCourseRules, reviewRules } = require("../middlewares/validation.middleware");

router.get("/", getCourses);
router.get("/featured", getFeaturedCourses);
router.get("/:slug", optionalAuth, getCourse);

// Teacher / Admin only
router.post("/", protect, authorize("teacher", "admin"), createCourseRules, validate, createCourse);
router.put("/:id", protect, authorize("teacher", "admin"), updateCourse);
router.delete("/:id", protect, authorize("teacher", "admin"), deleteCourse);
router.post("/:id/lessons", protect, authorize("teacher", "admin"), addLesson);

// Enrolled users
router.post("/:id/enroll", protect, enrollCourse);
router.put("/:id/progress", protect, updateProgress);
router.post("/:id/review", protect, reviewRules, validate, addReview);

module.exports = router;

