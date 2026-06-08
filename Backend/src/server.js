import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    console.log("MySQL connected");
  } catch (error) {
    console.warn("MySQL unavailable. Using temporary in-memory storage.");
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
