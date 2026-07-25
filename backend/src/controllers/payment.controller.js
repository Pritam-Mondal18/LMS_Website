const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment.model");
const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");
const User = require("../models/User.model");
const { createEnrollment } = require("../services/enrollment.service");

let razorpayInstance;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== "your_razorpay_key_id") {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.log("Razorpay initialization skipped or failed: ", e.message);
}

// @desc  Create order for course purchase
// @route POST /api/payments/create-order
const createOrder = async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: "Course not found" });
  }

  // Check if already enrolled
  const existing = await Enrollment.findOne({ user: req.user.id, course: courseId });
  if (existing) {
    return res.status(400).json({ success: false, message: "Already enrolled in this course" });
  }

  const finalAmount = course.discountPrice || course.price;

  // If Razorpay credentials are not configured, handle mock checkout
  if (!razorpayInstance) {
    const mockOrderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const payment = await Payment.create({
      user: req.user.id,
      course: courseId,
      orderId: mockOrderId,
      amount: finalAmount,
      status: "pending",
      method: "mock",
    });

    return res.json({
      success: true,
      isMock: true,
      order: {
        id: mockOrderId,
        amount: finalAmount * 100,
        currency: "INR",
      },
      paymentId: payment._id,
    });
  }

  const options = {
    amount: finalAmount * 100, // in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);

    await Payment.create({
      user: req.user.id,
      course: courseId,
      orderId: order.id,
      amount: finalAmount,
      status: "pending",
      method: "razorpay",
    });

    res.json({
      success: true,
      isMock: false,
      order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Razorpay order creation failed", error: error.message });
  }
};

// @desc  Verify Payment and Enroll Student
// @route POST /api/payments/verify
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

  if (isMock) {
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    payment.status = "paid";
    payment.paymentId = `pay_mock_${Date.now()}`;
    payment.paidAt = new Date();
    await payment.save();

    await createEnrollment({ userId: payment.user, courseId: payment.course, paymentId: payment._id });

    return res.json({ success: true, message: "Mock payment successful and enrollment created!" });
  }

  // Real Razorpay verification
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment verification failed (signature mismatch)" });
  }

  const payment = await Payment.findOne({ orderId: razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment record not found" });
  }

  payment.status = "paid";
  payment.paymentId = razorpay_payment_id;
  payment.signature = razorpay_signature;
  payment.paidAt = new Date();
  await payment.save();

  await createEnrollment({ userId: payment.user, courseId: payment.course, paymentId: payment._id });

  res.json({ success: true, message: "Payment verified and enrollment successful!" });
};

// @desc  Get payment history of current user
// @route GET /api/payments/history
const getMyPayments = async (req, res) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate("course", "title thumbnail slug")
    .sort("-createdAt");
  res.json({ success: true, payments });
};

module.exports = { createOrder, verifyPayment, getMyPayments };
