import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

const uri = process.env.MONGO_URI;

try {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected!");

  const adminData = {
    fullName: "Admin",
    phoneNumber: "0123456789",
    email: "admin@ptitshop.com",
    username: "admin",
    password: await bcrypt.hash("admin123", 10),
    isActive: true,
    isAdmin: true,
  };

  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    console.log("Admin user already exists, updating to isAdmin: true...");
    existing.isAdmin = true;
    existing.password = adminData.password;
    await existing.save();
    console.log("Updated! Email: admin@ptitshop.com / Password: admin123");
  } else {
    const admin = new User(adminData);
    await admin.save();
    console.log("✅ Admin created! Email: admin@ptitshop.com / Password: admin123");
  }

  process.exit(0);
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
}
