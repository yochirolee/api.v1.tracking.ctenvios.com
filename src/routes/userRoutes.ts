import express from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { authMiddleware } from "../middlewares/authMiddleware";
import { schemas } from "../shemas/shemas";
import { supabase_db } from "../databases/supabase/supabase_db";

const router = express.Router();
const prisma = new PrismaClient();

// User registration
router.post("/register", async (req, res) => {
	const { name, email, password, agencyId, roleId } = req.body;
	console.log(name, email, password, agencyId, roleId);
	// Validate required fields
	if (!name || !email || !password || !agencyId || !roleId) {
		return res.status(400).json({ error: "All fields are required" });
	}

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ error: "Invalid email format" });
	}

	// Validate password strength
	if (password.length < 8) {
		return res.status(400).json({ error: "Password must be at least 8 characters long" });
	}

	// Validate agencyId is a positive integer
	if (!Number.isInteger(agencyId) || agencyId <= 0) {
		return res.status(400).json({ error: "Invalid agencyId" });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	try {
		const userExists = await prisma.user.findUnique({ where: { email } });
		if (userExists) {
			return res.status(400).json({ error: "User already exists" });
		}
		const user = await prisma.user.create({
			data: { name, email, password: hashedPassword, agencyId, roleId },
		});
		res.json({ message: "User registered successfully", userId: user.id });
	} catch (error) {
		res.status(400).json({ error, message: "registration failed" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const result = schemas.loginSchema.safeParse(req.body);
		if (!result.success) {
			return res.status(400).json({ error: result.error.errors });
		}
		const { email, password } = result.data;

		const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
		if (user && (await bcrypt.compare(password, user.password))) {
			const token = jwt.sign(
				{
					userId: user.id,
					username: user.name,
					email: user.email,
					role: user.role.role,
					roleId: user.roleId,
					agencyId: user.agencyId,
				},
				process.env.JWT_SECRET as string,
				{ expiresIn: "4h" },
			);
			console.log(token, "token");
			res.json({ token });
		} else {
			res.status(401).json({ error: "Invalid credentials" });
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			res.status(400).json({ error: error.errors });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

// Get all users (admin only)
router.get("/", authMiddleware, async (req, res) => {
	const user = req.user;
	console.log(user, "user");

	if (user?.role !== "SUPERADMIN" && user?.role !== "ADMIN") {
		return res.status(403).json({ error: "Unauthorized access" });
	}
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			agencyId: true,
		},
	});

	res.json(users);
});

// Get user by ID
router.get("/:id", authMiddleware, async (req, res) => {
	const { id } = req.params;
	//get token
	const token = req.headers.authorization?.split(" ")[1];

	if (req.user?.id !== id && req.user?.role !== "SUPERADMIN" && req.user?.role !== "ADMIN") {
		return res.status(403).json({ error: "Unauthorized access" });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
		});

		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
});

// Update user
router.put("/:id", authMiddleware, async (req, res) => {
	const { id } = req.params;
	const { name, email, role } = req.body;

	if (req.user?.id !== id && req.user?.roleId !== 1 && req.user?.roleId !== 2) {
		return res.status(403).json({ error: "Unauthorized access" });
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id },
			data: { name, email, role },
		});
		res.json(updatedUser);
	} catch (error) {
		res.status(400).json({ error: "Update failed" });
	}
});

// Delete user (admin only)
router.delete("/:id", authMiddleware, async (req, res, next) => {
	try {
		const { id } = req.params;

		if (req.user?.roleId !== 1 && req.user?.roleId !== 2) {
			return res.status(403).json({ error: "Unauthorized access" });
		}

		try {
			await prisma.user.delete({ where: { id } });
			res.json({ message: "User deleted successfully" });
		} catch (error) {
			res.status(400).json({ error: "Delete failed" });
		}
	} catch (error) {
		next(error);
	}
});

///SUPABASE
router.post("/supabase/signup", async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const { user, session } = await supabase_db.users.signUp(email, password);
		res.json({ user, session });
	} catch (error) {
		next(error);
	}
});

router.post("/supabase/signin", async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const { user, session } = await supabase_db.users.signIn(email, password);
		res.json({ user, session });
	} catch (error) {
		next(error);
	}
});
router.get("/supabase/users", async (req, res, next) => {
	try {
		const users = await supabase_db.users.getUsers();
		res.json(users);
	} catch (error) {
		next(error);
	}
});

export default router;
