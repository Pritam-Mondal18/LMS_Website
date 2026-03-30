import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: "", // Set default to empty string for Google-authenticated users
      // required: true,
      required: false, //--> because for google auth users, password is not required
    },
    role: {
      type: String,
      enum: ["student", "educator"],
      required: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    resetotp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    isGoogleUser: {   // ✅ ADD THIS FROM CHATGPT
    type: Boolean,
    default: false
  }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
// export default (User)
