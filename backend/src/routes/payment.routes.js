const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, getMyPayments } = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/history", protect, getMyPayments);

module.exports = router;
