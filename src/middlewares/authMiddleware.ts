import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

declare global {
	namespace Express {
		interface Request {
			user?: any; // Replace 'any' with a more specific type if possible
		}
	}
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(" ")[1];

	if (!token) {
		return res.status(401).json({ error: "Authentication required " });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			userId: number;
			role: Role;
		};

		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid or expired token" });
	}
};
