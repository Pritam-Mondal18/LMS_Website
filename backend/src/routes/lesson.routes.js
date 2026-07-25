const express = require("express");
const router = express.Router();
const { getLessonDetails, addLessonNotes } = require("../controllers/lesson.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.get("/:courseId/:lessonId", protect, getLessonDetails);
router.post("/:courseId/:lessonId/notes", protect, authorize("teacher", "admin"), addLessonNotes);

module.exports = router;
