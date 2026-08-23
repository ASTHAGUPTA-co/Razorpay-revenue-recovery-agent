import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // Razorpay-style identifiers (synthetic for demo, real if you wire live webhooks)
    razorpayPaymentId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String },

    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },

    amount: { type: Number, required: true }, // in paise, like Razorpay
    currency: { type: String, default: "INR" },

    // What Razorpay actually gives you on a failed payment
    errorCode: { type: String, required: true }, // e.g. BAD_REQUEST_ERROR, GATEWAY_ERROR
    errorReason: { type: String, required: true }, // e.g. payment_failed, insufficient_funds
    errorDescription: { type: String },

    status: {
      type: String,
      enum: ["failed", "recovering", "recovered", "escalated", "abandoned"],
      default: "failed",
    },

    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },

    newPaymentLink: { type: String }, // filled in if we generate a retry link
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
