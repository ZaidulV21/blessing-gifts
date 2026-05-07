import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrder,
} from "../controllers/orderController.js";

const router = Router();

router.route("/").get(getOrders).post(createOrder);
router.route("/:id").get(getOrderById).put(updateOrder);

export default router;