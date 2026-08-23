import express from "express";
import Payment from "../models/Payment.js";
import RecoveryLog from "../models/RecoveryLog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const total = await Payment.countDocuments();
  const recovered = await Payment.countDocuments({ status: "recovered" });
  const escalated = await Payment.countDocuments({ status: "escalated" });
  const abandoned = await Payment.countDocuments({ status: "abandoned" });
  const stillFailed = await Payment.countDocuments({ status: "failed" });

  const recoveredPayments = await Payment.find({ status: "recovered" });
  const amountRecovered = recoveredPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalAttempted = await Payment.countDocuments({ status: { $ne: "failed" } });
  const recoveryRate = totalAttempted > 0 ? recovered / totalAttempted : 0;

  const exceptions = await Payment.find({ status: "escalated" }).select(
    "customerName amount errorReason attempts"
  );

  res.json({
    totalPayments: total,
    recovered,
    escalated,
    abandoned,
    stillFailed,
    amountRecoveredPaise: amountRecovered,
    amountRecoveredRupees: (amountRecovered / 100).toFixed(2),
    recoveryRate: (recoveryRate * 100).toFixed(1) + "%",
    exceptions,
  });
});

export default router;
