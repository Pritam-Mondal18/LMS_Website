const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");

// @desc  Get lesson details (for enrolled users)
// @route GET /api/lessons/:courseId/:lessonId
const getLessonDetails = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }

  // Check enrollment
  const isEnrolled = req.user.role === "admin" || course.instructor.toString() === req.user.id || 
    await Enrollment.exists({ user: req.user.id, course: courseId });
  if (!isEnrolled) {
    return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: "Lesson not found" });
  }

  res.json({ success: true, lesson });
};

// @desc  Add notes to a lesson
// @route POST /api/lessons/:courseId/:lessonId/notes
const addLessonNotes = async (req, res) => {
  const { courseId, lessonId } = req.params;
  const { title, fileUrl } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }

  if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: "Lesson not found" });
  }

  lesson.notes.push({ title, fileUrl });
  await course.save();

  res.json({ success: true, message: "Notes added successfully", notes: lesson.notes });
};

module.exports = { getLessonDetails, addLessonNotes };
