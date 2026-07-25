const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Course = require("../models/Course.model");
const { sendEmail, otpEmailTemplate, resetPasswordEmailTemplate, welcomeEmailTemplate } = require("../services/email.service");
const { sendTokenResponse, generateAccessToken, getCookieOptions } = require("../utils/token.util");

// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, role = "student" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Please provide name, email and password." });
  }

  // Don't allow direct admin registration
  if (role === "admin") {
    return res.status(403).json({ success: false, message: "Admin registration not allowed." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered." });
  }

  const user = await User.create({ name, email, password, role });

  // Generate OTP
  const otp = user.generateOTP();
  await user.save();

  // Send OTP email in background (non-blocking for fast API response)
  sendEmail({
    to: email,
    subject: "Verify your Sumit Chakraborty Academy account",
    html: otpEmailTemplate(name, otp),
  }).catch((err) => console.error("Async email send error:", err.message));

  console.log(`\n🔑 [OTP DEBUG] OTP for ${email}: ${otp}\n`);

  res.status(201).json({
    success: true,
    message: "Registration successful! Please verify your email with the OTP sent.",
    userId: user._id,
  });
};

// @desc  Verify OTP
// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId).select("+otp +otpExpiry +otpAttempts +otpLockedUntil");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  if (user.isVerified) {
    return res.status(400).json({ success: false, message: "Account already verified." });
  }

  // Check if account is currently locked out
  if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
    const remainingMs = user.otpLockedUntil - Date.now();
    const remainingMins = Math.ceil(remainingMs / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. Try again in ${remainingMins} minute(s) or request a new OTP.`,
    });
  }

  if (!user.otp || user.otpExpiry < new Date()) {
    return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
  }

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  if (user.otp !== hashedOTP) {
    user.otpAttempts += 1;

    // Lock out after 5 failed attempts for 15 minutes
    if (user.otpAttempts >= 5) {
      user.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Account locked for 15 minutes. Request a new OTP to unlock early.",
      });
    }

    await user.save();
    return res.status(400).json({
      success: false,
      message: `Invalid OTP. ${5 - user.otpAttempts} attempt(s) remaining.`,
    });
  }

  // Mark verified
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;
  user.otpLockedUntil = undefined;
  if (user.role === "teacher") user.isApproved = false; // needs admin approval
  await user.save();

  // Send welcome email in background
  sendEmail({
    to: user.email,
    subject: "Welcome to Sumit Chakraborty Academy! 🎉",
    html: welcomeEmailTemplate(user.name),
  }).catch((err) => console.error("Async email send error:", err.message));

  sendTokenResponse(user, 200, res, "Account verified successfully!");
};

// @desc  Resend OTP
// @route POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId).select("+lastOtpSentAt +otpLockedUntil");
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  if (user.isVerified) return res.status(400).json({ success: false, message: "Account already verified." });

  // Enforce 60-second resend cooldown
  if (user.lastOtpSentAt) {
    const secondsSinceLast = (Date.now() - user.lastOtpSentAt.getTime()) / 1000;
    if (secondsSinceLast < 60) {
      const waitSecs = Math.ceil(60 - secondsSinceLast);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSecs} second(s) before requesting a new OTP.`,
      });
    }
  }

  const otp = user.generateOTP();
  user.lastOtpSentAt = new Date();
  // Requesting a new OTP clears any lockout
  user.otpLockedUntil = undefined;
  user.otpAttempts = 0;
  await user.save();

  sendEmail({
    to: user.email,
    subject: "New OTP for Sumit Chakraborty Academy",
    html: otpEmailTemplate(user.name, otp),
  }).catch((err) => console.error("Async email send error:", err.message));

  console.log(`\n🔑 [OTP DEBUG] New OTP for ${user.email}: ${otp}\n`);

  res.json({ success: true, message: "New OTP sent to your email." });
};

// @desc  Login
// @route POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password." });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }
  if (user.isBanned) {
    return res.status(403).json({ success: false, message: "Your account has been banned. Contact support." });
  }
  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first.",
      userId: user._id,
      needsVerification: true,
    });
  }
  if (user.role === "teacher" && !user.isApproved) {
    return res.status(403).json({ success: false, message: "Your teacher account is pending admin approval." });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  user.lastActiveAt = new Date();
  await user.save();

  sendTokenResponse(user, 200, res, "Login successful!");
};

// @desc  Logout
// @route POST /api/auth/logout
const logout = (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ success: true, message: "Logged out successfully." });
};

// @desc  Refresh token
// @route POST /api/auth/refresh
const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "No refresh token." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return res.status(401).json({ success: false, message: "Invalid refresh token." });
    }
    const accessToken = generateAccessToken(user._id);
    const cookieOptions = getCookieOptions();
    res
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ success: true, accessToken });
  } catch {
    res.status(401).json({ success: false, message: "Invalid refresh token." });
  }
};

// @desc  Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // Security: don't reveal if email exists
    return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = user.generateResetToken();
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Password Reset - Sumit Chakraborty Academy",
    html: resetPasswordEmailTemplate(user.name, resetUrl),
  });

  res.json({ success: true, message: "Password reset link sent to your email." });
};

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, "Password reset successful!");
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("enrolledCourses", "title thumbnail slug")
    .populate("wishlist", "title thumbnail slug price discountPrice");

  res.json({ success: true, user });
};

// @desc  Get public platform statistics
// @route GET /api/auth/public-stats
const getPublicStats = async (req, res) => {
  const [studentCount, teacherCount, courseCount] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    Course.countDocuments({ isPublished: true })
  ]);

  res.json({
    success: true,
    stats: {
      studentCount,
      teacherCount,
      courseCount
    }
  });
};

// @desc  Get approved testimonials
// @route GET /api/auth/testimonials
const getPublicTestimonials = async (req, res) => {
  const Testimonial = require("../models/Testimonial.model");
  const Course = require("../models/Course.model");

  // Fetch approved testimonials
  const testimonials = await Testimonial.find({ isApproved: true }).sort("-createdAt");

  // Fetch published and approved courses with their reviews populated
  const coursesWithReviews = await Course.find({ isPublished: true, isApproved: true })
    .select("title reviews")
    .populate("reviews.user", "name avatar");

  // Format and extract course reviews
  const courseReviews = [];
  coursesWithReviews.forEach(course => {
    (course.reviews || []).forEach(rev => {
      courseReviews.push({
        _id: rev._id,
        name: rev.user?.name || "Verified Student",
        avatar: rev.user?.avatar,
        course: course.title,
        rating: rev.rating,
        review: rev.comment,
        achievement: "Course Reviewer",
        createdAt: rev.createdAt
      });
    });
  });

  // Combine testimonials and course reviews, then sort by date (newest first)
  const combined = [...testimonials, ...courseReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ success: true, testimonials: combined });
};

// @desc  Handle contact form inquiry and email admin
// @route POST /api/auth/contact
const contactInquiry = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email and message are required." });
  }

  const adminEmail = process.env.USER_EMAIL;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#090040;font-family:Arial,sans-serif">
  <div style="max-width:620px;margin:40px auto;background:linear-gradient(135deg,#0F0052,#1a0080);border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#471396,#B13BFF);padding:36px 40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">📬 New Contact Inquiry</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Sumit Chakraborty Academy — Contact Form</p>
    </div>
    <div style="padding:40px">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px;width:120px">Name</td><td style="padding:10px 0;color:#fff;font-weight:bold">${name}</td></tr>
        <tr><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px">Email</td><td style="padding:10px 0;color:#FF2E93">${email}</td></tr>
        <tr><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px">Phone</td><td style="padding:10px 0;color:#fff">${phone || 'Not provided'}</td></tr>
        <tr><td style="padding:10px 0;color:rgba(255,255,255,0.5);font-size:13px">Subject</td><td style="padding:10px 0;color:#fff">${subject || 'General Inquiry'}</td></tr>
      </table>
      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(177,59,255,0.3);border-radius:12px;padding:20px;margin-top:20px">
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 8px">Message</p>
        <p style="color:#fff;line-height:1.7;margin:0;white-space:pre-line">${message}</p>
      </div>
      <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:28px">
        Received on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </p>
    </div>
    <div style="background:rgba(0,0,0,0.3);padding:20px;text-align:center">
      <p style="color:rgba(255,255,255,0.4);margin:0;font-size:12px">© ${new Date().getFullYear()} Sumit Chakraborty Academy. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  // Send emails in background asynchronously (non-blocking for fast UI response)
  sendEmail({
    to: adminEmail,
    from: `"${name}" <${email}>`,
    replyTo: email,
    subject: `[Contact Form] ${subject || 'General Inquiry'} — from ${name}`,
    html,
  }).catch((err) => console.error("Async contact admin email send error:", err.message));

  sendEmail({
    to: email,
    from: `"Sumit Chakraborty Academy" <${adminEmail}>`,
    replyTo: adminEmail,
    subject: 'We received your inquiry — Sumit Chakraborty Academy',
    html: confirmHtml,
  }).catch((err) => console.error("Async contact confirmation email send error:", err.message));

  res.json({
    success: true,
    message: 'Inquiry submitted successfully. We will get back to you within 12 hours.',
  });
};

module.exports = { register, verifyOTP, resendOTP, login, logout, refreshToken, forgotPassword, resetPassword, getMe, getPublicStats, getPublicTestimonials, contactInquiry };
