const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// Protect route - verify JWT
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Check cookie
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -refreshToken -otp");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: "Your account has been banned." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account is deactivated." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired.", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// Role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`,
      });
    }
    next();
  };
};

// Optional auth (doesn't block if no token)
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password -refreshToken -otp");
    } catch {
      // ignore
    }
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
