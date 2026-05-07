import mongoose from "mongoose";
import Order from "../models/Order.js";

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
  status: order.status,
  trackingLink: order.trackingLink || "",
  date: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—",
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export async function createOrder(req, res, next) {
  try {
    const payload = req.body;
    const customerName = payload.customerName || payload.customer || "";
    const phone = payload.phone || "";
    const address = payload.address || "";
    const items = Array.isArray(payload.items) ? payload.items : [];
    const totalAmount = Number(payload.totalAmount ?? payload.total ?? 0);

    if (!customerName || !phone || !address || !items.length || !totalAmount) {
      return res.status(400).json({ message: "customerName, phone, address, items and totalAmount are required" });
    }

    const order = await Order.create({
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