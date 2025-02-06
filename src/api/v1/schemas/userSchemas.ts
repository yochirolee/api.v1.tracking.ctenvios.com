import { z } from "zod";
import { Roles, ShipmentStatus } from "@prisma/client";

const registerUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(3),
	role: z.nativeEnum(Roles),
	agencyId: z.number(),
});

const loginUserSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

const getUserByIdSchema = z.object({
	id: z.string(),
});

const updateUserSchema = z.object({
	id: z.string(),
	name: z.string().min(3),
	email: z.string().email(),
	role: z.nativeEnum(Roles),
	agencyId: z.number(),
});

const createShipmentSchema = z.object({
	hbl: z.string(),
	currentLocationId: z.number(),
	currentStatus: z.nativeEnum(ShipmentStatus),
	userId: z.number(),
});

export { registerUserSchema, loginUserSchema, getUserByIdSchema, updateUserSchema };
