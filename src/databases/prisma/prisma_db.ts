import { PrismaClient, IssueStatus, User } from "@prisma/client";

const prisma = new PrismaClient();

export const prisma_db = {
	/*	parcels: {
		getAll: async () => {
			try {
				const parcels = await prisma.parcel.findMany();
				return parcels;
			} catch (error) {
				console.error("Error fetching all parcels:", error);
				throw error;
			}
		},
		getByHbl: async (hbl: string) => {
			try {
				const parcel = await prisma.parcel.findUnique({
					where: { hbl },
					include: {
						events: {
							include: {
								issues: {
									include: {
										comments: true,
									},
								},
								location: true,
							},
						},
						currentLocation: true,
					},
				});
				console.log(parcel);
				return parcel;
			} catch (error) {
				console.error(`Error fetching parcel with HBL ${hbl}:`, error);
				throw error;
			}
		},
		getByHblArray: async (hbl_array: string[]) => {
			try {
				const parcels = await prisma.parcel.findMany({
					where: {
						hbl: { in: hbl_array },
					},
					include: {
						currentLocation: true,
					},
				});
				return parcels;
			} catch (error) {
				console.error("Error fetching parcels by HBL array:", error);
				throw error;
			}
		},
	}, */
	events: {
		getLatestEvents: async (hbl_array: string[]) => {
			const event = await prisma.event.findMany({
				where: { hbl: { in: hbl_array } },
				include: {
					location: true,
					status: true,
				},

				orderBy: [{ updatedAt: "desc" }, { locationId: "desc" }],
				distinct: ["hbl"],
			});

			return event;
		},
		getEventsByHbl: async (hbl_array: string[]) => {
			const events = await prisma.event.findMany({
				where: { hbl: { in: hbl_array } },
				include: {
					location: true,
					status: true,
				},
			});
			const eventsWithLocationName = events.map((event) => ({
				...event,
				locationName: event.location.name,
				status: event.status.status,
			}));
			return eventsWithLocationName;
		},
	},
	issues: {
		getAll: async () => {
			const issues = await prisma.issue.findMany({
				include: {
					comments: true,
				},
			});
			return issues;
		},
		resolve: async (id: number) => {
			const issue = await prisma.issue.update({
				where: { id },
				data: { resolvedAt: new Date(), status: IssueStatus.RESOLVED },
			});
			return issue;
		},
	},
	users: {
		getAll: async () => {
			const users = await prisma.user.findMany();
			return users;
		},
		getById: async (id: string) => {
			const user = await prisma.user.findUnique({ where: { id } });
			return user;
		},
		getByEmail: async (email: string) => {
			const user = await prisma.user.findUnique({ where: { email } });
			return user;
		},
		create: async (user: User) => {
			const newUser = await prisma.user.create({ data: user });
			return newUser;
		},
		update: async (id: string, user: User) => {
			const updatedUser = await prisma.user.update({ where: { id }, data: user });
			return updatedUser;
		},
	},
};
