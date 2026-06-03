import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/product_authenticity";

async function startServer() {
  try {
    await connectDatabase(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.warn("MongoDB unavailable. Using temporary in-memory storage.");
    console.warn(error.message);
  }

  const app = createApp();

  app.listen(port, () => {
    console.log(`Backend API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
