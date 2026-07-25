const mongoose = require("mongoose");

const liveClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 60 },
    meetingId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Scheduled", "Live", "Completed"], default: "Scheduled" },
    isApproved: { type: Boolean, default: false },
    recordingUrl: String,
    recordingPublicId: String
  },
  { timestamps: true }
);

liveClassSchema.index({ course: 1 });
liveClassSchema.index({ instructor: 1 });

module.exports = mongoose.model("LiveClass", liveClassSchema);
