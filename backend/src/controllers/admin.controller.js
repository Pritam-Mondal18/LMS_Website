const User = require("../models/User.model");
const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");
const Payment = require("../models/Payment.model");
const Test = require("../models/Test.model");
const Result = require("../models/Result.model");
const Blog = require("../models/Blog.model");
const Testimonial = require("../models/Testimonial.model");
const Notification = require("../models/Notification.model");
const Assignment = require("../models/Assignment.model");
const Ticket = require("../models/Ticket.model");
const Settings = require("../models/Settings.model");
const LiveClass = require("../models/LiveClass.model");

// @desc  Admin dashboard stats
// @route GET /api/admin/stats
const getAdminStats = async (req, res) => {
  const [
    totalStudents, totalTeachers, totalCourses,
    pendingCourses, pendingTeachers, recentStudents, recentPayments,
    totalEnrollments, successfulPaymentsCount, pendingPaymentsCount, refundedPaymentsCount
  ] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    Course.countDocuments({ isPublished: true }),
    Course.countDocuments({ isApproved: false, isPublished: true }),
    User.countDocuments({ role: "teacher", isApproved: false }),
    User.find({ role: "student" }).sort("-createdAt").limit(5).select("name email avatar createdAt"),
    Payment.find({ status: "paid" }).sort("-createdAt").limit(5).populate("user", "name email").populate("course", "title"),
    Enrollment.countDocuments(),
    Payment.countDocuments({ status: "paid" }),
    Payment.countDocuments({ status: "pending" }),
    Payment.countDocuments({ status: "refunded" })
  ]);

  const [totalRevenueAgg, pendingAmountAgg, refundedAmountAgg] = await Promise.all([
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Payment.aggregate([
      { $match: { status: "refunded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const pendingPaymentsAmount = pendingAmountAgg[0]?.total || 0;
  const refundedPaymentsAmount = refundedAmountAgg[0]?.total || 0;

  // Monthly revenue for chart (last 6 months)
  const monthlyRevenue = await Payment.aggregate([
    { $match: { status: "paid", createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Student growth (last 6 months)
  const studentGrowth = await User.aggregate([
    { $match: { role: "student", createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Aggregate enrollments by course category
  const categoryStats = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseInfo",
      },
    },
    { $unwind: "$courseInfo" },
    {
      $group: {
        _id: "$courseInfo.category",
        count: { $sum: 1 },
      },
    },
  ]);

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalRevenue,
      pendingCourses,
      pendingTeachers,
      totalEnrollments,
      successfulPaymentsCount,
      pendingPaymentsCount,
      pendingPaymentsAmount,
      refundedPaymentsCount,
      refundedPaymentsAmount,
      categoryStats
    },
    charts: { monthlyRevenue, studentGrowth },
    recentStudents,
    recentPayments,
  });
};

// @desc  Get all users
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  const { role, page = 1, limit = 20, search, isBanned } = req.query;
  const query = {};
  if (role) query.role = role;
  if (isBanned !== undefined) query.isBanned = isBanned === "true";
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const skip = (page - 1) * limit;
  const [usersList, total] = await Promise.all([
    User.find(query).sort("-createdAt").skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  const users = await Promise.all(
    usersList.map(async (u) => {
      if (u.role !== "teacher") return u.toObject();
      const courses = await Course.find({ instructor: u._id }).select("_id");
      const courseIds = courses.map((c) => c._id);
      const salesAgg = await Payment.aggregate([
        { $match: { course: { $in: courseIds }, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return {
        ...u.toObject(),
        totalSales: salesAgg[0]?.total || 0,
      };
    })
  );

  res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// @desc  Ban/Unban user
// @route PATCH /api/admin/users/:id/ban
const toggleBanUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot ban admin." });

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({ success: true, message: user.isBanned ? "User banned." : "User unbanned.", isBanned: user.isBanned });
};

// @desc  Approve teacher
// @route PATCH /api/admin/teachers/:id/approve
const approveTeacher = async (req, res) => {
  const teacher = await User.findById(req.params.id);
  if (!teacher || teacher.role !== "teacher") {
    return res.status(404).json({ success: false, message: "Teacher not found." });
  }
  teacher.isApproved = !teacher.isApproved;
  await teacher.save();

  res.json({ success: true, message: teacher.isApproved ? "Teacher approved." : "Teacher approval revoked." });
};

// @desc  Approve/Reject course
// @route PATCH /api/admin/courses/:id/approve
const approveCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found." });

  course.isApproved = !course.isApproved;
  await course.save();

  res.json({ success: true, message: course.isApproved ? "Course approved." : "Course approval revoked." });
};

// @desc  Approve/Reject completed live class recording
// @route PATCH /api/admin/live-classes/:id/approve
const approveLiveClass = async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id);
  if (!liveClass) return res.status(404).json({ success: false, message: "Live class not found." });

  liveClass.isApproved = !liveClass.isApproved;
  await liveClass.save();

  res.json({ 
    success: true, 
    message: liveClass.isApproved ? "Live class recording approved." : "Live class recording approval revoked.",
    isApproved: liveClass.isApproved
  });
};

// @desc  Get all payments
// @route GET /api/admin/payments
const getAllPayments = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate("user", "name email avatar")
      .populate("course", "title thumbnail")
      .sort("-createdAt").skip(skip).limit(Number(limit)),
    Payment.countDocuments(query),
  ]);

  res.json({ success: true, payments, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// @desc  Delete user (admin)
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  if (user.role === "admin") return res.status(403).json({ success: false, message: "Cannot delete admin." });
  await user.deleteOne();
  res.json({ success: true, message: "User deleted." });
};

// @desc  Send push notification to all users
// @route POST /api/admin/notifications/broadcast
const broadcastNotification = async (req, res) => {
  const { title, message, type = "announcement", targetRole } = req.body;
  const query = targetRole ? { role: targetRole } : {};
  const users = await User.find(query).select("_id");

  const notifications = users.map((u) => ({
    recipient: u._id,
    sender: req.user._id,
    title,
    message,
    type,
  }));

  await Notification.insertMany(notifications);
  res.json({ success: true, message: `Notification sent to ${users.length} users.` });
};

// @desc  Get admin courses list
// @route GET /api/admin/courses
const getAllCourses = async (req, res) => {
  const { page = 1, limit = 20, isApproved, isPublished } = req.query;
  const query = {};
  if (isApproved !== undefined) query.isApproved = isApproved === "true";
  if (isPublished !== undefined) query.isPublished = isPublished === "true";

  const skip = (page - 1) * limit;
  const [courses, total] = await Promise.all([
    Course.find(query).populate("instructor", "name email avatar").sort("-createdAt").skip(skip).limit(Number(limit)),
    Course.countDocuments(query),
  ]);

  res.json({ success: true, courses, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
};

// @desc  Get all enrollments
// @route GET /api/admin/enrollments
const getAllEnrollments = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [enrollments, total] = await Promise.all([
    Enrollment.find()
      .populate("user", "name email avatar")
      .populate("course", "title category price")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Enrollment.countDocuments(),
  ]);

  res.json({
    success: true,
    enrollments,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

// @desc  Get all assignments
// @route GET /api/admin/assignments
const getAllAssignments = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    Assignment.find()
      .populate("course", "title category")
      .populate("instructor", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Assignment.countDocuments(),
  ]);

  res.json({
    success: true,
    assignments,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

// @desc  Delete blog post
// @route DELETE /api/admin/blogs/:id
const deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found." });
  }
  await blog.deleteOne();
  res.json({ success: true, message: "Blog post deleted." });
};

// @desc  Toggle publish status of a blog post
// @route PATCH /api/admin/blogs/:id/publish
const togglePublishBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found." });
  }
  blog.isPublished = !blog.isPublished;
  await blog.save();

  res.json({
    success: true,
    message: blog.isPublished ? "Blog post published." : "Blog post unpublished.",
    isPublished: blog.isPublished,
  });
};

// @desc  Get all blogs (published and drafts)
// @route GET /api/admin/blogs
const getAllBlogs = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    Blog.find()
      .populate("author", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Blog.countDocuments(),
  ]);

  res.json({
    success: true,
    blogs,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

// @desc  Get all tickets
// @route GET /api/admin/tickets
const getAllTickets = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find()
      .populate("user", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    Ticket.countDocuments(),
  ]);

  res.json({
    success: true,
    tickets,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
};

// @desc  Update ticket status and priority
// @route PATCH /api/admin/tickets/:id
const updateTicket = async (req, res) => {
  const { status, priority } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    return res.status(404).json({ success: false, message: "Ticket not found." });
  }

  if (status) ticket.status = status;
  if (priority) ticket.priority = priority;
  await ticket.save();

  res.json({ success: true, message: "Ticket updated successfully.", ticket });
};

// @desc  Get system settings
// @route GET /api/admin/settings
const getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json({ success: true, settings });
};

// @desc  Update system settings
// @route PUT /api/admin/settings
const updateSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings({});
  }

  Object.assign(settings, req.body);
  await settings.save();

  res.json({ success: true, message: "Settings updated successfully.", settings });
};

module.exports = {
  getAdminStats, getAllUsers, toggleBanUser, approveTeacher, approveCourse, approveLiveClass,
  getAllPayments, deleteUser, broadcastNotification, getAllCourses,
  getAllEnrollments, getAllAssignments, deleteBlog, togglePublishBlog, getAllBlogs,
  getAllTickets, updateTicket, getSettings, updateSettings
};
