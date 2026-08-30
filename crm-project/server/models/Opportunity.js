const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    stage: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"],
      default: "New",
    },
    value: { type: Number, required: true, min: 0, default: 0 },
    expectedCloseDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lostReason: { type: String, trim: true },
  },
  { timestamps: true }
);

opportunitySchema.index({ stage: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);
