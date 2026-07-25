const User = require("../models/User.model");

// @desc  Get user profile
// @route GET /api/users/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -refreshToken -otp -otpExpiry");
  res.json({ success: true, user });
};

// @desc  Update user profile
// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, phone, bio, qualification, experience, specialization, darkMode, notifications } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;
  if (qualification !== undefined) updates.qualification = qualification;
  if (experience !== undefined) updates.experience = experience;
  if (specialization !== undefined) updates.specialization = specialization;
  if (darkMode !== undefined) updates.darkMode = darkMode;
  if (notifications !== undefined) updates.notifications = notifications;

  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select("-password");
  res.json({ success: true, message: "Profile updated successfully", user });
};

// @desc  Toggle wishlist course
// @route POST /api/users/wishlist/:courseId
const toggleWishlist = async (req, res) => {
  const { courseId } = req.params;
  const user = await User.findById(req.user.id);
  
  const index = user.wishlist.indexOf(courseId);
  let message = "";
  if (index === -1) {
    user.wishlist.push(courseId);
    message = "Course added to wishlist";
  } else {
    user.wishlist.splice(index, 1);
    message = "Course removed from wishlist";
  }
  await user.save();
  res.json({ success: true, message, wishlist: user.wishlist });
};

module.exports = { getProfile, updateProfile, toggleWishlist };
