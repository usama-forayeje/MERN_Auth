import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import { logger } from "./src/utils/logger.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info("🔗 Connected to the database successfully");
      logger.success(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("❎ Failed to connect to the database");
  }
};

startServer();
