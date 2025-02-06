import { Container, Issues, ShipmentStatus, User } from "@prisma/client";
import { prisma } from "../../config/prisma-client";
import { mysql_db } from "../myslq/mysql_db";

export const prisma_db = {
	users: {
		getUsers: async ({ limit = 10, page = 1 }: { limit?: number; page?: number }) => {
			const users = await prisma.user.findMany({
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					agencyId: true,
					lastLogin: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
				},
				skip: (page - 1) * limit,
				take: limit,
			});
			return users;
		},
		getUserById: async (id: string) => {
			const user = await prisma.user.findUnique({ where: { id } });
			return user;
		},
		getUserByEmail: async (email: string) => {
			const user = await prisma.user.findUnique({ where: { email } });
			return user;
		},

		createUser: async (
			data: Omit<
				User,
				"id" | "isActive" | "lastLogin" | "refreshToken" | "createdAt" | "updatedAt"
			>,
		) => {
			const newUser: User = await prisma.user.create({ data });
			return newUser;
		},
		updateUser: async (id: string, data: Partial<User>) => {
			console.log("updating user on db");
			const updatedUser: Partial<User> = await prisma.user.update({
				where: { id },
				data,
			});
			return updatedUser;
		},
		deleteUser: async (id: string) => {
			const deletedUser = await prisma.user.delete({ where: { id } });
			return deletedUser;
		},
	},
	shipments: {
		getShipments: async ({ limit = 50, offset = 0 }: { limit?: number; offset?: number }) => {
			const shipments = await prisma.shipment.findMany({
				include: {
					location: true,
				},
				orderBy: {
					timestamp: "desc",
				},
				take: limit,
				skip: offset,
			});
			return shipments;
		},

		//search shipments by hbl or invoiceId or description or sender or receiver
		//if better to implement a full text search, we can use a library like pg_search

		searchShipments: async (search: string, limit = 30, offset = 0) => {
			const shipments = await prisma.shipment.findMany({
				where: {
					OR: [
						{ hbl: { equals: search } },
						{ invoiceId: { equals: parseInt(search) } },
						{ receiver: { contains: search, mode: "insensitive" } },
						{ sender: { contains: search, mode: "insensitive" } },
						{ description: { contains: search, mode: "insensitive" } },
					],
				},
				include: {
					location: true,
				},
				orderBy: {
					timestamp: "desc",
				},
				take: limit,
				skip: offset,
			});

			return shipments;
		},
		getShipmentByHbl: async (hbl: string) => {
			const shipment = await prisma.shipment.findUnique({
				where: { hbl },
				include: {
					location: true,
					events: true,
				},
			});
			return shipment;
		},
		getShipmentsByHbls: async (hbls: string[]) => {
			const shipments = await prisma.shipment.findMany({
				where: { hbl: { in: hbls } },
				include: {
					location: true,
					events: true,
				},
			});
			return shipments;
		},
		//how to get the stats for the shipments?
		//we need to get the shipments by status and count them
		//we need to get the shipments by location and count them
		getShipmentsStats: async () => {
			const shipments = await prisma.shipment.findMany({
				include: {
					location: true,
				},
			});

			//by location and status
			
			const stats = shipments.reduce((acc: Record<string, number>, shipment) => {
				acc[shipment.location.name] = (acc[shipment.location.name] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);
			return stats;
		},
	},
	containers: {
		getContainers: async () => {
			const containers = await prisma.container.findMany({
				include: {
					shipments: true,
				},
			});
			return containers;
		},
		getContainerById: async (id: number) => {
			const container = await prisma.container.findUnique({ where: { id } });
			return container;
		},
		upsertContainer: async (data: Container) => {
			const container = await prisma.container.upsert({
				where: { id: data.id },
				update: data,
				create: data,
			});
			return container;
		},
	},
	issues: {
		getIssues: async () => {
			const issues = await prisma.issues.findMany({});
			return issues;
		},
		getIssuesWithComments: async () => {
			const issues = await prisma.issues.findMany({
				include: {
					comments: true,
				},
			});
			return issues;
		},

		getIssueById: async (id: number) => {
			const issue = await prisma.issues.findUnique({
				where: { id },
				include: {
					comments: true,
				},
			});
			return issue;
		},
		createIssue: async (data: Pick<Issues, "hbl" | "description" | "type" | "userId">) => {
			const issue = await prisma.issues.create({
				data,
			});
			return issue;
		},
	},
};
