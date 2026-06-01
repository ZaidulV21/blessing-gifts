import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Blessing Gifts" },
    storeEmail: { type: String, trim: true },
    storePhone: { type: String, trim: true },
    storeAddress: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    bannerUrl: { type: String, trim: true },
    currency: { type: String, default: "INR" },
    taxRate: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    freeShippingAbove: { type: Number, default: 0 },
    razorpayKeyId: { type: String, trim: true },
    razorpayKeySecret: { type: String, trim: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    socialLinks: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
