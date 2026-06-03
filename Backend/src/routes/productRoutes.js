import { Router } from "express";
import {
  createProduct,
  getProduct,
  listProducts,
  removeProduct,
  updateProduct,
} from "../controllers/productController.js";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.post("/", createProduct);
productRoutes.get("/:productCode", getProduct);
productRoutes.put("/:productCode", updateProduct);
productRoutes.delete("/:productCode", removeProduct);
