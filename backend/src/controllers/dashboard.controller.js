const Enrollment = require("../models/Enrollment.model");
const Course = require("../models/Course.model");
const Result = require("../models/Result.model");
const Assignment = require("../models/Assignment.model");
const Notification = require("../models/Notification.model");
const Payment = require("../models/Payment.model");
const LiveClass = require("../models/LiveClass.model");

// @desc  Get student dashboard overview data
// @route GET /api/dashboard/student
const getStudentDashboard = async (req, res) => {
  const userId = req.user.id;

  const [enrollments, results, notifications] = await Promise.all([
    Enrollment.find({ user: userId }).populate("course", "title thumbnail slug subject category totalLessons lessons"),
    Result.find({ user: userId }).populate("test", "title totalMarks"),
    Notification.find({ recipient: userId }).sort("-createdAt").limit(5),
  ]);

  // Filter out any enrollments whose associated course was deleted (null populated course)
  const validEnrollments = enrollments.filter(e => e.course !== null);
  const ongoingCourses = validEnrollments.filter(e => !e.isCompleted);
  const completedCourses = validEnrollments.filter(e => e.isCompleted);
  
  // Calculate average performance
  const avgTestScore = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + r.percentageScore, 0) / results.length)
    : 0;

  // Fetch assignments for student's enrolled courses
  const courseIds = validEnrollments.filter(e => e.isActive).map(e => e.course?._id).filter(Boolean);
  const [assignments, liveClasses] = await Promise.all([
    Assignment.find({ course: { $in: courseIds } })
      .populate("course", "title slug subject")
      .sort("-createdAt"),
    LiveClass.find({ course: { $in: courseIds } })
      .populate("course", "title")
      .populate("instructor", "name")
      .sort("-createdAt")
  ]);

  // TODO: Implement persistent user activity/study hours logging to draw dynamic chart data
  const learningProgress = [
    { name: "Mon", hours: 1.5, isSample: true },
    { name: "Tue", hours: 2.0, isSample: true },
    { name: "Wed", hours: 0.8, isSample: true },
    { name: "Thu", hours: 3.2, isSample: true },
    { name: "Fri", hours: 1.1, isSample: true },
    { name: "Sat", hours: 2.5, isSample: true },
    { name: "Sun", hours: 1.7, isSample: true },
  ];

  res.json({
    success: true,
    stats: {
      enrolledCount: validEnrollments.length,
      ongoingCount: ongoingCourses.length,
      completedCount: completedCourses.length,
      avgTestScore,
      totalStreak: req.user.streak || 3,
    },
    learningProgress,
    courses: validEnrollments,
    enrollments: validEnrollments,
    results,
    notifications,
    assignments,
    liveClasses,
  });
};

// @desc  Get teacher dashboard overview data
// @route GET /api/dashboard/teacher
const getTeacherDashboard = async (req, res) => {
  const userId = req.user.id;

  const courses = await Course.find({ instructor: userId });
  const courseIds = courses.map(c => c._id);

  const [enrollments, assignments, paidPayments, liveClasses] = await Promise.all([
    Enrollment.find({ course: { $in: courseIds } }).populate("user", "name email avatar"),
    Assignment.find({ course: { $in: courseIds } })
      .populate("submissions.student", "name email avatar")
      .populate("course", "title"),
    Payment.find({ course: { $in: courseIds }, status: "paid" }),
    LiveClass.find({ instructor: userId })
      .populate("course", "title")
      .sort("-createdAt")
  ]);

  // Aggregate stats
  const totalStudents = enrollments.length;
  const courseEnrolledMap = {};
  enrollments.forEach(e => {
    courseEnrolledMap[e.course.toString()] = (courseEnrolledMap[e.course.toString()] || 0) + 1;
  });

  const coursePopularity = courses.map(c => ({
    title: c.title,
    students: courseEnrolledMap[c._id.toString()] || 0,
  }));

  // Calculate actual total earnings
  const totalEarnings = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Group paid payments of the last 5 months dynamically
  const earningsOverview = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    
    const monthlySum = paidPayments.reduce((sum, p) => {
      const pDate = new Date(p.paidAt || p.createdAt);
      if (pDate.getMonth() === d.getMonth() && pDate.getFullYear() === year) {
        return sum + (p.amount || 0);
      }
      return sum;
    }, 0);
    
    earningsOverview.push({
      month: monthName,
      earnings: monthlySum
    });
  }

  res.json({
    success: true,
    stats: {
      courseCount: courses.length,
      totalStudents,
      totalEarnings,
      assignmentsCount: assignments.length,
    },
    coursePopularity,
    earningsOverview,
    courses,
    recentStudents: enrollments.slice(0, 5).map(e => e.user),
    assignments,
    liveClasses,
  });
};

module.exports = { getStudentDashboard, getTeacherDashboard };
