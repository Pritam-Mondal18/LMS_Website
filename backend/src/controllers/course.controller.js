const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");
const User = require("../models/User.model");
const { createEnrollment } = require("../services/enrollment.service");

// @desc  Get all courses (with filters)
// @route GET /api/courses
const getCourses = async (req, res) => {
  const { category, search, page = 1, limit = 12, sort = "-createdAt", minPrice, maxPrice, level } = req.query;

  const query = { isPublished: true, isApproved: true };

  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.$text = { $search: search };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (page - 1) * limit;
  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate("instructor", "name avatar qualification")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select("-lessons -enrolled -reviews"),
    Course.countDocuments(query),
  ]);

  res.json({
    success: true,
    courses,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
  });
};

// @desc  Get single course by slug or ID
// @route GET /api/courses/:slug
const getCourse = async (req, res) => {
  const mongoose = require("mongoose");
  const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug);
  const query = isObjectId ? { _id: req.params.slug } : { slug: req.params.slug };

  const course = await Course.findOne(query)
    .populate("instructor", "name avatar qualification experience bio rating totalStudents specialization")
    .populate("reviews.user", "name avatar");

  if (!course) return res.status(404).json({ success: false, message: "Course not found." });

  const isInstructor = req.user && course.instructor && 
    (course.instructor._id || course.instructor).toString() === req.user._id.toString();
  const isAdmin = req.user && req.user.role === "admin";

  // If the course is not published or not approved, only allow its instructor or an admin to view it
  if (!course.isPublished || !course.isApproved) {
    if (!isInstructor && !isAdmin) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
  }

  // Check if user is enrolled
  let isEnrolled = false;
  if (req.user) {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
    isEnrolled = !!enrollment;
  }

  const canAccess = isEnrolled || isAdmin || isInstructor;

  // Only show preview lessons to non-enrolled users, except admins and the instructor.
  // Strip Zoom link, notes, and other non-preview metadata for security.
  const courseData = course.toObject();
  if (!canAccess) {
    courseData.lessons = courseData.lessons.map((l) => ({
      _id: l._id,
      title: l.title,
      description: l.description,
      duration: l.duration,
      isPreview: l.isPreview,
      isLive: l.isPreview ? l.isLive : false,
      scheduledAt: l.isPreview ? l.scheduledAt : null,
      order: l.order,
      videoUrl: l.isPreview ? l.videoUrl : null,
      notes: [],
    }));
  }

  res.json({ success: true, course: courseData, isEnrolled, canAccess });
};

// @desc  Create course
// @route POST /api/courses
const createCourse = async (req, res) => {
  const courseData = { ...req.body, instructor: req.user._id };

  if (req.user.role === "admin") courseData.isApproved = true;

  const course = await Course.create(courseData);
  res.status(201).json({ success: true, message: "Course created successfully.", course });
};

// @desc  Update course
// @route PUT /api/courses/:id
const updateCourse = async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found." });

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized." });
  }

  course.set(req.body);
  await course.save(); // Use save to trigger the pre-save hook for computed values and slugs
  res.json({ success: true, message: "Course updated.", course });
};

// @desc  Delete course
// @route DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found." });

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized." });
  }

  const courseId = course._id;
  await Promise.all([
    course.deleteOne(),
    Enrollment.deleteMany({ course: courseId }),
    User.updateMany(
      { enrolledCourses: courseId },
      { $pull: { enrolledCourses: courseId } }
    ),
  ]);

  res.json({ success: true, message: "Course deleted." });
};

// @desc  Enroll in course (free)
// @route POST /api/courses/:id/enroll
const enrollCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found." });
  if (course.price > 0) {
    return res.status(400).json({ success: false, message: "This course requires payment." });
  }

  try {
    await createEnrollment({ userId: req.user._id, courseId: course._id });
    res.json({ success: true, message: "Enrolled successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Add lesson to course
// @route POST /api/courses/:id/lessons
const addLesson = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found." });
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized." });
  }

  course.lessons.push({ ...req.body, order: course.lessons.length });
  await course.save();
  res.status(201).json({ success: true, message: "Lesson added.", course });
};

// @desc  Update lesson progress
// @route PUT /api/courses/:id/progress
const updateProgress = async (req, res) => {
  const { lessonId } = req.body;
  const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.id });
  if (!enrollment) return res.status(404).json({ success: false, message: "Not enrolled." });

  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
  }
  enrollment.lastWatchedLesson = lessonId;
  enrollment.lastWatchedAt = new Date();

  const course = await Course.findById(req.params.id);
  enrollment.progressPercent = Math.round((enrollment.completedLessons.length / course.lessons.length) * 100);

  if (enrollment.progressPercent === 100 && !enrollment.isCompleted) {
    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
  }

  await enrollment.save();
  res.json({ success: true, progress: enrollment.progressPercent, isCompleted: enrollment.isCompleted });
};

// @desc  Add review
// @route POST /api/courses/:id/review
const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found." });

  const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
  if (!enrollment) return res.status(403).json({ success: false, message: "You must be enrolled to review." });

  const existingReview = course.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (existingReview) return res.status(400).json({ success: false, message: "Already reviewed." });

  course.reviews.push({ user: req.user._id, rating, comment });
  course.totalRatings = course.reviews.length;
  course.rating = course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.totalRatings;
  await course.save();

  res.json({ success: true, message: "Review added." });
};

// @desc  Get featured/popular courses
// @route GET /api/courses/featured
const getFeaturedCourses = async (req, res) => {
  const courses = await Course.find({ isPublished: true, isApproved: true, isFeatured: true })
    .populate("instructor", "name avatar")
    .limit(6)
    .select("-lessons -enrolled -reviews");

  res.json({ success: true, courses });
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, addLesson, updateProgress, addReview, getFeaturedCourses };
