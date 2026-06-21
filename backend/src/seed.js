import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Category from "./models/category.js";
import Product from "./models/product.js";
import ProductImage from "./models/productImage.js";
import Review from "./models/review.js";
import Voucher from "./models/voucher.js";
import UserVoucher from "./models/userVoucher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, "Database");

// Chuyển MongoDB Extended JSON ($oid, $date) → object JS thường
// Chuyển MongoDB Extended JSON ($oid, $date) thành giá trị JS
// Nếu object chỉ chứa $oid hoặc $date thì trả thẳng giá trị, không wrap trong object
function parseValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  // ObjectId reference: { "$oid": "..." } → string
  if (Object.keys(value).length === 1 && "$oid" in value) {
    return value.$oid;
  }
  // Date: { "$date": "..." } → Date
  if (Object.keys(value).length === 1 && "$date" in value) {
    return new Date(value.$date);
  }
  // Array → map từng phần tử
  if (Array.isArray(value)) {
    return value.map(parseValue);
  }
  // Object thường → duyệt key
  const parsed = {};
  for (const [k, v] of Object.entries(value)) {
    parsed[k] = parseValue(v);
  }
  return parsed;
}

function loadJSON(filename) {
  const raw = fs.readFileSync(path.join(dbDir, filename), "utf-8");
  return JSON.parse(raw);
}

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ptitshop";
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected!");

  // 1. Categories
  const categoriesRaw = loadJSON("categories.json");
  const categories = categoriesRaw.map(parseValue);
  for (const cat of categories) {
    await Category.updateOne(
      { _id: cat._id },
      { $set: { name: cat.name, slug: cat.slug, description: cat.description } },
      { upsert: true }
    );
  }
  console.log(`✓ Categories: ${categories.length}`);

  // 2. Product Images (dùng _id từ JSON)
  const imagesRaw = loadJSON("productImages.json");
  const images = imagesRaw.map((img) => {
    const p = parseValue(img);
    // product field cũng có $oid
    return p;
  });
  for (const img of images) {
    await ProductImage.updateOne(
      { _id: img._id },
      { $set: img },
      { upsert: true }
    );
  }
  console.log(`✓ ProductImages: ${images.length}`);

  // 3. Products (ưu tiên productWithSlug.json nếu có)
  const productsRaw = loadJSON("productWithSlug.json");
  const products = productsRaw.map((prod) => {
    const p = parseValue(prod);
    // Chuyển images array từ string ObjectId sang reference (model cần ObjectId array)
    // Nhưng model Product có images là [ObjectId] ref ProductImage
    // Giữ nguyên string, mongoose cast được
    return p;
  });
  for (const prod of products) {
    await Product.updateOne(
      { _id: prod._id },
      { $set: prod },
      { upsert: true }
    );
  }
  console.log(`✓ Products: ${products.length}`);

  // 4. Reviews
  const reviewsRaw = loadJSON("reviews.json");
  const reviews = reviewsRaw.map(parseValue);
  for (const r of reviews) {
    await Review.updateOne(
      { product: r.product, user: r.user },
      { $set: r },
      { upsert: true }
    );
  }
  console.log(`✓ Reviews: ${reviews.length}`);

  // 5. Vouchers
  const vouchersRaw = loadJSON("vouchers.json");
  const vouchers = vouchersRaw.map(parseValue);
  for (const v of vouchers) {
    await Voucher.updateOne(
      { _id: v._id },
      { $set: v },
      { upsert: true }
    );
  }
  console.log(`✓ Vouchers: ${vouchers.length}`);

  // 6. UserVouchers
  const userVouchersRaw = loadJSON("userVouchers.json");
  const userVouchers = userVouchersRaw.map(parseValue);
  for (const uv of userVouchers) {
    await UserVoucher.updateOne(
      { _id: uv._id },
      { $set: uv },
      { upsert: true }
    );
  }
  console.log(`✓ UserVouchers: ${userVouchers.length}`);

  console.log("\n🎉 Seed completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
