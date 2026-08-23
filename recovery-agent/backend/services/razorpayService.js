import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Creates a real Razorpay TEST-mode payment link for a failed payment retry.
export async function createRetryPaymentLink(payment) {
  try {
    const link = await razorpay.paymentLink.create({
      amount: payment.amount,
      currency: payment.currency || "INR",
      description: `Retry payment for order ${payment.razorpayOrderId || payment.razorpayPaymentId}`,
      customer: {
        name: payment.customerName,
        email: payment.customerEmail,
        contact: payment.customerPhone,
      },
      notify: { sms: false, email: false },
      reminder_enable: false,
    });
    return { success: true, url: link.short_url, id: link.id };
  } catch (err) {
    return { success: false, error: err?.error?.description || err.message };
  }
}
