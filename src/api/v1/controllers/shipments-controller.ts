import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { mysql_db } from "../models/myslq/mysql_db";
import { toCamelCase } from "../utils/_to_camel_case";
import { generateMySqlEvents } from "../utils/_generate_sql_events";

export const shipmentsController = {
	getShipments: async (req: Request, res: Response) => {
		try {
			//if user is admin, get all shipments
			//if user is not admin, get shipments by agencyId
			//implementation missing
			const shipments = await prisma_db.shipments.getShipments({
				limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
				offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
			});
			/* const hbls = existingShipments.map((el) => el.hbl);
			const search_on_mysql = await mysql_db.parcels.getInHblArray(hbls, true);
			const shipments = formatSearchResult(existingShipments, search_on_mysql);
		 */ res.json(shipments);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	searchShipments: async (req: Request, res: Response) => {
		const search = req.query.query as string;
		/* 	 	let shipments = await prisma_db.shipments.searchShipments(search);
		if (shipments.length === 0) { 
		const search_on_mysql = await mysql_db.parcels.search(search);

		//get all the hbl from the search
		const hbls = search_on_mysql?.map((el) => el.hbl);
		const existingShipments = await prisma_db.shipments.getShipmentsByHbls(hbls);
		const shipments = formatSearchResult(existingShipments, search_on_mysql);
*/

		const shipments = await prisma_db.shipments.searchShipments(search);
		res.json(shipments);
	},
	getShipmentByHbl: async (req: Request, res: Response) => {
		const hbl = req.params.hbl;
		if (!hbl) {
			return res.status(400).json({ message: "HBL is required" });
		}
		const [shipment, search_on_mysql] = await Promise.all([
			prisma_db.shipments.getShipmentByHbl(hbl),
			mysql_db.parcels.getInHblArray([hbl], true),
		]);

		const mslq_parcel = search_on_mysql[0];
		const mysql_events = generateMySqlEvents(mslq_parcel);
		const shippingAddress = toCamelCase(
			[
				toCamelCase(mslq_parcel.cll),
				mslq_parcel.entre_cll ? "entre " + toCamelCase(mslq_parcel.entre_cll) : "",
				mslq_parcel.no ? "No. " + toCamelCase(mslq_parcel.no) : "",
				mslq_parcel.apto ? "Apto. " + toCamelCase(mslq_parcel.apto) : "",
				mslq_parcel.reparto ? "Reparto. " + toCamelCase(mslq_parcel.reparto) : "",
			]
				.filter(Boolean)
				.join(" "),
		);
		const shipment_with_mysql = {
			hbl: mslq_parcel.hbl,
			invoiceId: mslq_parcel.invoiceId,
			weight: mslq_parcel.weight,
			agency: {
				id: mslq_parcel.agencyId,
				name: mslq_parcel.agency,
			},
			invoiceDate: mslq_parcel.invoiceDate,
			description: toCamelCase(mslq_parcel.description),
			sender: {
				name: toCamelCase(mslq_parcel.sender),
				mobile: mslq_parcel.senderMobile,
			},
			receiver: {
				name: toCamelCase(mslq_parcel.receiver),
				mobile: mslq_parcel.receiverMobile,
				address: shippingAddress,
				ci: mslq_parcel.receiverCi,
				state: mslq_parcel.province,
				city: mslq_parcel.city,
			},
			events: [...mysql_events, ...(shipment?.events || [])],
		};
		res.json(shipment_with_mysql);
	},
	scanShipment: async (req: Request, res: Response) => {
		try {
			const hbl = req.params.hbl;
			const shipment = await prisma_db.shipments.scanShipment(hbl);
			// i need the invoiceId and then all the shipments with that invoiceId
			const invoiceId = shipment?.invoiceId;
			if (!invoiceId) {
				return res.status(404).json({ message: "Invoice ID not found" });
			}
			const result = await prisma_db.shipments.getShipmentsByInvoiceId(invoiceId);
			res.json(result);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	updateShipment: async (req: Request, res: Response) => {
		try {
			const { hbl, statusId, userId, updateMethod } = req.body;

			const shipment = await prisma_db.shipments.updateShipment(hbl, {
				statusId,
				userId,
				updateMethod,
			});

			res.json(shipment);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	updateManyShipments: async (req: Request, res: Response) => {
		try {
			const { hbls, statusId, updateMethod, timestamp } = req.body;
			const userId = req.user?.id;
			const shipments = await prisma_db.shipments.updateManyShipments(hbls, {
				statusId,
				updateMethod,
				userId,
				timestamp,
			});
			res.json(shipments);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},

	//a stats for the shipments
};
