const express = require("express");
const router = express.Router();
const { createLiveClass, getLiveClasses, deleteLiveClass, joinMeeting, sendSignal, getSignals, leaveMeeting, sendChatMessage, endLiveClass } = require("../controllers/liveClass.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.post("/", protect, authorize("teacher", "admin"), createLiveClass);
router.get("/", protect, getLiveClasses);
router.delete("/:id", protect, authorize("teacher", "admin"), deleteLiveClass);

// Custom WebRTC signaling endpoints
router.post("/meeting/:meetingId/join", protect, joinMeeting);
router.post("/meeting/:meetingId/signal", protect, sendSignal);
router.get("/meeting/:meetingId/signals", protect, getSignals);
router.post("/meeting/:meetingId/leave", protect, leaveMeeting);
router.post("/meeting/:meetingId/chat", protect, sendChatMessage);
router.post("/meeting/:meetingId/end", protect, authorize("teacher", "admin"), endLiveClass);

module.exports = router;
