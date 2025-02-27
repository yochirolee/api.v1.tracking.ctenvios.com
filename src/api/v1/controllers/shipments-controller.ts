import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { mysql_db } from "../models/myslq/mysql_db";
import { toCamelCase } from "../utils/_to_camel_case";
import { generateMySqlEvents } from "../utils/_generate_sql_events";
import { formatSearchResult } from "../utils/_format_search";
import { Shipment, UpdateMethod } from "@prisma/client";
import axios from "axios";
import { getLocation } from "../utils/_getLocation";

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

		const search_on_mysql = await mysql_db.parcels.search(search);

		//get all the hbl from the search
		const hbls = search_on_mysql?.map((el) => el.hbl);
		const existingShipments = await prisma_db.shipments.getShipmentsByHbls(hbls);
		const shipments = formatSearchResult(existingShipments, search_on_mysql);

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
	/* scanShipment: async (req: Request, res: Response) => {
		try {
			const hbl = req.params.hbl;
			if (!hbl) {
				return res.status(400).json({ message: "HBL is required" });
			}
			let shipment = await prisma_db.shipments.scanShipment(hbl);

			if (shipment) {
				const invoiceId = shipment?.invoiceId;
				if (!invoiceId) {
					return res.status(404).json({ message: "Invoice ID not found" });
				}
				const result = await prisma_db.shipments.getShipmentsByInvoiceId(invoiceId);
				return res.json(result);
			} else {
				const mysql_parcel = await mysql_db.parcels.getInHblArray([hbl], false);
				if (!mysql_parcel.length) {
					return res.status(404).json({ message: "Shipment not found" });
				}

				const invoiceId = mysql_parcel[0].invoiceId;
				const result = await mysql_db.parcels.getByInvoiceId(invoiceId);
				return res.json(result);
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	}, */

	scanShipment: async (req: Request, res: Response) => {
		try {
			const { hbl, statusId, timestamp, lat, loc } = req.body;
			const userId = req.user.userId;
			if (!hbl || !statusId || !timestamp || !userId) {
				return res.status(400).json({ message: "All fields are required" });
			}

			/* 	const shipmentData = {
				hbl,
				invoiceId: null,
				description: null,
				containerId: null,
				userId: userId,
				agencyId: 0,
				timestamp: timestamp,
				state: null,
				city: null,
				sender: null,
				receiver: null,
				updateMethod: null,
				statusId: statusId,
				locationId: null,
			}; */

			const locationData = {
				latitude: lat,
				longitude: loc,
				name: null,
				address: null,
				state: null,
				city: null,
				country_code: null,
				updatedAt: new Date(),
				createdAt: new Date(),
			};
			const location = await getLocation(lat, loc);
			locationData.name = location?.display_name;
			locationData.state = location?.address?.state;
			locationData.city = location?.address?.city;
			locationData.country_code = location?.address?.country_code;
			locationData.updatedAt = new Date();

			const shipmentData = {
				hbl,
				statusId,
				userId,
				updateMethod: UpdateMethod.SCANNER,
				timestamp: new Date(timestamp),
			};

			const shipment = await prisma_db.shipments.scanShipmentTransaction(
				shipmentData,
				locationData,
			);
			res.json(shipment);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	scannedShipments: async (req: Request, res: Response) => {
		try {
			const statusId = parseInt(req.params.statusId);
			const userId = req.user.userId;
			if (!statusId) {
				return res.status(400).json({ message: "Status ID is required" });
			}
			const shipments = await prisma_db.shipments.scannedShipments(statusId, userId);
			res.json(shipments);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	//a stats for the shipments
};
