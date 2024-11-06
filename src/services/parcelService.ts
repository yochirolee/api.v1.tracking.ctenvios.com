import { PrismaClient, Parcel, Event, ParcelStatus, UpdateMethod } from "@prisma/client";
import supabase from "../databases/supabase/supabase_client";

type ParcelWithEvents = Parcel & { events: Array<Omit<Event, "location"> & { location: string }> };

const prisma = new PrismaClient();

export const getAllParcels = async (): Promise<Parcel[]> => {
	return prisma.parcel.findMany();
};

export const getParcelById = async (hbl: string): Promise<Parcel | null> => {
	return prisma.parcel.findUnique({ where: { hbl } });
};

export const getParcelAndEventsByInvoiceId = async (
	invoiceId: number,
): Promise<ParcelWithEvents | null> => {
	const result = await prisma.parcel.findFirst({
		where: { invoiceId },
		include: {
			events: {
				include: {
					location: true,
				},
			},
			currentLocation: true,
		},
	});

	if (!result) return null;

	const formattedEvents = result.events.map((event) => ({
		id: event.id,
		hbl: event.hbl,
		locationId: event.locationId,
		timestamp: event.timestamp,
		status: event.status,
		userId: event.userId,
		updateMethod: event.updateMethod,
		location: event.location?.name ?? "Unknown", // Use optional chaining and provide a fallback
		description: event.description,
	}));

	return {
		...result,
		events: formattedEvents,
	} as ParcelWithEvents;
};

export const createParcel = async (
	data: Omit<Parcel, "createdAt" | "updatedAt">,
): Promise<Parcel> => {
	return prisma.parcel.create({ data });
};

export const updateParcel = async (
	hbl: string,
	data: Partial<Omit<Parcel, "createdAt" | "updatedAt">>,
): Promise<Parcel | null> => {
	return prisma.parcel.update({ where: { hbl }, data });
};

export const parcelsBulkUpdate = async (parcels: Parcel[]): Promise<Parcel[]> => {
	// Use Prisma transaction to ensure all updates are atomic
	return prisma.$transaction(
		parcels.map((parcel) =>
			prisma.parcel.update({
				where: { hbl: parcel.hbl },
				data: {
					// Specify each field you want to update
					status: parcel.status,
					currentLocationId: parcel.currentLocationId,
					userId: parcel.userId,
					updateMethod: parcel.updateMethod ? parcel.updateMethod : UpdateMethod.SYSTEM,
					// Add other fields you want to update
					// Make sure to exclude createdAt, updatedAt, and any computed fields
				},
			}),
		),
	);
};

export const deleteParcel = async (hbl: string): Promise<Parcel | null> => {
	return prisma.parcel.delete({ where: { hbl } });
};



///////
export const getParcelsByHblArray = async (hbl_array: string[]): Promise<Parcel[]> => {
	try {
		const parcels = await prisma.parcel.findMany({
			where: {
				hbl: {
					in: hbl_array,
				},
			},
			include: {
				currentLocation: true,
			},
		});
		return parcels;
	} catch (error) {
		console.error("Error fetching parcels:", error);
		throw error;
	}
};

export const getParcelHistoryByHbl = async (hbl: string) => {
	const parcel = await prisma.parcel.findFirst({
		where: {
			hbl: hbl,
		},
		include: {
			events: true,
		},
	});

	return parcel;
};
