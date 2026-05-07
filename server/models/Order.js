import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, trim: true },
    category: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customer: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneDigits: { type: String, index: true },
    email: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    payment: { type: String, default: "COD" },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered"],
      default: "Pending",
    },
    trackingLink: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);