const { body, param, query, validationResult } = require("express-validator");

// Centralized validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validation rules
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }).withMessage("Name cannot exceed 50 characters"),
  body("email").trim().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("role").optional().isIn(["student", "teacher"]).withMessage("Invalid role"),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const verifyOTPRules = [
  body("userId").notEmpty().withMessage("User ID is required").isMongoId().withMessage("Invalid user ID"),
  body("otp").notEmpty().withMessage("OTP is required").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const forgotPasswordRules = [
  body("email").trim().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
];

const resetPasswordRules = [
  param("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
];

const contactRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 50 }).withMessage("Name cannot exceed 50 characters"),
  body("email").trim().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("message").trim().notEmpty().withMessage("Message is required").isLength({ max: 1000 }).withMessage("Message cannot exceed 1000 characters"),
  body("phone").optional().trim().isLength({ max: 20 }).withMessage("Phone number is too long"),
  body("subject").optional().trim().isLength({ max: 100 }).withMessage("Subject is too long"),
];

// Course validation rules
const createCourseRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").isIn(["class-5-10", "class-11-12", "jee", "neet", "commerce", "college"]).withMessage("Invalid category"),
  body("level").optional().isIn(["beginner", "intermediate", "advanced"]).withMessage("Invalid level"),
];

// Test validation rules
const createTestRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("duration").isInt({ min: 1 }).withMessage("Duration must be at least 1 minute"),
  body("questions").isArray({ min: 1 }).withMessage("At least one question is required"),
  body("questions.*.text").trim().notEmpty().withMessage("Question text is required"),
  body("questions.*.correctOption").isIn(["A", "B", "C", "D"]).withMessage("Correct option must be A, B, C, or D"),
];

// Assignment validation rules
const createAssignmentRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("courseId").notEmpty().withMessage("Course ID is required").isMongoId().withMessage("Invalid course ID"),
  body("dueDate").isISO8601().withMessage("Valid due date is required"),
];

// Review validation rules
const reviewRules = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().trim().isLength({ max: 1000 }).withMessage("Comment cannot exceed 1000 characters"),
];

// Blog validation rules
const createBlogRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("category").optional().isIn(["study-tips", "jee", "neet", "science", "commerce", "general"]).withMessage("Invalid category"),
];

// Profile update validation
const updateProfileRules = [
  body("name").optional().trim().isLength({ min: 1, max: 50 }).withMessage("Name must be 1-50 characters"),
  body("phone").optional().trim(),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio cannot exceed 500 characters"),
];

// MongoDB ID param validation
const mongoIdParam = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  verifyOTPRules,
  forgotPasswordRules,
  resetPasswordRules,
  contactRules,
  createCourseRules,
  createTestRules,
  createAssignmentRules,
  reviewRules,
  createBlogRules,
  updateProfileRules,
  mongoIdParam,
};
