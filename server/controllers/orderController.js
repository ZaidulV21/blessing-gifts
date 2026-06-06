import mongoose from "mongoose";
import Order from "../models/Order.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchRazorpayPayment,
} from "../utils/razorpayUtils.js";
import { releaseStockItems, reserveStockItems, validateStockItems } from "../utils/stock.js";

const normalizePhone = (phone = "") => phone.replace(/\D/g, "");

const generateOrderId = () => `BG-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

const toClientOrder = (order) => ({
  id: order.orderId,
  _id: order._id.toString(),
  orderId: order.orderId,
  customerName: order.customerName,
  customer: order.customer || order.customerName,
  phone: order.phone,
  email: order.email || "",
  address: order.address,
  items: order.items || [],
  totalAmount: order.totalAmount,
  total: order.totalAmount,
  payment: order.payment || "COD",
  note: order.note || "",
  inventoryRestoredAt: order.inventoryRestoredAt || null,
  status: order.status,
  trackingLink: order.trackingLink || "",
  date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—",
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const normalizeOrderItems = (items = []) => {
  const merged = new Map();

  for (const item of items) {
    const productId = String(item?.productId || item?.id || "").trim();
    const qty = Number(item?.qty ?? 0);

    if (!productId || qty <= 0) {
      continue;
    }

    const current = merged.get(productId) || { ...item, productId, qty: 0 };
    current.qty += qty;
    merged.set(productId, current);
  }

  return [...merged.values()];
};

const getStockErrorMessage = (validation) => {
  if (!validation.length || validation.length > 1) {
    return "Some items in your cart are no longer available.";
  }

  return validation[0].reason === "insufficient_stock"
    ? "Maximum available stock reached."
    : "This product is currently out of stock.";
};

const reserveOrderStock = async (items) => {
  const validation = await validateStockItems(items);
  const unavailable = validation.find((item) => !item.isAvailable);

  if (unavailable) {
    const error = new Error(getStockErrorMessage(validation));
    error.statusCode = 409;
    error.details = validation;
    throw error;
  }

  const reservation = await reserveStockItems(items);

  if (!reservation.success) {
    const error = new Error("Some items in your cart are no longer available.");
    error.statusCode = 409;
    throw error;
  }

  return validation;
};

const releaseOrderStock = async (order) => {
  if (!order || order.inventoryRestoredAt) {
    return;
  }

  await releaseStockItems(order.items || []);
  order.inventoryRestoredAt = new Date();
  await order.save();
};

export async function createOrder(req, res, next) {
  try {
    const payload = req.body;
    const customerName = payload.customerName || payload.customer || "";
    const phone = payload.phone || "";
    const address = payload.address || "";
    const items = normalizeOrderItems(Array.isArray(payload.items) ? payload.items : []);
    const totalAmount = Number(payload.totalAmount ?? payload.total ?? 0);

    if (!customerName || !phone || !address || !items.length || !totalAmount) {
      return res.status(400).json({ message: "customerName, phone, address, items and totalAmount are required" });
    }

    await reserveOrderStock(items);

    let order;

    try {
      order = await Order.create({
        orderId: payload.orderId || generateOrderId(),
        customerName,
        customer: customerName,
        phone,
        phoneDigits: normalizePhone(phone),
        email: payload.email || "",
        address,
        items,
        totalAmount,
        total: totalAmount,
        payment: payload.payment || "COD",
        note: payload.note || "",
        status: payload.status || "Pending",
        trackingLink: payload.trackingLink || "",
      });
    } catch (error) {
      await releaseStockItems(items);
      throw error;
    }

    res.status(201).json(toClientOrder(order));
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const phoneDigits = normalizePhone(id);

    const queryParts = [{ orderId: id }, { phoneDigits }];

    if (mongoose.isValidObjectId(id)) {
      queryParts.push({ _id: id });
    }

    const order = await Order.findOne({ $or: queryParts });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(toClientOrder(order));
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(toClientOrder));
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const phoneDigits = normalizePhone(id);
    const updatePayload = {};

    if (req.body.status) {
      updatePayload.status = req.body.status;
    }

    if (req.body.trackingLink !== undefined) {
      updatePayload.trackingLink = req.body.trackingLink;
    }

    if (req.body.payment !== undefined) {
      updatePayload.payment = req.body.payment;
    }

    if (req.body.note !== undefined) {
      updatePayload.note = req.body.note;
    }

    const order = await Order.findOneAndUpdate(
      {
        $or: [{ orderId: id }, { phoneDigits }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])],
      },
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(toClientOrder(order));
  } catch (error) {
    next(error);
  }
}

/**
 * Create Razorpay Order - Professional e-commerce payment flow
 * Step 1: Create order record in DB with "pending" payment status
 * Step 2: Initialize Razorpay order
 * Step 3: Return order details and Razorpay order ID to frontend
 */
export async function createPaymentOrder(req, res, next) {
  try {
    const payload = req.body;
    const customerName = payload.customerName || payload.customer || "";
    const phone = payload.phone || "";
    const address = payload.address || "";
    const items = normalizeOrderItems(Array.isArray(payload.items) ? payload.items : []);
    const totalAmount = Number(payload.totalAmount ?? payload.total ?? 0);
    const email = payload.email || "";

    if (!customerName || !phone || !address || !items.length || !totalAmount) {
      return res.status(400).json({
        message: "customerName, phone, address, items, and totalAmount are required",
      });
    }

    // Generate order ID
    const orderId = payload.orderId || generateOrderId();

    await reserveOrderStock(items);

    let order;

    try {
      order = await Order.create({
        orderId,
        customerName,
        customer: customerName,
        phone,
        phoneDigits: normalizePhone(phone),
        email,
        address,
        items,
        totalAmount,
        total: totalAmount,
        payment: "Razorpay",
        paymentStatus: "pending", // Payment not yet completed
        note: payload.note || "",
        status: "Pending", // Order status separate from payment status
        trackingLink: "",
      });
    } catch (error) {
      await releaseStockItems(items);
      throw error;
    }

    // Create Razorpay order
    const razorpayResult = await createRazorpayOrder(
      totalAmount,
      orderId,
      email,
      phone
    );

    if (!razorpayResult.success) {
      // Delete order if Razorpay order creation fails
      await releaseStockItems(items);
      await Order.deleteOne({ _id: order._id });
      return res.status(400).json({
        message: "Failed to create payment order",
        error: razorpayResult.error,
      });
    }

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayResult.data.id;
    await order.save();

    // Return to frontend: order info + Razorpay details
    res.status(201).json({
      order: toClientOrder(order),
      razorpay: {
        orderId: razorpayResult.data.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayResult.data.amount,
        currency: razorpayResult.data.currency,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify Payment - Professional e-commerce practice
 * Step 1: Verify Razorpay signature (CRITICAL for security)
 * Step 2: Fetch payment details from Razorpay API (optional but recommended)
 * Step 3: Update order status and payment fields
 * Step 4: Return confirmation to frontend
 */
export async function verifyPayment(req, res, next) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        message: "razorpayOrderId, razorpayPaymentId, and razorpaySignature are required",
      });
    }

    // CRITICAL: Verify signature server-side to prevent fraud
    const isSignatureValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      console.warn(`Payment verification failed for order: ${orderId}`);
      return res.status(400).json({
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Optionally fetch latest payment details from Razorpay
    const paymentDetails = await fetchRazorpayPayment(razorpayPaymentId);

    // Find order and update payment details
    const order = await Order.findOne({
      $or: [
        { orderId },
        { razorpayOrderId },
        ...(mongoose.isValidObjectId(orderId) ? [{ _id: orderId }] : []),
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment information (idempotency: check if already paid)
    if (order.paymentStatus !== "completed") {
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;

      // Only mark as completed if payment is successful
      if (paymentDetails.success && paymentDetails.data.status === "captured") {
        order.paymentStatus = "completed";
        order.status = "Confirmed"; // Auto-confirm order on successful payment
      } else {
        order.paymentStatus = "failed";
        await releaseOrderStock(order);
      }

      await order.save();
    }

    res.json({
      message: "Payment verified successfully",
      order: toClientOrder(order),
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle payment failure callback
 * Update order status to failed
 */
export async function handlePaymentFailure(req, res, next) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, reason } = req.body;

    const order = await Order.findOne({
      $or: [
        { orderId },
        { razorpayOrderId },
        ...(mongoose.isValidObjectId(orderId) ? [{ _id: orderId }] : []),
      ],
    });

    if (order) {
      await releaseOrderStock(order);
      order.paymentStatus = "failed";
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();
    }

    res.json({ message: "Payment failure recorded", failureReason: reason });
  } catch (error) {
    next(error);
  }
}