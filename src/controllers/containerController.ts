import { mysql_db } from "../databases/mysql/mysql_db";
import { Request, Response, NextFunction } from "express";
import { formatResult } from "../lib/_formatResult";
import { prisma_db } from "../databases/prisma/prisma_db";
import { EventType, Status, Event, UpdateMethod } from "@prisma/client";
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
		statusId: number;
		locationId: number;
	};
};

const CONTAINER_EVENTS: ContainerEventConfig = {
	CONTAINER_TO_PORT: {
		statusId: 4,
		locationId: 4,
	},
	//desagrupado pendient Aduana
	CONTAINER_TO_CUSTOMS: {
		statusId: 5,
		locationId: 5,
	},
	//almacen  aforado
	CONTAINER_WAREHOUSE: {
		statusId: 6,
		locationId: 6,
	},
};

const updateContainerStatus = async (req: Request, res: Response, next: NextFunction) => {
	const { containerId, updatedAt, userId, eventType } = req.body;
	console.log(req.body, containerId, updatedAt, userId, eventType);
	//valid types: CONTAINER_TO_PORT, CONTAINER_TO_CUSTOMS, CONTAINER_WAREHOUSE
	if (!Object.keys(CONTAINER_EVENTS).includes(eventType)) {
		return res.status(400).json({
			message: "Invalid event type for container update",
		});
	}
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
		const { statusId, locationId } = CONTAINER_EVENTS[eventType];

		const createdEvents = createEvents(
			mysql_parcels,
			userId,
			updatedAt,
			statusId,
			locationId,
			UpdateMethod.SYSTEM,
			EventType.UPDATE,
		);
		const [_, eventsUpserted] = await Promise.all([
			supabase_db.parcels.upsert(
				mysql_parcels.map((el) => ({
					hbl: el.hbl,
					containerId: el.containerId,
					invoiceId: el.invoiceId,
					agencyId: el.agencyId,
				})),
			),
			supabase_db.events.upsert(createdEvents),
		]); // Type assertion needed due to Event type mismatch
		res.json(eventsUpserted);
	} catch (error) {
		res.status(500).json({ message: (error as Error).message });
	}
};

const createEvents = (
	mysql_parcels: any[],
	userId: number,
	updatedAt: string,
	statusId: number,
	locationId: number,
	updateMethod: UpdateMethod = UpdateMethod.SYSTEM,
	type: EventType = EventType.UPDATE,
): any[] => {
	return mysql_parcels.map(
		(parcel) =>
			({
				hbl: parcel.hbl,
				statusId,
				locationId,
				userId: userId.toString(),
				type,
				updateMethod,
				updatedAt: createUTCDate(new Date(updatedAt)),
			} as Event),
	);
};

export const containerController = {
	getAll,
	getById,
	getParcelsByContainerId,
	updateContainerStatus,
};
