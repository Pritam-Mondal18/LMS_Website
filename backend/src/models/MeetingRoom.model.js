const mongoose = require("mongoose");

/**
 * MeetingRoom — persists live WebRTC room state in MongoDB.
 *
 * Replaces the in-memory `activeRooms` object so that server restarts
 * no longer evict all participants and pending signals.
 *
 * TTL: Rooms are automatically deleted 2 hours after their last update
 * (covers the longest likely class duration).
 */
const meetingRoomSchema = new mongoose.Schema(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: {
      type: Map,
      of: new mongoose.Schema(
        {
          peerId:    { type: String, required: true },
          name:      { type: String, required: true },
          role:      { type: String, default: "student" },
          lastSeen:  { type: Number, default: () => Date.now() },
        },
        { _id: false }
      ),
      default: {},
    },
    signals: [
      {
        from:       { type: String, required: true },
        to:         { type: String, required: true },
        signalData: { type: mongoose.Schema.Types.Mixed, required: true },
        timestamp:  { type: Number, default: () => Date.now() },
        _id:        false,
      },
    ],
    chats: [
      {
        id:         { type: String, required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, default: "student" },
        message:    { type: String, required: true },
        timestamp:  { type: String },
        _id:        false,
      },
    ],
    // TTL field: Mongoose/MongoDB auto-deletes the document 7200 seconds
    // (2 hours) after this timestamp is last set.
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

/**
 * Refresh the TTL whenever the document is saved (e.g. heartbeat polling).
 */
meetingRoomSchema.pre("save", function (next) {
  this.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  next();
});

module.exports = mongoose.model("MeetingRoom", meetingRoomSchema);
