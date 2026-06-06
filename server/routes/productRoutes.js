import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  validateStock,
  updateProduct,
} from "../controllers/productController.js";

const router = Router();

router.route("/").get(getProducts).post(createProduct);
router.post("/stock/validate", validateStock);
router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProduct);

export default router;