import { Router } from "express";
import { getActivityLogs, saveActivityLog } from "../controllers/shoeController.js";

export const activityRoutes = Router();

activityRoutes.get("/", getActivityLogs);
activityRoutes.post("/", saveActivityLog);
