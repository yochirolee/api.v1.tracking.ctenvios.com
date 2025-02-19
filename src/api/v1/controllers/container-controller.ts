import { NextFunction, Request, Response } from "express";
import { mysql_db } from "../models/myslq/mysql_db";
import { ContainerStatus, Shipment, UpdateMethod } from "@prisma/client";
import supabase from "../config/supabase-client";
import { prisma_db } from "../models/prisma/prisma_db";
import { supabase_db } from "../models/supabase/supabase_db";
import { toCamelCase } from "../utils/_to_camel_case";
import { z } from "zod";

const containerToPortSchema = z.object({
	containerId: z.number(),
	timestamp: z.string(),
	userId: z.string(),
});

const updateContainerStatusSchema = z.object({
	containerId: z.number(),
	timestamp: z.string(),
	userId: z.string(),
	statusId: z.number(),
});
interface ParcelData {
	hbl: string;
	invoiceId?: number;
	receiver: string;
	sender: string;
	agencyId: number;
	agencyName: string;
	description: string;
	province: string;
	city: string;
}

interface Agency {
	id: number;
	name: string;
}

export const containerController = {
	getContainers: async (req: Request, res: Response) => {
		const [my_sql_containers, prisma_containers] = await Promise.all([
			mysql_db.containers.getAll(),
			prisma_db.containers.getContainers(),
		]);

		const joinedContainers = my_sql_containers.map((container) => {
			const prismaContainer = prisma_containers.find((c) => c.id === container.id);
			if (prismaContainer) {
				return { ...container, ...prismaContainer };
			}
			return container;
		});

		res.json(joinedContainers);
	},
	//container to port

	containerToPort: async (req: Request, res: Response) => {
		try {
			// Input validation using zod schema
			const validatedInput = containerToPortSchema.safeParse({
				containerId: parseInt(req.params.id),
				timestamp: req.body.timestamp,
				userId: req.user.userId,
			});

			if (!validatedInput.success) {
				return res.status(400).json({
					message: "Invalid input data",
					errors: validatedInput.error.errors,
				});
			}

			const { containerId, timestamp, userId } = validatedInput.data;

			// Fetch container data and validate existence
			const containerData = await mysql_db.containers.getById(containerId);
			if (!containerData) {
				return res.status(404).json({ message: "Container not found" });
			}

			// Parallel execution with proper error handling
			const [container, existingAgencies] = await Promise.all([
				mysql_db.containers.getParcelsByContainerId(containerId, true),
				prisma_db.agencies.getAgencies(),
			]).catch((error) => {
				throw new Error(`Failed to fetch container data: ${error.message}`);
			});

			if (!container.length) {
				return res.status(404).json({ message: "No parcels found for this container" });
			}

			// Create container in Prisma
			const createContainer = await prisma_db.containers.upsertContainer({
				id: containerId,
				containerNumber: containerData.name,
				status: ContainerStatus.IN_PORT,
				isActive: true,
			});

			// Process agencies
			const agenciesInContainer = new Map<number, Agency>();
			container.forEach((parcel: ParcelData) => {
				agenciesInContainer.set(parcel.agencyId, {
					id: parcel.agencyId,
					name: parcel.agencyName,
				});
			});

			const newAgencies = Array.from(agenciesInContainer.values()).filter(
				(agency) => !existingAgencies.some((existing) => existing.id === agency.id),
			);

			if (newAgencies.length) {
				return res.status(400).json({
					agencies: newAgencies,
					message: "New Agency found in container",
				});
			}

			// Prepare shipment data
			const shipmentsInContainer = container.map((parcel: any) => ({
				hbl: parcel.hbl,
				invoiceId: parcel?.invoiceId,
				containerId: createContainer.id,
				receiver: toCamelCase(parcel.receiver),
				sender: toCamelCase(parcel.sender),
				agencyId: parcel.agencyId,
				description: toCamelCase(parcel.description),
				statusId: 4,
				userId: userId.toString(),
				timestamp: new Date(timestamp),
				state: parcel.province,
				city: parcel.city,
				updateMethod: UpdateMethod.SYSTEM,
			}));

			// Transaction for shipments and events
			const { data: shipments, error: shipmentError } = await supabase_db.shipments.upsert(
				shipmentsInContainer as Shipment[],
			);

			if (shipmentError) {
				await prisma_db.containers.deleteContainer(containerId);
				throw new Error(`Error upserting shipments: ${shipmentError.message}`);
			}

			if (!shipments?.length) {
				return res.status(404).json({ message: "No shipments were created or updated" });
			}

			const shipmentsEvents = shipments.map((shipment) => ({
				hbl: shipment.hbl,
				statusId: shipment.statusId,
				userId: shipment.userId,
				timestamp: new Date(timestamp).toISOString(),
			}));

			const { data: eventsData, error: eventsError } = await supabase
				.from("ShipmentEvent")
				.upsert(shipmentsEvents, {
					onConflict: "hbl,statusId",
				});

			if (eventsError) {
				throw new Error(`Error upserting shipment events: ${eventsError.message}`);
			}

			return res.json({
				success: true,
				container: createContainer,
				shipments,
				events: eventsData,
			});
		} catch (error) {
			console.error("containerToPort error:", error);
			return res.status(500).json({
				message: "An error occurred while processing the container",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	updateContainerStatus: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const validatedInput = updateContainerStatusSchema.safeParse({
				containerId: parseInt(req.params.id),
				timestamp: req.body.timestamp,
				userId: req.user.userId,
				statusId: req.body.statusId,
			});

			if (!validatedInput.success) {
				return res.status(400).json({
					message: "Invalid input data",
					errors: validatedInput.error.errors,
				});
			}

			const { containerId, timestamp, userId, statusId } = validatedInput.data;
			console.log(containerId, timestamp, userId, statusId);

			const container = await prisma_db.containers.getContainerWithShipmentsById(containerId);
			if (!container) {
				return res.status(404).json({ message: "Container not found" });
			}

			const shipments = container?.shipments;
			if (!shipments) {
				return res.status(404).json({ message: "No shipments found for this container" });
			}

			//create shipment for update the staus
			const shipmentsForUpdate = shipments.map((shipment) => ({
				hbl: shipment.hbl,
				statusId: statusId,
				timestamp: new Date(timestamp).toISOString(),
				userId: userId,
			}));
			const { data: shipmentsData, error: shipmentsError } = await supabase
				.from("Shipment")
				.upsert(shipmentsForUpdate);

			if (shipmentsError) {
				throw new Error(`Error upserting shipment events: ${shipmentsError.message}`);
			}

			const shipmentEvents = shipmentsData.map((shipment) => ({
				hbl: shipment.hbl,
				statusId: shipment.statusId,
				userId: shipment.userId,
				timestamp: new Date(timestamp).toISOString(),
			}));

			const { data: eventsData, error: eventsError } = await supabase
				.from("ShipmentEvent")
				.upsert(shipmentEvents, {
					onConflict: "hbl,statusId",
				});

			if (eventsError) {
				throw new Error(`Error upserting shipment events: ${eventsError.message}`);
			}

			res.json({
				message: "Container status updated",
			});
		} catch (error) {
			res.status(500).json({ message: (error as Error).message });
		}
	},

	getShipmentsByContainerId: async (req: Request, res: Response) => {
		const containerId = parseInt(req.params.id);
		const shipments = await prisma_db.containers.getContainerWithShipmentsById(containerId);
		res.json(shipments);
	},
};
