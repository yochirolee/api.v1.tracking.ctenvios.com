import { PrismaClient, Event } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllEvents = async (): Promise<Event[]> => {
	return prisma.event.findMany();
};

export const getEventById = async (id: number): Promise<Event | null> => {
	return prisma.event.findUnique({ where: { id } });
};

export const createEvent = async (data: Omit<Event, "id" | "timestamp">): Promise<Event> => {
	return prisma.event.create({ data });
};

export const updateEvent = async (
	id: number,
	data: Partial<Omit<Event, "id" | "timestamp">>,
): Promise<Event | null> => {
	return prisma.event.update({ where: { id }, data });
};

export const deleteEvent = async (id: string) => {};

export const getEventsByParcelId = async (id: Number) => {};
