const express = require("express");
const router = express.Router();
const {
  getAdminStats, getAllUsers, toggleBanUser, approveTeacher, approveCourse, approveLiveClass,
  getAllPayments, deleteUser, broadcastNotification, getAllCourses,
  getAllEnrollments, getAllAssignments, deleteBlog, togglePublishBlog, getAllBlogs,
  getAllTickets, updateTicket, getSettings, updateSettings
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Restrict all routes to Admin role only
router.use(protect, authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/ban", toggleBanUser);
router.delete("/users/:id", deleteUser);

router.patch("/teachers/:id/approve", approveTeacher);
router.get("/courses", getAllCourses);
router.patch("/courses/:id/approve", approveCourse);
router.patch("/live-classes/:id/approve", approveLiveClass);
router.get("/payments", getAllPayments);

router.get("/enrollments", getAllEnrollments);
router.get("/assignments", getAllAssignments);
router.get("/blogs", getAllBlogs);
router.delete("/blogs/:id", deleteBlog);
router.patch("/blogs/:id/publish", togglePublishBlog);

router.get("/tickets", getAllTickets);
router.patch("/tickets/:id", updateTicket);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

router.post("/notifications/broadcast", broadcastNotification);

module.exports = router;
