import { NextFunction, Request, Response } from "express";
import { mysql_db } from "../models/myslq/mysql_db";
import { ContainerStatus, Shipment, UpdateMethod } from "@prisma/client";
import supabase from "../config/supabase-client";
import { prisma_db } from "../models/prisma/prisma_db";
import { supabase_db } from "../models/supabase/supabase_db";
import { toCamelCase } from "../utils/_to_camel_case";
import { z } from "zod";
import { flattenShipments } from "../utils/_format_response";
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
	agency: string;
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

			// Parallel fetch of container data and parcels
			const [containerData, container] = await Promise.all([
				mysql_db.containers.getById(containerId),
				mysql_db.containers.getParcelsByContainerId(containerId, true),
			]);

			if (!containerData) {
				return res.status(404).json({ message: "Container not found" });
			}

			if (!container.length) {
				return res.status(404).json({ message: "No parcels found for this container" });
			}

			// Parallel execution of container creation and agencies processing
			const [createContainer, agenciesResult] = await Promise.all([
				prisma_db.containers.upsertContainer({
					id: containerId,
					containerNumber: containerData.name,
					status: ContainerStatus.IN_PORT,
					isActive: true,
				}),
				(async () => {
					const agenciesMap = new Map<number, Agency>();
					container.forEach((parcel: ParcelData) => {
						agenciesMap.set(parcel.agencyId, {
							id: parcel.agencyId,
							name: toCamelCase(parcel.agency),
						});
					});
					return supabase_db.agencies.upsert(Array.from(agenciesMap.values()));
				})(),
			]);

			if (agenciesResult.error) {
				throw new Error(`Error upserting agencies: ${agenciesResult.error.message}`);
			}

			// Prepare data for parallel shipments and events creation
			const fulltimestamp = new Date(
				new Date(timestamp).setHours(
					new Date().getHours(),
					new Date().getMinutes(),
					new Date().getSeconds(),
				),
			).toISOString();

			const shipmentsData = await Promise.all(
				container.map((parcel) => ({
					shipmentsInContainer: {
						hbl: parcel.hbl,
						invoiceId: parcel?.invoiceId,
						containerId: createContainer.id,
						receiver: toCamelCase(parcel.receiver),
						sender: toCamelCase(parcel.sender),
						agencyId: parcel.agencyId,
						description: toCamelCase(parcel.description),
						weight: parcel?.weight,
						userId: userId.toString(),
						state: parcel.province,
						city: parcel.city,
						statusId: 4,
						timestamp: fulltimestamp,
					},
					shipmentEvents: {
						hbl: parcel.hbl,
						statusId: 4,
						userId: userId.toString(),
						timestamp: fulltimestamp,
					},
				})),
			);

			const shipmentsInContainer = shipmentsData.map((data) => data.shipmentsInContainer);
			const shipmentEvents = shipmentsData.map((data) => data.shipmentEvents);

			// Parallel execution of shipments and events creation
			const { error: shipmentsError } = await supabase
				.from("Shipment")
				.upsert(shipmentsInContainer);

			if (shipmentsError) {
				await prisma_db.containers.deleteContainer(containerId);
				throw new Error(`Error upserting shipments: ${shipmentsError.message}`);
			}

			const { error: eventsError } = await supabase.from("ShipmentEvent").upsert(
				shipmentEvents.map((shipment) => ({
					hbl: shipment.hbl,
					statusId: 4,
					userId: shipment.userId,
					timestamp: fulltimestamp,
				})),
				{ onConflict: "hbl,statusId" },
			);

			if (eventsError) {
				throw new Error(`Error upserting shipment events: ${eventsError.message}`);
			}

			return res.json({
				success: true,
				message: "Container to port processed successfully",
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
			const fulltimestamp = new Date(
				new Date(timestamp).setHours(
					new Date().getHours(),
					new Date().getMinutes(),
					new Date().getSeconds(),
				),
			).toISOString();
			const container = await prisma_db.containers.getContainerWithShipmentsById(containerId);
			if (!container) {
				return res.status(404).json({ message: "Container not found" });
			}

			const shipments = container?.shipments;
			if (!shipments) {
				return res.status(404).json({ message: "No shipments found for this container" });
			}

			//create shipment for update the staus

			const shipmentEvents = shipments.map((shipment) => ({
				hbl: shipment.hbl,
				statusId: statusId,
				userId: userId,
				timestamp: fulltimestamp,
			}));

			const { error: eventsError } = await supabase.from("ShipmentEvent").upsert(shipmentEvents, {
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
		const container = await prisma_db.containers.getContainerWithShipmentsById(containerId);
		const flattenedShipments = flattenShipments(container?.shipments);
		if (container) container.shipments = flattenedShipments;

		res.json(container);
	},
};
