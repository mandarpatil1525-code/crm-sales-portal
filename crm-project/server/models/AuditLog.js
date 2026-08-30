const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    method: { type: String },
    path: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
