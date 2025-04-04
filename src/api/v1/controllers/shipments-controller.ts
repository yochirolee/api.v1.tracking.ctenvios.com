import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { mysql_db } from "../models/myslq/mysql_db";
import { toCamelCase } from "../utils/_to_camel_case";
import { generateMySqlEvents } from "../utils/_generate_sql_events";
import { flattenShipments, formatSearchResult } from "../utils/_format_response";
import { UpdateMethod } from "@prisma/client";
import { getLocation } from "../utils/_getLocation";
import { supabase_db } from "../models/supabase/supabase_db";

// Define interface outside the object
interface MakeDeliveryInterface {
	hbls: string[];
	statusId: number;
	timestamp: string;
	lat: number;
	loc: number;
}

export const shipmentsController = {
	getShipments: async (req: Request, res: Response) => {
		try {
			//if user is admin, get all shipments
			//if user is not admin, get shipments by agencyId
			//implementation missing
			//const user = req.user;
			const shipments = await prisma_db.shipments.getShipments({
				limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
				offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
			});

			const flattenedShipments = flattenShipments(shipments.shipments);
			res.json({ shipments: flattenedShipments, total: shipments.totalShipments });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	searchShipments: async (req: Request, res: Response) => {
		const search = req.query.query as string;

		const [search_on_mysql, total] = await mysql_db.parcels.search(search);
		if (!search_on_mysql.length) {
			return res.json({ shipments: [], total: 0 });
		}
		// Extract HBLs directly using destructuring for better performance
		const hbls = search_on_mysql.map(({ hbl }: { hbl: string }) => hbl);
		const existingShipments = await prisma_db.shipments.getShipmentsByHbls(hbls);
		const shipments = formatSearchResult(existingShipments, search_on_mysql);

		res.json({
			shipments,
			total,
		});
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

		//merge issues and events

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
	getShipmentsInInvoice: async (req: Request, res: Response) => {
		try {
			const hbl = req.params.hbl;
			if (!hbl) {
				return res.status(400).json({ message: "HBL is required" });
			}
			const result = await mysql_db.parcels.getAllParcelsInInvoiceByHbl(hbl);
			const shipment_tracking = await prisma_db.shipments.getShipmentsByInvoiceId(
				result[0].invoiceId,
			);

			const invoiceId = result[0].invoiceId;

			const shippingAddress = toCamelCase(
				[
					toCamelCase(result[0].cll),
					result[0].entre_cll ? "entre " + toCamelCase(result[0].entre_cll) : "",
					result[0].no ? "No. " + toCamelCase(result[0].no) : "",
					result[0].apto ? "Apto. " + toCamelCase(result[0].apto) : "",
					result[0].reparto ? "Reparto. " + toCamelCase(result[0].reparto) : "",
					result[0].provincia ? "Provincia. " + toCamelCase(result[0].state) : "",
					result[0].ciudad ? "Ciudad. " + toCamelCase(result[0].city) : "",
				]
					.filter(Boolean)
					.join(" "),
			);
			const count = result.length;
			const formattedShipments = {
				invoiceId: invoiceId,
				invoiceDate: result[0].invoiceDate,
				count: count,
				sender: {
					name: toCamelCase(result[0].sender),
					mobile: result[0].senderMobile,
					ci: result[0].senderCi,
				},
				receiver: {
					name: toCamelCase(result[0].receiver),
					mobile: result[0].receiverMobile,
					ci: result[0].receiverCi,
					address: shippingAddress,
					state: result[0].province,
					city: result[0].city,
				},
				
				shipments: result.map((parcel) => {
					const shipment = shipment_tracking.find((shipment) => shipment.hbl === parcel.hbl);
					return {
						hbl: parcel.hbl,
						weight: parcel.weight,
						description: toCamelCase(parcel.description),
						status: shipment?.status,
						timestamp: shipment?.timestamp,
					};
				}),
			};
			return res.json(formattedShipments);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},

	//make delivery
	deliveryShipments: async (req: Request, res: Response) => {
		try {
			const { shipments } = req.body;
			const userId = req.user.userId;

			const shipmentsToDelivery = shipments.map((shipment: any) => {
				return {
					hbl: shipment.hbl,
					statusId: shipment.statusId,
					timestamp: shipment.timestamp,
					userId: userId,
					latitude: shipment.latitude,
					longitude: shipment.longitude,
					updateMethod: UpdateMethod.SCANNER,
				};
			});
			console.log(shipmentsToDelivery, "shipmentsToDelivery");

			if (!shipments || !userId) {
				return res.status(400).json({ message: "All fields are required" });
			}
			const { data, error } = await supabase_db.events.upsert(shipmentsToDelivery);

			console.log(data, "data");
			if (error) {
				console.error(error);
				return res.status(500).json({ message: "Internal server error" });
			}
			res.json(data);
		} catch (error) {
			// Implement the rest of your logic here
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	scanShipment: async (req: Request, res: Response) => {
		try {
			const { hbl, statusId, timestamp, lat, loc } = req.body;
			const userId = req.user.userId;
			if (!hbl || !statusId || !timestamp || !userId) {
				return res.status(400).json({ message: "All fields are required" });
			}

			const eventData: any[] = [
				{
					hbl,
					userId,
					updateMethod: UpdateMethod.SCANNER,
					timestamp: new Date(timestamp),
					statusId,
					latitude: lat,
					longitude: loc,
				},
			];

			const shipment = await prisma_db.shipments.scanShipmentTransaction(eventData);

			res.json("ok");
		} catch (error) {
			console.error(error);
			console.log(error);
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
			const shipments = await prisma_db.shipments.scannedShipments(userId, statusId);
			res.json(shipments);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	},
	//a stats for the shipments
};
