import { Issue, PrismaClient, Prisma, ParcelStatus, EventType, IssueStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const prisma_db = {
	/* 	parcels: {
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
				},
			});
			const eventsWithLocationName = events.map((event) => ({
				...event,
				locationName: event.location.name,
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
	/* containers: {
		getByContainerId: async (containerId: number) => {
			const containers = await prisma.parcel.findMany({
				where: { containerId: containerId },
				include: {
					currentLocation: true,
				},
			});
			return containers;
		},
	}, */
};
