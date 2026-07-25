const Enrollment = require("../models/Enrollment.model");
const Course = require("../models/Course.model");
const User = require("../models/User.model");

/**
 * Create enrollment for a user in a course.
 * Shared between free enrollment and paid enrollment flows.
 */
const createEnrollment = async ({ userId, courseId, paymentId = null }) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  // Check for existing enrollment
  const existing = await Enrollment.findOne({ user: userId, course: courseId });
  if (existing) {
    throw new Error("Already enrolled in this course");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (course.validityDays || 365));

  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
    payment: paymentId,
    expiresAt,
  });

  // Update user's enrolled courses
  await User.findByIdAndUpdate(userId, {
    $addToSet: { enrolledCourses: courseId },
  });

  // Update course enrollment count
  await Course.findByIdAndUpdate(courseId, {
    $inc: { totalEnrolled: 1 },
  });

  return enrollment;
};

module.exports = { createEnrollment };
