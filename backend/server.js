require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const errorHandler = require("./src/middlewares/errorHandler");
const { setCsrfCookie, verifyCsrf } = require("./src/middlewares/csrf.middleware");

// Route imports
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const courseRoutes = require("./src/routes/course.routes");
const lessonRoutes = require("./src/routes/lesson.routes");
const testRoutes = require("./src/routes/test.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const adminRoutes = require("./src/routes/admin.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const blogRoutes = require("./src/routes/blog.routes");
const notificationRoutes = require("./src/routes/notification.routes");
const assignmentRoutes = require("./src/routes/assignment.routes");
const uploadRoutes = require("./src/routes/upload.routes");
const liveClassRoutes = require("./src/routes/liveClass.routes");
const path = require("path");

const app = express();

// app.use(express.static("public"))

// Connect to DB
connectDB();

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      // Return origin string to produce valid Access-Control-Allow-Origin header with credentials
      return callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(mongoSanitize());
app.use(xssClean());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again in an hour." },
});
app.use("/api/auth", authLimiter);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CSRF protection — issue token cookie on all responses, validate on mutations
app.use(setCsrfCookie);
app.use("/api", verifyCsrf);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/live-classes", liveClassRoutes);

// Dynamic range-supporting uploads streamer
const { streamFile } = require("./src/controllers/upload.controller");
app.get("/uploads/:filename", streamFile);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Sumit Chakraborty Academy API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📚 Sumit Chakraborty Academy API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
