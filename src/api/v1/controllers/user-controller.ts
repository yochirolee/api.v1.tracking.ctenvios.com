import { Request, Response, NextFunction } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from "console";

const user_schema = z.object({
	name: z.string().min(8),
	email: z.string().email(),
	role: z.enum([
		"ROOT",
		"ADMINISTRATOR",
		"AGENCY_ADMIN",
		"MESSENGER",
		"SALES",
		"WAREHOUSE_MANAGER",
		"WAREHOUSE_WORKER",
		"AGENT",
	]),
	agencyId: z.number(),
	password: z.string().min(8),
	isActive: z.boolean().optional(),
	createdById: z.string().optional(),
});

const login_schema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const user_controller = {
	getUsers: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { limit = 10, page = 1 } = req.query;
			const users = await prisma_db.users.getUsers({ limit: Number(limit), page: Number(page) });
			res.json(users);
		} catch (error: any) {
			//if is a prisma error
			if (error instanceof PrismaClientKnownRequestError) {
				res.status(500).json({ error: error.message });
			}
			if (error instanceof ZodError) {
				res.status(400).json({ error: error.message });
			}
			res.status(500).json({ error: error.message });
		}
	},
	getUserById: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const user = await prisma_db.users.getUserById(id);
			res.json(user);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	},
	getUserByEmail: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email } = req.params;
			const user = await prisma_db.users.getUserByEmail(email);
			res.json(user);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	},
	login: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { email, password } = login_schema.parse(req.body);
			const user = await prisma_db.users.getUserByEmail(email);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}
			const isPasswordCorrect = await bcrypt.compare(password, user.password);
			if (!isPasswordCorrect) {
				return res.status(401).json({ error: "Invalid password" });
			}
			//update last login
			await prisma_db.users.updateUser(user.id, { lastLogin: new Date() });
			const token = jwt.sign(
				{
					userId: user.id,
					role: user.role,
					agencyId: user.agencyId,
					email: user.email,
				},
				process.env.JWT_SECRET as string,
				{
					expiresIn: "4h",
				},
			);
			console.log(token);
			res.json({ token });
		} catch (error: any) {
			console.log(error);
			return res.status(500).json({ error: error.message });
		}
	},
	createUser: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { userId } = req.user;
			if (!userId) {
				return res.status(401).json({ error: "User not found" });
			}

			//check if user exists

			const { name, email, role, agencyId, password } = await user_schema.parse(req.body);
			//return if any validation fails
			const findUser = await prisma_db.users.getUserByEmail(email);

			if (findUser) {
				return res.status(400).json({ message: "User already exists", error: error });
			}
			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await prisma_db.users.createUser({
				name,
				email,
				role,
				agencyId,
				password: hashedPassword,
				createdById: userId,
				phone: null,
			});
			return res.json(user);
		} catch (error: any) {
			if (error instanceof ZodError) {
				return res.status(400).json({ error: error.message });
			}
			if (error instanceof PrismaClientKnownRequestError) {
				return res.status(500).json({ error: error.message });
			}
			return res.status(500).json({ error: error.message });
		}
	},
	updateUser: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			if (!id) {
				res.status(400).json({ error: "Id is required" });
			}
			const safeData = req.body;

			const user = await prisma_db.users.updateUser(id, {
				...safeData,
			});
			return res.json(user);
		} catch (error: any) {
			console.log(error);
			return res.status(500).json({ error: error.message });
		}
	},
	deleteUser: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			if (!id) {
				res.status(400).json({ error: "Id is required" });
			}
			const user = await prisma_db.users.deleteUser(id);
			res.json(user);
		} catch (error: any) {
			res.status(500).json({ error: error.message });
		}
	},
};
