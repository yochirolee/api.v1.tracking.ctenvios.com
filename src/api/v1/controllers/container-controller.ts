import { Request, Response } from "express";
import { mysql_db } from "../models/myslq/mysql_db";
import { ContainerStatus, Shipment, Status } from "@prisma/client";
import supabase from "../config/supabase-client";
import { prisma_db } from "../models/prisma/prisma_db";
import { supabase_db } from "../models/supabase/supabase_db";
import { formatSearchResult } from "../utils/format_search";
import { toCamelCase } from "../utils/_to_camel_case";
import Joi from "joi";
import { z } from "zod";

const containerToPortSchema = z.object({
	containerId: z.number(),
	timestamp: z.string(),
	userId: z.number(),
});

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
			const containerData = await mysql_db.containers.getById(containerId);

			// Parallel execution of container operations
			const [createContainer, container] = await Promise.all([
				prisma_db.containers.upsertContainer({
					id: containerId,
					containerNumber: containerData.name,
					status: ContainerStatus.IN_PORT,
					is_active: true,
				}),
				mysql_db.containers.getParcelsByContainerId(containerId, true),
			]);

			if (!container.length) {
				return res.status(404).json({ message: "No parcels found for this container" });
			}

			const agenciesInContainer = container.map((parcel) => ({
				id: parcel.agencyId,
				name: parcel.agencyName,
			}));
			//check if the agency is already in the database
			const existingAgencies = await prisma_db.agencies.getAgencies();
			//unique agencies
			const uniqueAgencies = [...new Set(agenciesInContainer)];
			const newAgencies = uniqueAgencies.filter(
				(agency) => !existingAgencies.some((existingAgency) => existingAgency.id === agency.id),
			);
			//create new agencies
			if (newAgencies.length) {
				return res
					.status(400)
					.json({ agencies: newAgencies, message: "New Agency found in container" });
			}
			// Perform shipment upsert
			const shipmentsInContainer = container.map((parcel) => ({
				hbl: parcel.hbl,
				invoiceId: parcel?.invoiceId,
				containerId: createContainer.id,
				receiver: toCamelCase(parcel.receiver),
				sender: toCamelCase(parcel.sender),
				agencyId: parcel.agencyId,
				description: toCamelCase(parcel.description),
				statusId: 4,
				userId: userId,
				timestamp: timestamp,
				state: parcel.province,
				city: parcel.city,
			}));
			const { data, error } = await supabase_db.shipments.upsert(
				shipmentsInContainer as Shipment[],
			);

			if (error) {
				await prisma_db.containers.deleteContainer(containerId);
				throw new Error(`Error upserting shipments: ${error.message}`);
			}

			if (!data) {
				return res.status(404).json({ message: "No shipments were created or updated" });
			}

			const shipmentsEvents = data.map((shipment) => ({
				hbl: shipment.hbl,
				statusId: shipment.statusId,
				userId: shipment.userId,
				timestamp: timestamp,
			}));

			const { data: eventsData, error: eventsError } = await supabase
				.from("ShipmentEvent")
				.upsert(shipmentsEvents, {
					onConflict: "hbl,statusId",
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
	getShipmentsByContainerId: async (req: Request, res: Response) => {
		const containerId = parseInt(req.params.id);
		const shipments = await prisma_db.containers.getContainerById(containerId);
		res.json(shipments);
	},
};
