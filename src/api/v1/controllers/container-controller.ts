import { Request, Response } from "express";
import { mysql_db } from "../models/myslq/mysql_db";
import { ContainerStatus, ShipmentStatus } from "@prisma/client";
import supabase from "../config/supabase-client";
import { prisma_db } from "../models/prisma/prisma_db";
import { toCamelCase } from "../../../lib/_toCamelCase";

export const containerController = {
	getContainers: async (req: Request, res: Response) => {
		const containers = await mysql_db.containers.getAll();
		res.json(containers);
	},
	//container to port

	containerToPort: async (req: Request, res: Response) => {
		try {
			const containerId = parseInt(req.params.id);
			const timestamp = req.body.timestamp;
			const userId = req.user.userId;

			if (!containerId || !timestamp || !userId) {
				return res.status(400).json({ message: "Container ID, timestamp and userId are required" });
			}

			// Parallel execution of container operations
			const [createContainer, container] = await Promise.all([
				prisma_db.containers.upsertContainer({
					id: containerId,
					containerNumber: "1234567890",
					status: ContainerStatus.IN_PORT,
				}),
				mysql_db.containers.getParcelsByContainerId(containerId, false),
			]);

			if (!container.length) {
				return res.status(404).json({ message: "No parcels found for this container" });
			}

			const shipmentsInContainer = container.map((parcel) => ({
				hbl: parcel.hbl,
				invoiceId: parcel?.invoiceId,
				containerId: createContainer.id,
				locationId: 4,
				status: ShipmentStatus.IN_PORT,
				userId: userId,
				timestamp: timestamp,
			}));

			// Perform shipment upsert
			const { data, error } = await supabase.from("Shipment").upsert(shipmentsInContainer, {
				onConflict: "hbl",
			});

			if (error) {
				throw new Error(`Error upserting shipments: ${error.message}`);
			}

			if (!data) {
				return res.status(404).json({ message: "No shipments were created or updated" });
			}

			const shipmentsEvents = data.map((shipment) => ({
				hbl: shipment.hbl,
				locationId: shipment.locationId,
				status: shipment.status,
				userId: shipment.userId,
				description: "Arrived at Mariel Port",
				timestamp: timestamp,
			}));

			const { data: eventsData, error: eventsError } = await supabase
				.from("ShipmentEvent")
				.upsert(shipmentsEvents, {
					onConflict: "hbl,locationId,status",
				});

			if (eventsError) {
				throw new Error(`Error upserting shipment events: ${eventsError.message}`);
			}

			return res.json(eventsData);
		} catch (error) {
			console.error("containerToPort error:", error);
			return res.status(500).json({
				message: "An error occurred while processing the container",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},
};
