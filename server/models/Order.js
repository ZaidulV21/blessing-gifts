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
    couponCode: { type: String, default: null, trim: true },
    discountAmount: { type: Number, default: 0 },
    payment: { type: String, default: "COD" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    inventoryRestoredAt: { type: Date },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    trackingLink: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);