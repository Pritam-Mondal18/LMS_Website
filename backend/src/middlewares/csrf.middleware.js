const crypto = require("crypto");

/**
 * CSRF Protection — Double-Submit Cookie Pattern
 *
 * On every response, a CSRF token is set as a readable (non-HttpOnly) cookie
 * so that the frontend JS can read it and echo it back in the X-CSRF-Token header.
 *
 * State-mutating routes (POST, PUT, PATCH, DELETE) must include the header.
 * GET/OPTIONS/HEAD are skipped (safe methods per RFC 7231).
 *
 * Exempt paths: /api/auth/refresh, /api/health — these are called by the
 * browser directly or are read-only.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const EXEMPT_PATHS = [
  "/api/health",
  "/api/auth/refresh",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify-otp",
  "/api/auth/resend-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/contact",
];

/**
 * Middleware: issue a CSRF token cookie if not already present.
 * Always applied — even for safe methods — so the frontend gets a token on first load.
 */
const setCsrfCookie = (req, res, next) => {
  if (!req.cookies["csrf-token"]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie("csrf-token", token, {
      httpOnly: false,          // Must be readable by JS
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }
  next();
};

/**
 * Middleware: validate the CSRF token on state-mutating requests.
 * Compares the cookie value against the X-CSRF-Token header.
 */
const verifyCsrf = (req, res, next) => {
  // Skip safe HTTP methods
  if (SAFE_METHODS.has(req.method)) return next();

  // Skip explicitly exempt paths
  if (EXEMPT_PATHS.includes(req.path)) return next();

  const cookieToken = req.cookies["csrf-token"];
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({ success: false, message: "Session expired. Please refresh the page." });
  }

  // Constant-time comparison to prevent timing attacks
  const cookieBuf = Buffer.from(cookieToken);
  const headerBuf = Buffer.from(headerToken);

  if (
    cookieBuf.length !== headerBuf.length ||
    !crypto.timingSafeEqual(cookieBuf, headerBuf)
  ) {
    return res.status(403).json({ success: false, message: "Session expired. Please refresh the page." });
  }

  next();
};

module.exports = { setCsrfCookie, verifyCsrf };
