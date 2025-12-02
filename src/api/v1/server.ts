// Load environment variables BEFORE any other imports
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { cleanupPool } from "./config/mysql-client";

const PORT = process.env.PORT || 3000;

const server = app
   .listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
   })
   .on("error", (err) => {
      console.error("Server failed to start:", err);
      process.exit(1);
   });

// Graceful shutdown handler
const gracefulShutdown = async (signal: string): Promise<void> => {
   console.log(`\n${signal} received. Starting graceful shutdown...`);

   // Close HTTP server
   server.close(async () => {
      console.log("HTTP server closed");

      // Close MySQL pool
      await cleanupPool();
      console.log("MySQL connections closed");

      console.log("Graceful shutdown complete");
      process.exit(0);
   });

   // Force shutdown after 10 seconds
   setTimeout(() => {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
   }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
