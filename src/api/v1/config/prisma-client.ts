import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development
declare global {
   var prisma: PrismaClient | undefined;
}

// Serverless-optimized configuration for Supabase
export const prisma =
   global.prisma ||
   new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
   });

// Prevent hot reload from creating new instances in development
if (process.env.NODE_ENV !== "production") {
   global.prisma = prisma;
}

export default prisma;
