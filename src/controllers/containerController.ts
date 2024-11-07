import { mysql_db } from "../databases/mysql/mysql_db";
import { Request, Response, NextFunction } from "express";
import { formatResult } from "../lib/_formatResult";
import { prisma_db } from "../databases/prisma/prisma_db";
import { EventType, ParcelStatus, Event, UpdateMethod } from "@prisma/client";
import { supabase_db } from "../databases/supabase/supabase_db";
import { createUTCDate } from "../lib/_excel_helpers";

const getAll = async (req: Request, res: Response, next: NextFunction) => {
	const containers = await mysql_db.containers.getAll();
	res.json(containers);
};

const getById = async (req: Request, res: Response, next: NextFunction) => {
	const container = await mysql_db.containers.getById(parseInt(req.params.id));
	res.json(container);
};
const getParcelsByContainerId = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.params.id) {
		return res.status(400).json({ message: "Container ID is required" });
	}
	try {
		const containerId = parseInt(req.params.id);
		const mysql_parcels = await mysql_db.containers.getParcelsByContainerId(containerId, true);
		const latestEvents = await prisma_db.events.getLatestEvents(
			mysql_parcels.map((parcel) => parcel.hbl),
		);

		const formattedParcels = formatResult(mysql_parcels, latestEvents);
		res.json({
			inPort: latestEvents?.length > 0,
			data: formattedParcels,
		});
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};

type ContainerEventConfig = {
	[key: string]: {
		status: ParcelStatus;
		locationId: number;
		description: string;
	};
};

const CONTAINER_EVENTS: ContainerEventConfig = {
	TO_PORT: {
		status: ParcelStatus.EN_CONTENEDOR,
		locationId: 4,
		description: "Su paquete ha arribado al puerto del Mariel",
	},

	TO_WAREHOUSE: {
		status: ParcelStatus.EN_ESPERA_DE_AFORO,
		locationId: 5,
		description: "Su paquete ha sido trasladado a la bodega",
	},
	AFORADO: {
		status: ParcelStatus.AFORADO,
		locationId: 5,
		description: "Su paquete ha sido trasladado a la bodega",
	},
};

const updateContainerStatus = async (req: Request, res: Response, next: NextFunction) => {
	const { containerId, updatedAt, userId, eventType } = req.body;

	if (!containerId || !updatedAt || !eventType) {
		return res.status(400).json({
			message: "Container ID, updatedAt and eventType are required",
		});
	}

	if (!CONTAINER_EVENTS[eventType]) {
		return res.status(400).json({
			message: "Invalid event type",
		});
	}

	try {
		const mysql_parcels = await mysql_db.containers.getParcelsByContainerId(containerId, true);
		const { status, locationId, description } = CONTAINER_EVENTS[eventType];

		const createdEvents = createEvents(
			mysql_parcels,
			userId,
			updatedAt,
			status,
			locationId,
			UpdateMethod.SYSTEM,
			EventType.UPDATE,
			description,
		);

		const events = await supabase_db.events.upsert(createdEvents as any); // Type assertion needed due to Event type mismatch
		res.json(events);
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};

const createEvents = (
	mysql_parcels: any[],
	userId: number,
	updatedAt: string,
	status: ParcelStatus,
	locationId: number,
	updateMethod: UpdateMethod = UpdateMethod.SYSTEM,
	type: EventType = EventType.UPDATE,
	description: string,
): Omit<Event, "id">[] => {
	return mysql_parcels.map((parcel) => ({
		hbl: parcel.hbl,
		status,
		locationId,
		userId: userId.toString(),
		type,
		updateMethod,
		description,
		updatedAt: createUTCDate(new Date(updatedAt)),
	}));
};

export const containerController = {
	getAll,
	getById,
	getParcelsByContainerId,
	updateContainerStatus,
};
