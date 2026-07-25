const Notification = require("../models/Notification.model");

// @desc  Get user notifications
// @route GET /api/notifications
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .sort("-createdAt")
    .limit(50);
  res.json({ success: true, notifications });
};

// @desc  Mark notification as read
// @route PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  res.json({ success: true, notification });
};

// @desc  Mark all notifications as read
// @route PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  res.json({ success: true, message: "All notifications marked as read" });
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
