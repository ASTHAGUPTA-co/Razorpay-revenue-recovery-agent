import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    
    razorpayPaymentId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String },

    customerName: { type: String, required: true },
    customerEmail: { type: String },
    customerPhone: { type: String },

    amount: { type: Number, required: true }, 
    currency: { type: String, default: "INR" },

    
    errorCode: { type: String, required: true }, 
    errorReason: { type: String, required: true }, 
    errorDescription: { type: String },

    status: {
      type: String,
      enum: ["failed", "recovering", "recovered", "escalated", "abandoned"],
      default: "failed",
    },

    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },

    newPaymentLink: { type: String }, 
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
