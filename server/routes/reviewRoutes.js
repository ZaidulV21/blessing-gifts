import { Router } from "express";
import {
  createReview,
  deleteReview,
  getReviewById,
  getReviews,
  updateReview,
  approveReview,
  rejectReview,
} from "../controllers/reviewController.js";

const router = Router();

router.route("/").get(getReviews).post(createReview);
router.route("/:id").get(getReviewById).put(updateReview).delete(deleteReview);
router.post("/:id/approve", approveReview);
router.post("/:id/reject", rejectReview);

export default router;
