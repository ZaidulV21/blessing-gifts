import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    images: { type: [String], default: [] },
    related: { type: [String], default: [] },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    badge: { type: String, default: "" },
    status: { type: String, enum: ["in_stock", "out_of_stock"], default: "in_stock" },
    inStock: { type: Boolean, default: true },
    features: { type: [String], default: [] },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);