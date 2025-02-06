import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development
declare global {
	var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	global.prisma = prisma;
}

export default prisma;
