const express = require("express");
const router = express.Router();
const { register, verifyOTP, resendOTP, login, logout, refreshToken, forgotPassword, resetPassword, getMe, getPublicStats, getPublicTestimonials, contactInquiry } = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate, registerRules, loginRules, verifyOTPRules, forgotPasswordRules, resetPasswordRules, contactRules } = require("../middlewares/validation.middleware");

router.get("/public-stats", getPublicStats);
router.get("/testimonials", getPublicTestimonials);
router.get("/me", protect, getMe);
router.post("/register", registerRules, validate, register);
router.post("/verify-otp", verifyOTPRules, validate, verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password/:token", resetPasswordRules, validate, resetPassword);
router.post("/contact", contactRules, validate, contactInquiry);


module.exports = router;

