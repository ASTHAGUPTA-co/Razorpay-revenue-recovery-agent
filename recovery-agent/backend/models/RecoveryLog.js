import mongoose from "mongoose";

// This collection IS your audit trail. Every AI decision and every action
// taken gets one row here, whether it succeeded or not. Judges will look at
// this table to see if your agent's money-actions are explainable.
const recoveryLogSchema = new mongoose.Schema(
  {
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },

    // --- what the AI decided ---
    rootCause: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1 },
    recommendedAction: {
      type: String,
      enum: ["retry_link", "whatsapp_nudge", "escalate_human", "no_action"],
      required: true,
    },
    reasoning: { type: String }, // short explanation, shown in UI for transparency
    draftMessage: { type: String },

    // --- what actually happened when we executed it ---
    executedAction: { type: String },
    executionResult: {
      type: String,
      enum: ["success", "failed", "skipped"],
    },
    executionDetail: { type: String },

    // --- outcome tracking for your metrics dashboard ---
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
