const express = require("express");
const router = express.Router();
const { getStudentDashboard, getTeacherDashboard } = require("../controllers/dashboard.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

router.get("/student", protect, authorize("student", "admin"), getStudentDashboard);
router.get("/teacher", protect, authorize("teacher", "admin"), getTeacherDashboard);

module.exports = router;
