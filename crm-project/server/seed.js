require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Lead = require("./models/Lead");

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Lead.deleteMany({})]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@crm.test",
    password: "password123",
    role: "admin",
  });

  const rep = await User.create({
    name: "Sales Rep",
    email: "rep@crm.test",
    password: "password123",
    role: "sales_rep",
  });

  await Lead.create([
    {
      companyName: "Acme Corp",
      contactName: "Jane Doe",
      email: "jane@acme.com",
      source: "website",
      status: "new",
      assignedTo: rep._id,
    },
    {
      companyName: "Globex Inc",
      contactName: "John Smith",
      email: "john@globex.com",
      source: "referral",
      status: "qualified",
      assignedTo: rep._id,
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin login: admin@crm.test / password123");
  console.log("Rep login:   rep@crm.test / password123");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
