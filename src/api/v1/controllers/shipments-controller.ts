import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { mysql_db } from "../models/myslq/mysql_db";
import { toCamelCase } from "../../../lib/_toCamelCase";
import { formatSearchResult } from "../utils/format_search";
import { ShipmentStatus } from "@prisma/client";

export const shipmentsController = {
	getShipments: async (req: Request, res: Response) => {
		try {
			const existingShipments = await prisma_db.shipments.getShipments({
				limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
				offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
			});
			const hbls = existingShipments.map((el) => el.hbl);
			const search_on_mysql = await mysql_db.parcels.getInHblArray(hbls, true);
			const shipments = formatSearchResult(existingShipments, search_on_mysql);
			res.json(shipments);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	searchShipments: async (req: Request, res: Response) => {
		const search = req.query.query as string;
		/* 	let shipments = await prisma_db.shipments.searchShipments(search);
		if (shipments.length === 0) { */
		const search_on_mysql = await mysql_db.parcels.search(search);

		//get all the hbl from the search
		const hbls = search_on_mysql?.map((el) => el.hbl);
		const existingShipments = await prisma_db.shipments.getShipmentsByHbls(hbls);
		const shipments = formatSearchResult(existingShipments, search_on_mysql);

		/* 	const shipments = await Promise.all(
			search_on_mysql?.parcels?.map(async (el) => {
				const shipment = await prisma_db.shipments.getShipmentByHbl(el.hbl);
				if (shipment) {
					return shipment;
				}
				const lastEvent = getMySqlParcelLastEvent(el);
				return {
					hbl: el.hbl,
					invoiceId: el.invoiceId,
					description: toCamelCase(el.description),
					location: {
						name: lastEvent?.location,
						id: lastEvent?.locationId,
						status: lastEvent?.status,
						statusDetails: lastEvent?.statusDetails,
						description: lastEvent?.description,
					},
					agencyId: null,
					status: lastEvent?.status,
					userId: "42cbb03e-9d73-47a6-857e-77527c02bdc2",

					sender: toCamelCase(el.sender),
					receiver: toCamelCase(el.receiver),
					timestamp: lastEvent?.timestamp,
					updateType: "SYSTEM",
					state: el.province,
					city: el.city,
					invoiceDate: el.invoiceDate,
					agency: {
						name: el.agency,
						id: el.agencyId,
					},
					container: {
						id: el.containerId ? el.containerId : null,
						name: el.containerName ? el.containerName : null,
					},
				};
			}),
		); */

		res.json(shipments);
	},
	getShipmentByHbl: async (req: Request, res: Response) => {
		const hbl = req.params.hbl;
		const [shipment, search_on_mysql] = await Promise.all([
			prisma_db.shipments.getShipmentByHbl(hbl),
			mysql_db.parcels.getInHblArray([hbl], true),
		]);
		const createMySqlEvents = (search_on_mysql: any) => {
			const events = [];
			if (search_on_mysql?.invoiceDate) {
				events.push({
					timestamp: search_on_mysql.invoiceDate,
					status: ShipmentStatus.CREATED,
					locationId: 1,
					description: "Invoice date",
					updateMethod: "SYSTEM",
				});
			}
			if (search_on_mysql?.dispatchDate) {
				events.push({
					timestamp: search_on_mysql.dispatchDate,
					locationId: 2,
					status: ShipmentStatus.DISPATCH,
					description: "Dispatch" + search_on_mysql.dispatchId,
					updateMethod: "SYSTEM",
				});
			}
			if (search_on_mysql?.palletDate) {
				events.push({
					timestamp: search_on_mysql.palletDate,
					locationId: 2,
					status: ShipmentStatus.IN_PALLET,
					description: "Pallet" + search_on_mysql.palletId,
					updateMethod: "SYSTEM",
				});
			}
			return events;
		};
		console.log(createMySqlEvents(search_on_mysql[0]));
		const shipment_with_mysql = {
			...search_on_mysql[0],
			events: [...createMySqlEvents(search_on_mysql[0]), ...(shipment?.events || [])],
		};
		res.json(shipment_with_mysql);
	},

	//a stats for the shipments
};
