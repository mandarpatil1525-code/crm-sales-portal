const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    type: { type: String, enum: ["call", "meeting", "note", "email"], default: "note" },
    summary: { type: String, required: true, trim: true },
    nextFollowUpDate: { type: Date, default: null },
    isFollowUpDone: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
