import cors from "cors";
import express from "express";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { activityRoutes } from "./routes/activityRoutes.js";
import { companyRoutes } from "./routes/companyRoutes.js";
import { shoeRoutes } from "./routes/shoeRoutes.js";
import { verificationRoutes } from "./routes/verificationRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/companies", companyRoutes);
  app.use("/api/shoes", shoeRoutes);
  app.use("/api/verify", verificationRoutes);
  app.use("/api/activity-logs", activityRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
