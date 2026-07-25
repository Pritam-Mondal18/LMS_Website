const jwt = require("jsonwebtoken");

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
};

const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  const cookieOptions = getCookieOptions();

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
    .json({
      success: true,
      message,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
      },
    });
};

module.exports = { generateAccessToken, generateRefreshToken, getCookieOptions, sendTokenResponse };

