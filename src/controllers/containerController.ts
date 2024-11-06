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
const toPort = async (req: Request, res: Response, next: NextFunction) => {
	const { containerId, updatedAt, userId } = req.body;
	if (!containerId || !updatedAt) {
		return res.status(400).json({ message: "Container ID and updatedAt are required" });
	}
	const mysql_parcels = await mysql_db.containers.getParcelsByContainerId(containerId, true);
	const createdEvents = createEvents(
		mysql_parcels,
		userId,
		updatedAt,
		ParcelStatus.EN_CONTENEDOR,
		4,
	);
	const events = await supabase_db.events.upsert(createdEvents);
	res.json(events);
};

const toWarehouse = async (req: Request, res: Response, next: NextFunction) => {
	const { containerId, updatedAt, userId } = req.body;
	if (!containerId || !updatedAt) {
		return res.status(400).json({ message: "Container ID and updatedAt are required" });
	}
	const mysql_parcels = await mysql_db.containers.getParcelsByContainerId(containerId, true);
	const createdEvents = createEvents(
		mysql_parcels,
		userId,
		updatedAt,
		ParcelStatus.EN_ESPERA_DE_AFORO,
		5,
	);
	const events = await supabase_db.events.upsert(createdEvents);
	res.json(events);
};

const createEvents = (
	mysql_parcels: any[],
	userId: number,
	updatedAt: string,
	status: ParcelStatus,
	locationId: number,
	updateMethod: UpdateMethod = UpdateMethod.SYSTEM,
	type: EventType = EventType.UPDATE,
) => {
	const createdEvents: any[] = mysql_parcels.map((parcel) => ({
		hbl: parcel.hbl,
		status: status,
		locationId: locationId,
		userId,
		type: type,
		updateMethod: updateMethod,
		description: "Su paquete a arribado al puerto del Mariel",
		updatedAt: createUTCDate(new Date(updatedAt)),
	}));
	return createdEvents;
};

export const containerController = {
	getAll,
	getById,
	getParcelsByContainerId,
	toPort,
	toWarehouse,
};
