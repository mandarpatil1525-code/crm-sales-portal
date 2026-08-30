const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    originatingLead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    accountOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

customerSchema.index({ companyName: "text", contactName: "text", email: "text" });

module.exports = mongoose.model("Customer", customerSchema);
