import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase(process.env.MONGODB_URI);

  const app = createApp();

  app.listen(port, () => {
    console.log(`Backend API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
