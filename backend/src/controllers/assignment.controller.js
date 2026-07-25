const Assignment = require("../models/Assignment.model");
const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");

// @desc  Create assignment (teacher / admin)
// @route POST /api/assignments
const createAssignment = async (req, res) => {
  const { title, description, courseId, dueDate, totalMarks, attachments } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }

  // Authorize teacher or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to create assignments for this course" });
  }

  const assignment = await Assignment.create({
    title,
    description,
    course: courseId,
    instructor: req.user.id,
    dueDate,
    totalMarks,
    attachments,
  });

  res.status(201).json({ success: true, message: "Assignment created successfully", assignment });
};

// @desc  Get all assignments for a course
// @route GET /api/assignments/course/:courseId
const getAssignmentsByCourse = async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }

  // Check enrollment / authority
  const isEnrolled = req.user.role === "admin" || course.instructor.toString() === req.user.id || 
    await Enrollment.exists({ user: req.user.id, course: courseId });
  if (!isEnrolled) {
    return res.status(403).json({ success: false, message: "You are not enrolled in this course" });
  }

  const assignments = await Assignment.find({ course: courseId }).sort("-createdAt");
  res.json({ success: true, assignments });
};

// @desc  Submit assignment (student)
// @route POST /api/assignments/:id/submit
const submitAssignment = async (req, res) => {
  const { fileUrl, comment } = req.body;
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({ success: false, message: "Assignment not found" });
  }

  // Check if student already submitted
  const alreadySubmitted = assignment.submissions.find(sub => sub.student.toString() === req.user.id);
  if (alreadySubmitted) {
    return res.status(400).json({ success: false, message: "Assignment already submitted" });
  }

  assignment.submissions.push({
    student: req.user.id,
    fileUrl,
    comment,
    submittedAt: new Date(),
  });

  await assignment.save();
  res.json({ success: true, message: "Assignment submitted successfully!" });
};

// @desc  Grade submission (teacher / admin)
// @route PUT /api/assignments/:id/grade
const gradeSubmission = async (req, res) => {
  const { studentId, grade, feedback } = req.body;
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({ success: false, message: "Assignment not found" });
  }

  if (assignment.instructor.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  const submission = assignment.submissions.find(sub => sub.student.toString() === studentId);
  if (!submission) {
    return res.status(404).json({ success: false, message: "Submission not found for this student" });
  }

  submission.grade = grade;
  submission.feedback = feedback;
  submission.isGraded = true;

  await assignment.save();
  res.json({ success: true, message: "Submission graded successfully", assignment });
};

module.exports = { createAssignment, getAssignmentsByCourse, submitAssignment, gradeSubmission };
