import { Router, Request, Response } from "express";

import { shipmentsController } from "../controllers/shipments-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const shipmentsRoutes = Router();

//get all tracking
shipmentsRoutes.get("/", authMiddleware, shipmentsController.getShipments);
//get tracking by hbl
shipmentsRoutes.get("/search", authMiddleware, shipmentsController.searchShipments);

shipmentsRoutes.get("/hbl/:hbl", authMiddleware, shipmentsController.getShipmentByHbl);

//upsert shipments
shipmentsRoutes.get("/scanned/:statusId", authMiddleware, shipmentsController.scannedShipments);
shipmentsRoutes.post("/scan", authMiddleware, shipmentsController.scanShipment);

/* //create tracking or update if exists
shipmentsRoutes.post("/", async (req: Request, res: Response) => {
	try {
		const { hbl, locationId, status, userId } = req.body;

		const findShipment = await mysql_db.parcels.getByHbl(hbl);
		//if not found in mysql, return error
		if (!findShipment) {
			throw new Error("Shipment not found in MySQL");
		}

		const result = await prisma.$transaction(async (tx) => {
			const shipment = await tx.shipment.upsert({
				where: {
					hbl: hbl,
				},
				update: {
					invoiceId: findShipment[0].invoiceId,
					locationId: locationId,
					status: status,
					containerId: findShipment[0].containerId,
					agencyId: findShipment[0].agencyId,
					userId: userId,
				},
				create: {
					hbl: hbl,
					invoiceId: findShipment[0].invoiceId,
					containerId: findShipment[0].containerId,
					agencyId: findShipment[0].agencyId,
					locationId: locationId,
					status: status,
					userId: userId,
				},
			});

			await tx.shipmentEvent.upsert({
				where: {
					hbl_locationId_status: {
						hbl: shipment.hbl,
						locationId: shipment.locationId,
						status: shipment.status,
					},
				},
				update: {
					locationId: shipment.locationId,
					status: shipment.status,
					userId: shipment.userId,
					timestamp: new Date(),
					description: req.body.description,
				},
				create: {
					hbl: shipment.hbl,
					locationId: shipment.locationId,
					status: shipment.status,
					userId: shipment.userId,
					timestamp: new Date(),
					description: req.body.description,
				},
			});

			return shipment;
		});

		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error });
	}
});

//update tracking by hbl
shipmentsRoutes.put("/:hbl", async (req: Request, res: Response) => {
	const { hbl } = req.params;

	if (!hbl) {
		return res.status(400).json({ error: "HBL is required" });
	}
	const shipment = await prisma.shipment.update({
		where: {
			hbl,
		},
		data: req.body,
	});
	res.json(shipment);
});

//delete shipment by hbl
shipmentsRoutes.delete("/:hbl", async (req: Request, res: Response) => {
	const shipment = await prisma.shipment.delete({
		where: {
			hbl: req.params.hbl,
		},
	});
	res.json(shipment);
}); */

export default shipmentsRoutes;
