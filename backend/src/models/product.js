import mongoose from "mongoose";
import slugify from "slugify";
import "./category.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    quantity: { type: Number, default: 0 },

    sold: { type: Number, default: 0 },

    description: { type: String },

    price: { type: Number, required: true },

    discount: { type: Number, default: 0 },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    views: { type: Number, default: 0 },

    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductImage",
      },
    ],

    // slug tự tạo
    slug: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      enum: ["available", "out_of_stock", "deleted"],
      default: "available",
    },

    // đổi tên field
    isNewProduct: {
      type: Boolean,
      default: false,
    },

    isHot: {
      type: Boolean,
      default: false,
    },

    stock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Tự động tạo slug
productSchema.pre("save", function () {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: "vi",
    });
  }
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
