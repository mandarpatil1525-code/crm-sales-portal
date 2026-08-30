const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: {
      type: String,
      enum: ["website", "referral", "cold_call", "social_media", "event", "advertisement", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "unqualified", "converted"],
      default: "new",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, trim: true },
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    convertedToOpportunity: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", default: null },
    isDuplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
  },
  { timestamps: true }
);

leadSchema.index({ companyName: "text", contactName: "text", email: "text" });

module.exports = mongoose.model("Lead", leadSchema);
