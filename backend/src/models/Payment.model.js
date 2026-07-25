const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    orderId: { type: String, required: true },
    paymentId: String,
    signature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    method: { type: String, default: "razorpay" },
    couponCode: String,
    discountAmount: { type: Number, default: 0 },
    originalAmount: Number,
    invoiceNumber: String,
    invoiceUrl: String,
    paidAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Auto-generate invoice number
paymentSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `SCA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
