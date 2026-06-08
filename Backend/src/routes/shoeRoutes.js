import { Router } from "express";
import { getShoeByCode, getShoes, saveShoe } from "../controllers/shoeController.js";

export const shoeRoutes = Router();

shoeRoutes.get("/", getShoes);
shoeRoutes.post("/", saveShoe);
shoeRoutes.get("/:productCode", getShoeByCode);
