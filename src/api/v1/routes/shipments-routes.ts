import { Router, Request, Response } from "express";

import { shipmentsController } from "../controllers/shipments-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const shipmentsRoutes = Router();

//get all tracking
shipmentsRoutes.get("/", authMiddleware, shipmentsController.getShipments);
//get tracking by hbl
shipmentsRoutes.get("/search", authMiddleware, shipmentsController.searchShipments);

shipmentsRoutes.get("/hbl/:hbl", authMiddleware, shipmentsController.getShipmentByHbl);
shipmentsRoutes.get("/delivery/:hbl", authMiddleware, shipmentsController.getShipmentsInInvoice);
shipmentsRoutes.post("/delivery", authMiddleware, shipmentsController.deliveryShipments);

//upsert shipments
shipmentsRoutes.get("/scanned/:statusId", authMiddleware, shipmentsController.scannedShipments);
shipmentsRoutes.post("/scan", authMiddleware, shipmentsController.scanShipment);

export default shipmentsRoutes;
