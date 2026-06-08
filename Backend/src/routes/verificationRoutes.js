import { Router } from "express";
import { getVerificationMetadata } from "../controllers/shoeController.js";

export const verificationRoutes = Router();

verificationRoutes.get("/:productCode", getVerificationMetadata);
