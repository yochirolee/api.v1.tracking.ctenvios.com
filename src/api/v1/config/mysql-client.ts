import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Serverless-optimized MySQL connection pool
// Lower limits to prevent exceeding connection quotas
const pool = mysql.createPool({
   host: process.env.MYSQL_HOST,
   user: process.env.MYSQL_USER,
   password: process.env.MYSQL_PASSWORD,
   database: process.env.MYSQL_DATABASE,
   waitForConnections: true,
   connectionLimit: 2, // Reduced for serverless - 2 per instance max
   queueLimit: 0, // No queue - fail fast if no connections available
   connectTimeout: 5000, // 5 seconds - fail faster
   enableKeepAlive: true,
   keepAliveInitialDelay: 0,
   maxIdle: 1, // Keep only 1 idle connection
   idleTimeout: 3000, // Close idle connections after 3 seconds
   decimalNumbers: true,
});

// Graceful connection cleanup for serverless
const cleanupPool = async (): Promise<void> => {
   try {
      await pool.end();
   } catch (error) {
      console.error("Error closing MySQL pool:", error);
   }
};

// Handle cleanup on process termination
if (typeof process !== "undefined") {
   process.on("SIGTERM", cleanupPool);
   process.on("SIGINT", cleanupPool);
}

const mysql_client = async (sql: string, params: any[] = []): Promise<any[]> => {
   let connection;
   try {
      connection = await pool.getConnection();
      const [rows] = await connection.query(sql, params);
      return rows as any[];
   } catch (error) {
      console.error("MySQL query error:", error);
      throw error;
   } finally {
      // Always release connection back to pool
      if (connection) {
         connection.release();
      }
   }
};

export default mysql_client;
export { pool, cleanupPool };
