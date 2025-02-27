import {
	Agency,
	Container,
	Location,
	Issues,
	Shipment,
	User,
	ShipmentEvent,
	Prisma,
} from "@prisma/client";
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
						include: { status: true, location: true, user: true },
						orderBy: { timestamp: "asc" },
					},
					location: {
						select: {
							country_code: true,
							city: true,
							state: true,
							name: true,
						},
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
			});
			return shipments;
		},

		/* 	upsertTransaction: async (
			locationData: Omit<Location, "id">,
			shipmentData: Omit<Shipment, "id">,
		) => {
			const shipment = await prisma.$transaction(async (tx) => {
				const location = await tx.location.upsert({
					where: {
						latitude_longitude: {
							latitude: locationData.latitude,
							longitude: locationData.longitude,
						},
					},
					update: locationData,
					create: locationData,
				});
				const shipment = await tx.shipment.upsert({
					where: { hbl: shipmentData.hbl },
					update: {
						...shipmentData,
						locationId: location?.id,
					},
					create: {
						...shipmentData,
						locationId: location?.id,
					},
				});

				return shipment;
			});
			return shipment;
		}, */

		//tx to update a shipment and the events
		scanShipmentTransaction: async (
			data: Partial<Shipment>,
			locationData: Omit<Location, "id">,
		) => {
			let location: Location | null = null;
			if (locationData.latitude && locationData.longitude) {
				location = await prisma.location.upsert({
					where: {
						latitude_longitude: {
							latitude: locationData.latitude,
							longitude: locationData.longitude,
						},
					},
					update: locationData,
					create: locationData,
				});
			}
			const shipment = await prisma.$transaction(async (tx) => {
				const shipment = await tx.shipment.update({
					where: { hbl: data.hbl },
					data: {
						statusId: data.statusId,
						userId: data.userId,
						updateMethod: data.updateMethod,
						locationId: location?.id,
						timestamp: data.timestamp,
					},
				});
				await tx.shipmentEvent.upsert({
					where: { hbl_statusId: { hbl: shipment.hbl, statusId: shipment.statusId } },
					update: {
						hbl: shipment.hbl,
						timestamp: shipment.timestamp,
						statusId: shipment.statusId,
						userId: shipment.userId,
						updateMethod: shipment.updateMethod,
						locationId: shipment.locationId,
					},
					create: {
						hbl: shipment.hbl,
						timestamp: shipment.timestamp,
						statusId: shipment.statusId,
						userId: shipment.userId,
						updateMethod: shipment.updateMethod,
						locationId: shipment.locationId,
					},
				});
				return shipment;
			});
			return shipment;
		},

		scannedShipments: async (statusId: number, userId: string) => {
			const shipments = await prisma.shipment.findMany({
				select: {
					hbl: true,
					invoiceId: true,
					description: true,
					timestamp: true,
					agency: {
						select: {
							name: true,
						},
					},
				},
				where: { statusId, userId, timestamp: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) } },
			});
			console.log(shipments);
			return shipments;
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
	events: {
		upsert: async (data: ShipmentEvent) => {
			const event = await prisma.shipmentEvent.upsert({
				where: { hbl_statusId: { hbl: data.hbl, statusId: data.statusId } },
				update: data,
				create: data,
			});
			return event;
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
		/* 	getContainersStats: async () => {
			const containers = await prisma.container.findMany({
				include: {
					shipments: {
						include: {
							status: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			});

			const stats = containers.reduce(
				(acc, container) => {
					const statusCounts = container.shipments.reduce((statusAcc, shipment) => {
						const status = shipment.status;
						const key = status.id;
						if (!statusAcc[key]) {
							statusAcc[key] = {
								count: 0,
								name: status.name,
							};
						}
						statusAcc[key].count++;
						return statusAcc;
					}, {} as Record<number, { count: number; name: string }>);

					acc.push({
						containerId: container.id,
						containerNumber: container.containerNumber,
						statusCounts,
						totalShipments: container.shipments.length,
					});
					return acc;
				},
				[] as Array<{
					containerId: number;
					containerNumber: string;
					statusCounts: Record<number, { count: number; name: string }>;
					totalShipments: number;
				}>,
			);

			return stats;
		}, */
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
			const issues = await prisma.issues.findMany({
				include: {
					comments: true,
					user: {
						select: {
							id: true,
							name: true,
						},
					},
					shipment: {
						select: {
							hbl: true,
							invoiceId: true,
							agency: {
								select: {
									id: true,
									name: true,
								},
							},
							description: true,
							status: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
			});
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
		createIssue: async (data: Prisma.IssuesCreateInput) => {
			const issue = await prisma.issues.create({
				data: {
					...data,
				},
			});
			return issue;
		},
	},
	locations: {
		upsertLocation: async (data: Location) => {
			const location = await prisma.location.upsert({
				where: {
					latitude_longitude: {
						latitude: data.latitude,
						longitude: data.longitude,
					},
				},
				update: data,
				create: data,
			});
			return location;
		},
	},
};
