const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    avatar: {
      public_id: String,
      url: { type: String, default: "https://ui-avatars.com/api/?background=B13BFF&color=fff&size=200" },
    },
    phone: { type: String },
    bio: { type: String, maxlength: 500 },
    qualification: { type: String },
    experience: { type: String },
    specialization: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // for teachers

    // OTP fields
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpLockedUntil: { type: Date, select: false },   // lockout expiry after 5 failed attempts
    lastOtpSentAt: { type: Date, select: false },    // throttle resend — min 60s between sends

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpiry: Date,

    // Tokens
    refreshToken: { type: String, select: false },

    // Student specific
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    totalLearningHours: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveAt: Date,

    // Teacher specific
    totalStudents: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // Preferences
    darkMode: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },

  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  this.otpAttempts = 0;
  return otp; // return plain OTP for email, store hashed version
};

// Generate reset password token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
