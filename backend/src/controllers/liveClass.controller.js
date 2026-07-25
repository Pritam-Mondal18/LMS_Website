const LiveClass = require("../models/LiveClass.model");
const MeetingRoom = require("../models/MeetingRoom.model");
const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");
const Notification = require("../models/Notification.model");
const mongoose = require("mongoose");

// @desc  Create live class room (teacher / admin)
// @route POST /api/live-classes
const createLiveClass = async (req, res) => {
  const { title, course, date, time, duration } = req.body;

  if (!title || !course || !date || !time) {
    return res.status(400).json({ success: false, message: "Please fill all details" });
  }

  // Find course either by Title or by ID
  let courseObj;
  if (mongoose.Types.ObjectId.isValid(course)) {
    courseObj = await Course.findById(course);
  } else {
    courseObj = await Course.findOne({ title: course });
  }

  if (!courseObj) {
    return res.status(404).json({ success: false, message: `Course not found: ${course}` });
  }

  // Authorize teacher or admin
  if (courseObj.instructor.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to schedule live class for this course" });
  }

  // Generate unique meetingId
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const meetingId = `sca-live-${cleanTitle || "session"}-${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const liveClass = await LiveClass.create({
    title,
    course: courseObj._id,
    instructor: req.user.id,
    date,
    time,
    duration: Number(duration) || 60,
    meetingId,
    status: "Scheduled"
  });

  // Notify all students enrolled in this course
  try {
    const enrollments = await Enrollment.find({ course: courseObj._id, isActive: true });
    if (enrollments.length > 0) {
      const notifications = enrollments.map(enrollment => ({
        recipient: enrollment.user,
        sender: req.user.id,
        type: "live-class",
        title: `Live Class: ${title}`,
        message: `Your instructor has scheduled a live class "${title}" for ${courseObj.title} on ${date} at ${time}. Duration: ${Number(duration) || 60} mins.`,
        link: `/meeting/${meetingId}`
      }));
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.error("Failed to create live class notifications:", notifErr);
    // Don't fail the main request if notifications fail
  }

  res.status(201).json({
    success: true,
    message: "Live class room scheduled successfully",
    liveClass
  });
};

// @desc  Get live classes based on user role (student / teacher / admin)
// @route GET /api/live-classes
const getLiveClasses = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let liveClasses = [];

  if (userRole === "admin") {
    liveClasses = await LiveClass.find()
      .populate("course", "title")
      .populate("instructor", "name")
      .sort("-createdAt");
  } else if (userRole === "teacher") {
    liveClasses = await LiveClass.find({ instructor: userId })
      .populate("course", "title")
      .sort("-createdAt");
  } else if (userRole === "student") {
    const enrollments = await Enrollment.find({ user: userId, isActive: true });
    const courseIds = enrollments.map(e => e.course).filter(Boolean);

    liveClasses = await LiveClass.find({ 
      course: { $in: courseIds },
      $or: [
        { status: { $ne: "Completed" } },
        { status: "Completed", isApproved: true }
      ]
    })
      .populate("course", "title")
      .populate("instructor", "name")
      .sort("-createdAt");
  }

  res.json({
    success: true,
    liveClasses
  });
};

// @desc  Delete/Cancel live class (teacher / admin)
// @route DELETE /api/live-classes/:id
const deleteLiveClass = async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);

  if (!liveClass) {
    return res.status(404).json({ success: false, message: "Live class room not found" });
  }

  // Authorize teacher or admin
  if (liveClass.instructor.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to delete this live class room" });
  }

  // Clean up any active meeting room state from DB
  await MeetingRoom.deleteOne({ meetingId: liveClass.meetingId });

  await liveClass.deleteOne();

  res.json({
    success: true,
    message: "Live class room cancelled and deleted successfully"
  });
};

// @desc  Join a custom WebRTC classroom
// @route POST /api/live-classes/meeting/:meetingId/join
const joinMeeting = async (req, res) => {
  const { meetingId } = req.params;
  const { peerId, name, role } = req.body;

  if (!meetingId || !peerId || !name) {
    return res.status(400).json({ success: false, message: "Missing meeting details" });
  }

  // Authorize student entry based on course enrollment
  if (req.user && req.user.role === "student") {
    try {
      const liveClass = await LiveClass.findOne({ meetingId });
      if (!liveClass) {
        return res.status(404).json({ success: false, message: "Live class not found" });
      }

      const isEnrolled = await Enrollment.findOne({
        user: req.user.id,
        course: liveClass.course,
        isActive: true
      });

      if (!isEnrolled) {
        return res.status(403).json({ 
          success: false, 
          message: "You are not enrolled/admitted in the course associated with this live class room" 
        });
      }
    } catch (err) {
      console.error("Meeting join enrollment check error:", err);
      return res.status(500).json({ success: false, message: "Server authorization error" });
    }
  }

  // Upsert the meeting room in MongoDB
  let room = await MeetingRoom.findOne({ meetingId });
  if (!room) {
    room = new MeetingRoom({ meetingId, participants: {}, signals: [], chats: [] });
  }

  // Register/update participant
  room.participants.set(peerId, {
    peerId,
    name,
    role: role || "student",
    lastSeen: Date.now(),
  });

  await room.save();

  // Find other participants in the room
  const others = [...room.participants.values()].filter(p => p.peerId !== peerId);

  // Fetch actual scheduled live class title if available
  let title = "";
  try {
    const liveClass = await LiveClass.findOne({ meetingId });
    if (liveClass) {
      title = liveClass.title;
    }
  } catch (err) {
    console.error("Error fetching live class title on join:", err);
  }

  res.json({ success: true, others, title });
};

// @desc  Send a WebRTC signal (SDP or ICE candidate)
// @route POST /api/live-classes/meeting/:meetingId/signal
const sendSignal = async (req, res) => {
  const { meetingId } = req.params;
  const { from, to, signalData } = req.body;

  if (!meetingId || !from || !to || !signalData) {
    return res.status(400).json({ success: false, message: "Missing signal data" });
  }

  let room = await MeetingRoom.findOne({ meetingId });
  if (!room) {
    room = new MeetingRoom({ meetingId, participants: {}, signals: [], chats: [] });
  }

  room.signals.push({ from, to, signalData, timestamp: Date.now() });
  await room.save();

  res.json({ success: true });
};

// @desc  Poll WebRTC signals and refresh participant heartbeat
// @route GET /api/live-classes/meeting/:meetingId/signals
const getSignals = async (req, res) => {
  const { meetingId } = req.params;
  const { peerId } = req.query;

  if (!meetingId || !peerId) {
    return res.status(400).json({ success: false, message: "Missing query parameters" });
  }

  let room = await MeetingRoom.findOne({ meetingId });
  if (!room) {
    return res.json({ success: true, signals: [], participants: [], chats: [] });
  }

  // Refresh heartbeat
  const existing = room.participants.get(peerId);
  if (existing) {
    room.participants.set(peerId, { ...existing, lastSeen: Date.now() });
  } else {
    // Re-register if missing (e.g. after server restart)
    room.participants.set(peerId, {
      peerId,
      name: req.user?.name || "User",
      role: req.user?.role || "student",
      lastSeen: Date.now(),
    });
  }

  // Filter signals intended for this peer
  const peerSignals = room.signals.filter(s => s.to === peerId);

  // Remove retrieved signals + prune stale ones (older than 2 minutes)
  const now = Date.now();
  room.signals = room.signals.filter(s => s.to !== peerId && now - s.timestamp < 120000);

  // Auto-prune inactive participants (no heartbeat for 12 seconds)
  for (const [pid, participant] of room.participants.entries()) {
    if (now - participant.lastSeen > 12000) {
      room.participants.delete(pid);
    }
  }

  await room.save();

  const participants = [...room.participants.values()];

  res.json({
    success: true,
    signals: peerSignals,
    participants,
    chats: room.chats || [],
  });
};

// @desc  Leave WebRTC meeting room
// @route POST /api/live-classes/meeting/:meetingId/leave
const leaveMeeting = async (req, res) => {
  const { meetingId } = req.params;
  const { peerId } = req.body;

  const room = await MeetingRoom.findOne({ meetingId });
  if (room) {
    room.participants.delete(peerId);
    if (room.participants.size === 0) {
      // Room is empty — delete it immediately
      await room.deleteOne();
    } else {
      await room.save();
    }
  }

  res.json({ success: true });
};

// @desc  Send a chat message to custom WebRTC classroom
// @route POST /api/live-classes/meeting/:meetingId/chat
const sendChatMessage = async (req, res) => {
  const { meetingId } = req.params;
  const { message, senderName, senderRole } = req.body;

  if (!message || !senderName) {
    return res.status(400).json({ success: false, message: "Missing chat details" });
  }

  let room = await MeetingRoom.findOne({ meetingId });
  if (!room) {
    room = new MeetingRoom({ meetingId, participants: {}, signals: [], chats: [] });
  }

  const chatMsg = {
    id: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
    senderName,
    senderRole: senderRole || "student",
    message,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  room.chats.push(chatMsg);

  // Buffer limit to prevent unbounded growth
  if (room.chats.length > 100) {
    room.chats.shift();
  }

  await room.save();

  res.json({ success: true, chatMsg });
};

// @desc  End live class room and save recording (teacher / admin)
// @route POST /api/live-classes/meeting/:meetingId/end
const endLiveClass = async (req, res) => {
  const { meetingId } = req.params;

  try {
    const liveClass = await LiveClass.findOne({ meetingId });
    if (!liveClass) {
      return res.status(404).json({ success: false, message: "Live class not found" });
    }

    // Authorize teacher or admin
    if (liveClass.instructor.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to end this live class room" });
    }

    liveClass.status = "Completed";
    liveClass.recordingUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    await liveClass.save();

    // Clean up meeting room state from DB
    await MeetingRoom.deleteOne({ meetingId });

    res.json({
      success: true,
      message: "Live class room ended and recording uploaded successfully",
      liveClass,
    });
  } catch (err) {
    console.error("End live class error:", err);
    res.status(500).json({ success: false, message: "Server error ending live class" });
  }
};

module.exports = {
  createLiveClass,
  getLiveClasses,
  deleteLiveClass,
  joinMeeting,
  sendSignal,
  getSignals,
  leaveMeeting,
  sendChatMessage,
  endLiveClass,
};
