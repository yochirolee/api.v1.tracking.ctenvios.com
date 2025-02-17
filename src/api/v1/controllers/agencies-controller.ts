import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";

export const agencies_controller = {
	getAgencies: async (req: Request, res: Response) => {
		const agencies = await prisma_db.agencies.getAgencies();
		res.json(agencies);
	},
	createAgency: async (req: Request, res: Response) => {
		const { name, email, phone, isActive, aliases, contact, address, parent } = req.body;
		const agency = await prisma_db.agencies.createAgency({ id: 0, name, email: "", phone: "", isActive: true, aliases: [], contact: "", address: "", parent: 0 });
		res.json(agency);
	},
};
