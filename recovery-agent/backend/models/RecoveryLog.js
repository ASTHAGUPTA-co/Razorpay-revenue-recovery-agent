import mongoose from "mongoose";

const recoveryLogSchema = new mongoose.Schema(
  {
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },

    rootCause: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1 },
    recommendedAction: {
      type: String,
      enum: ["retry_link", "whatsapp_nudge", "escalate_human", "no_action"],
      required: true,
    },
    reasoning: { type: String }, 
    draftMessage: { type: String },

    executedAction: { type: String },
    executionResult: {
      type: String,
      enum: ["success", "failed", "skipped"],
    },
    executionDetail: { type: String },

    outcome: {
      type: String,
      enum: ["pending", "recovered", "no_response", "escalated", "gave_up"],
      default: "pending",
    },
    amountRecovered: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("RecoveryLog", recoveryLogSchema);
