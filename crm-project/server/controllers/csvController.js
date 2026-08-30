const Lead = require("../models/Lead");

const CSV_HEADERS = ["companyName", "contactName", "email", "phone", "source", "status"];

// @route GET /api/leads/export/csv
exports.exportLeadsCsv = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const leads = await Lead.find(filter).lean();

    const rows = [CSV_HEADERS.join(",")];
    leads.forEach((lead) => {
      const row = CSV_HEADERS.map((h) => {
        const val = (lead[h] ?? "").toString().replace(/"/g, '""');
        return `"${val}"`;
      });
      rows.push(row.join(","));
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads_export.csv");
    res.send(rows.join("\n"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/leads/import/csv
// Expects raw CSV text in req.body.csv (simple parser, no external dependency)
exports.importLeadsCsv = async (req, res) => {
  try {
    const { csv } = req.body;
    if (!csv) return res.status(400).json({ message: "CSV text is required in body.csv" });

    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const created = [];
    const skipped = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const record = {};
      headers.forEach((h, idx) => (record[h] = values[idx]));

      if (!record.companyName || !record.contactName) {
        skipped.push({ line: i + 1, reason: "Missing required fields" });
        continue;
      }

      const lead = await Lead.create({
        companyName: record.companyName,
        contactName: record.contactName,
        email: record.email || "",
        phone: record.phone || "",
        source: record.source || "other",
        status: record.status || "new",
        assignedTo: req.user._id,
      });
      created.push(lead._id);
    }

    res.json({ createdCount: created.length, skipped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
