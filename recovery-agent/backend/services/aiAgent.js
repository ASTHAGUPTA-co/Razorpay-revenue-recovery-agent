export async function diagnosePayment(payment) {
   const errorReason = payment.errorReason || "";
  const amount = payment.amount || 0;

  let recommended_action = "retry_link";
  let root_cause = "Transient bank network failure during transaction.";
  let reasoning = "Technical failure detected. Generating a fresh retry payment link.";
  let draft_message = null;

  if (amount > 5000000) {
    recommended_action = "escalate_human";
    root_cause = "High value payment anomaly.";
    reasoning = "High-value transaction (>₹50,000) auto-escalated for human review.";
  } 
  
  else if (errorReason.includes("otp") || errorReason.includes("funds") || errorReason.includes("declined")) {
    recommended_action = "whatsapp_nudge";
    root_cause = "Customer-side payment issue (" + errorReason + ").";
    reasoning = "Customer encountered a recoverable issue. Drafted personalized follow-up message.";
    draft_message = `Hey ${payment.customerName}! Notice kar rahe hain ki aapka payment process nahi hua. Direct retry link se complete karein: ${payment.newPaymentLink || "razorpay.me/retry"}`;
  } 
  
  else if (errorReason.includes("cancelled")) {
    recommended_action = "no_action";
    root_cause = "User explicitly closed/cancelled the payment gateway.";
    reasoning = "Payment abandoned by user; skipping outreach to prevent spam.";
  }

  return {
    root_cause,
    confidence: 0.92,
    recommended_action,
    reasoning,
    draft_message
  };
}