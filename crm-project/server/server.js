require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const customerRoutes = require("./routes/customerRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
