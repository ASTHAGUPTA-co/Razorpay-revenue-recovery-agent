import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";

dotenv.config();

// A realistic-ish spread of failure reasons, matching what Razorpay actually
// returns. Mixing transient/technical, customer-side, and ambiguous/high-risk
// cases gives your agent's decisions something interesting to differentiate.
const FAILURE_TEMPLATES = [
  { errorCode: "GATEWAY_ERROR", errorReason: "payment_failed", errorDescription: "Bank server timed out" },
  { errorCode: "GATEWAY_ERROR", errorReason: "payment_failed", errorDescription: "Network issue during authorization" },
  { errorCode: "BAD_REQUEST_ERROR", errorReason: "insufficient_funds", errorDescription: "Insufficient balance in account" },
  { errorCode: "BAD_REQUEST_ERROR", errorReason: "otp_incorrect", errorDescription: "Customer entered wrong OTP thrice" },
  { errorCode: "BAD_REQUEST_ERROR", errorReason: "card_declined", errorDescription: "Issuing bank declined the card" },
  { errorCode: "GATEWAY_ERROR", errorReason: "payment_cancelled", errorDescription: "Customer closed the payment page" },
  { errorCode: "SERVER_ERROR", errorReason: "internal_error", errorDescription: "Razorpay internal error, rare" },
];

const NAMES = [
  "Aarav Sharma", "Priya Nair", "Rohan Gupta", "Sneha Iyer", "Vikram Singh",
  "Ananya Reddy", "Karan Mehta", "Divya Joshi", "Arjun Kumar", "Ishita Rao",
  "Rahul Verma", "Meera Pillai", "Aditya Bansal", "Kavya Menon", "Siddharth Rao",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await connectDB();
  await Payment.deleteMany({});

  const payments = [];
  for (let i = 0; i < 60; i++) {
    const template = randomFrom(FAILURE_TEMPLATES);
    const name = randomFrom(NAMES);
    const isHighValue = Math.random() < 0.1; // 10% high-value edge cases

    payments.push({
      razorpayPaymentId: `pay_SYN${1000 + i}`,
      razorpayOrderId: `order_SYN${1000 + i}`,
      customerName: name,
      customerEmail: `${name.toLowerCase().replace(" ", ".")}@example.com`,
      customerPhone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
      amount: isHighValue
        ? Math.floor(5500000 + Math.random() * 4000000) // ₹55,000+
        : Math.floor(50000 + Math.random() * 900000), // ₹500 - ₹9,500
      currency: "INR",
      errorCode: template.errorCode,
      errorReason: template.errorReason,
      errorDescription: template.errorDescription,
      status: "failed",
      attempts: 0,
      maxAttempts: 3,
    });
  }

  await Payment.insertMany(payments);
  console.log(`[seed] inserted ${payments.length} synthetic failed payments`);
  await mongoose.connection.close();
}

seed();
