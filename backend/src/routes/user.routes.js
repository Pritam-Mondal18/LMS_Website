const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, toggleWishlist } = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validate, updateProfileRules } = require("../middlewares/validation.middleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfileRules, validate, updateProfile);
router.post("/wishlist/:courseId", protect, toggleWishlist);

module.exports = router;
