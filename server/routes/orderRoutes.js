import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrder,
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
} from "../controllers/orderController.js";

const router = Router();

// Legacy COD order creation
router.route("/").get(getOrders).post(createOrder);
router.route("/:id").get(getOrderById).put(updateOrder);

// Razorpay payment flow
router.post("/payment/create", createPaymentOrder); // Create Razorpay order
router.post("/payment/verify", verifyPayment); // Verify payment signature
router.post("/payment/failed", handlePaymentFailure); // Handle payment failure

export default router;