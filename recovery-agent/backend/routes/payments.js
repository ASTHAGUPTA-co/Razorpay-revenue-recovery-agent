import express from "express";
import Payment from "../models/Payment.js";
import RecoveryLog from "../models/RecoveryLog.js";
import { diagnosePayment } from "../services/aiAgent.js";
import { createRetryPaymentLink } from "../services/razorpayService.js";

const router = express.Router();

// GET /api/payments - the queue view
router.get("/", async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

router.get("/:id", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: "not found" });
  const logs = await RecoveryLog.find({ payment: payment._id }).sort({ createdAt: 1 });
  res.json({ payment, logs });
});


router.post("/:id/process", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: "not found" });

 
  if (payment.attempts >= payment.maxAttempts) {
    payment.status = "escalated";
    await payment.save();
    return res.json({ payment, note: "max attempts reached, auto-escalated" });
  }

  const diagnosis = await diagnosePayment(payment);

  const log = new RecoveryLog({
    payment: payment._id,
    rootCause: diagnosis.root_cause,
    confidence: diagnosis.confidence,
    recommendedAction: diagnosis.recommended_action,
    reasoning: diagnosis.reasoning,
    draftMessage: diagnosis.draft_message,
  });

 
  if (diagnosis.recommended_action === "retry_link") {
    const result = await createRetryPaymentLink(payment);
    if (result.success) {
      payment.newPaymentLink = result.url;
      log.executedAction = "retry_link";
      log.executionResult = "success";
      log.executionDetail = result.url;
      payment.status = "recovering";
    } else {
      log.executedAction = "retry_link";
      log.executionResult = "failed";
      log.executionDetail = result.error;
      // Graceful failure: Razorpay API rejected it -> escalate instead of crashing
      payment.status = "escalated";
      log.outcome = "escalated";
    }
  } else if (diagnosis.recommended_action === "whatsapp_nudge") {
    log.executedAction = "whatsapp_nudge_drafted";
    log.executionResult = "success";
    log.executionDetail = diagnosis.draft_message;
    payment.status = "recovering";
  } else if (diagnosis.recommended_action === "escalate_human") {
    log.executedAction = "escalate_human";
    log.executionResult = "skipped";
    log.outcome = "escalated";
    payment.status = "escalated";
  } else {
    log.executedAction = "no_action";
    log.executionResult = "skipped";
    payment.status = "abandoned";
  }

  payment.attempts += 1;
  await payment.save();
  await log.save();

  res.json({ payment, log });
});


router.post("/:id/mark-recovered", async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: "not found" });

  payment.status = "recovered";
  await payment.save();

  const latestLog = await RecoveryLog.findOne({ payment: payment._id }).sort({ createdAt: -1 });
  if (latestLog) {
    latestLog.outcome = "recovered";
    latestLog.amountRecovered = payment.amount;
    await latestLog.save();
  }

  res.json({ payment });
});


router.post("/process-batch", async (req, res) => {
  const pending = await Payment.find({ status: "failed" });
  const results = [];

  for (const payment of pending) {
    const diagnosis = await diagnosePayment(payment);
    const log = new RecoveryLog({
      payment: payment._id,
      rootCause: diagnosis.root_cause,
      confidence: diagnosis.confidence,
      recommendedAction: diagnosis.recommended_action,
      reasoning: diagnosis.reasoning,
      draftMessage: diagnosis.draft_message,
    });

    if (diagnosis.recommended_action === "retry_link") {
      const result = await createRetryPaymentLink(payment);
      if (result.success) {
        payment.newPaymentLink = result.url;
        log.executedAction = "retry_link";
        log.executionResult = "success";
        log.executionDetail = result.url;
        payment.status = "recovering";
      } else {
        log.executedAction = "retry_link";
        log.executionResult = "failed";
        log.executionDetail = result.error;
        payment.status = "escalated";
        log.outcome = "escalated";
      }
    } else if (diagnosis.recommended_action === "whatsapp_nudge") {
      log.executedAction = "whatsapp_nudge_drafted";
      log.executionResult = "success";
      log.executionDetail = diagnosis.draft_message;
      payment.status = "recovering";
    } else if (diagnosis.recommended_action === "escalate_human") {
      log.executedAction = "escalate_human";
      log.executionResult = "skipped";
      log.outcome = "escalated";
      payment.status = "escalated";
    } else {
      log.executedAction = "no_action";
      log.executionResult = "skipped";
      payment.status = "abandoned";
    }

    payment.attempts += 1;
    await payment.save();
    await log.save();
    results.push({ paymentId: payment._id, action: diagnosis.recommended_action });
  }

  res.json({ processed: results.length, results });
});

export default router;
