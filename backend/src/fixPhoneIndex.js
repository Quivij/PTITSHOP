import "dotenv/config";
import mongoose from "mongoose";

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected!");

  const db = mongoose.connection.db;
  const indexes = await db.collection("users").indexes();
  console.log("Current indexes:", indexes.map((i) => i.name));

  if (indexes.find((i) => i.name === "phone_1")) {
    await db.collection("users").dropIndex("phone_1");
    console.log("✅ Dropped index phone_1");
  } else {
    console.log("Index phone_1 not found, nothing to drop");
  }

  process.exit(0);
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
}
