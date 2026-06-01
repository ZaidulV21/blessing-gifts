import { Router } from "express";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../controllers/couponController.js";

const router = Router();

router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").get(getCouponById).put(updateCoupon).delete(deleteCoupon);
router.post("/validate", validateCoupon);

export default router;
