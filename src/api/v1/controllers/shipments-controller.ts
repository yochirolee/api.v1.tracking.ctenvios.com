import { Request, Response } from "express";
import { prisma_db } from "../models/prisma/prisma_db";
import { mysql_db } from "../models/myslq/mysql_db";
import { supabase_db } from "../models/supabase/supabase_db";
import { formatSearchResult } from "../utils/format_search";
import { z } from "zod";

export const shipmentsController = {
	getShipments: async (req: Request, res: Response) => {
		try {
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
		/* const hbl = req.params.hbl;
		const [shipment, search_on_mysql] = await Promise.all([
			prisma_db.shipments.getShipmentByHbl(hbl),
			mysql_db.parcels.getInHblArray([hbl], true),
		]);
		const createMySqlEvents = (search_on_mysql: any) => {
			const events = [];
			if (search_on_mysql?.invoiceDate) {
				events.push({
					timestamp: search_on_mysql.invoiceDate,
					status: Status.CREATED,
					locationId: 1,
					location: "Almacen",
					description: "Invoice date",
					updateMethod: "SYSTEM",
				});
			}
			if (search_on_mysql?.dispatchDate) {
				events.push({
					timestamp: search_on_mysql.dispatchDate,
					locationId: 2,
					location: "Almacen",
					status: Status.DISPATCH,
					description: "Dispatch" + search_on_mysql.dispatchId,
					updateMethod: "SYSTEM",
				});
			}
			if (search_on_mysql?.palletDate) {
				events.push({
					timestamp: search_on_mysql.palletDate,
					locationId: 2,
					location: "Almacen",
					status: Status.IN_PALLET,
					description: "Pallet" + search_on_mysql.palletId,
					updateMethod: "SYSTEM",
				});
			}
			if (search_on_mysql?.containerDate) {
				events.push({
					timestamp: search_on_mysql.containerDate,
					locationId: 3,
					location: "Contenedor",
					status: Status.IN_CONTAINER,
					description: "Container" + search_on_mysql.containerId,
					updateMethod: "SYSTEM",
				});
			}
			return events;
		};
		const mslq_parcel = search_on_mysql[0];
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
			events: [...createMySqlEvents(mslq_parcel), ...(shipment?.events || [])],
		}; */
		const hbl = req.params.hbl;
		const shipment = await prisma_db.shipments.getShipmentByHbl(hbl);
		res.json(shipment);
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

	//a stats for the shipments
};
