import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
	namespace Express {
		interface Request {
			user?: any; // Replace 'any' with a more specific type if possible
		}
	}
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(" ")[1].replace(/"/g, "");
	if (!token) {
		return res.status(401).json({ error: "Authentication required " });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
			userId: number;
			roleId: number;
			agencyId: number;
			email: string;
			username: string;
			role: string;
		};
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid or expired token" });
	}
};

export const requireRoles = (allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user;

		if (!user) {
			return res.status(401).json({ message: "Unauthorized: No user found" });
		}

		if (!allowedRoles.includes(user.role)) {
			return res.status(403).json({ message: "Unauthorized: Insufficient permissions" });
		}

		next();
	};
};
