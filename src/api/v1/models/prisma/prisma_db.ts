import { Agency, Container, Issues, Shipment, User } from "@prisma/client";
import { prisma } from "../../config/prisma-client";

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

					agency: {
						select: {
							id: true,
							name: true,
						},
					},
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
					status: true,
					agency: {
						select: {
							id: true,
							name: true,
						},
					},
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
					status: true,
					agency: {
						select: {
							id: true,
							name: true,
						},
					},
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
					status: true,
					events: {
						include: { status: true },
					},
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});

			return shipment;
		},
		getShipmentsByHbls: async (hbls: string[]) => {
			const shipments = await prisma.shipment.findMany({
				where: { hbl: { in: hbls } },
				include: {
					events: true,
				},
			});
			return shipments;
		},
		//tx to update a shipment and the events
		updateShipment: async (hbl: string, data: Partial<Shipment>) => {
			const shipment = await prisma.$transaction(async (tx) => {
				const shipment = await tx.shipment.update({
					where: { hbl },
					data: {
						statusId: data.statusId,
						userId: data.userId,
						updateMethod: data.updateMethod,
					},
				});
				const events = await tx.shipmentEvent.upsert({
					where: { hbl_statusId: { hbl, statusId: shipment.statusId } },
					update: {
						hbl: shipment.hbl,
						timestamp: shipment.timestamp,
						statusId: shipment.statusId,
						userId: shipment.userId,
						updateMethod: shipment.updateMethod,
					},
					create: {
						hbl: shipment.hbl,
						timestamp: shipment.timestamp,
						statusId: shipment.statusId,
						userId: shipment.userId,
						updateMethod: shipment.updateMethod,
					},
				});
				return shipment;
			});
			return shipment;
		},
		updateManyShipments: async (hbls: string[], data: Partial<Shipment>) => {
			const shipments = await prisma.shipment.updateMany({
				where: { hbl: { in: hbls } },
				data,
			});
			return shipments;
		},
		scanShipment: async (hbl: string) => {
			const shipment = await prisma.shipment.findUnique({
				where: { hbl },
			});
			return shipment;
		},
		getShipmentsByInvoiceId: async (invoiceId: number) => {
			const shipments = await prisma.shipment.findMany({
				where: { invoiceId },
				select: {
					hbl: true,
					invoiceId: true,
					description: true,
					agency: {
						select: {
							name: true,
						},
					},
					state: true,
					city: true,
				},
			});
			return shipments.flatMap((shipment) => {
				return {
					hbl: shipment.hbl,
					invoiceId: shipment.invoiceId,
					description: shipment.description,
					agency: shipment?.agency?.name,
					state: shipment.state,
					city: shipment.city,
				};
			});
		},
	},
	containers: {
		getContainerWithShipmentsById: async (id: number) => {
			const container = await prisma.container.findUnique({
				where: { id },
				include: {
					shipments: {
						include: {
							status: true,
							agency: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			});
			return container;
		},
		getContainers: async () => {
			const containers = await prisma.container.findMany();
			return containers;
		},
		upsertContainer: async (data: Container) => {
			const container = await prisma.container.upsert({
				where: { id: data.id },
				update: data,
				create: data,
			});
			return container;
		},
		deleteContainer: async (id: number) => {
			const container = await prisma.container.delete({ where: { id } });
			return container;
		},
	},
	agencies: {
		getAgencies: async () => {
			const agencies = await prisma.agency.findMany();
			return agencies;
		},
		getAgencyById: async (id: number) => {
			const agency = await prisma.agency.findUnique({ where: { id } });
			return agency;
		},
		createAgency: async (data: Agency) => {
			const agency = await prisma.agency.create({ data });
			return agency;
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
