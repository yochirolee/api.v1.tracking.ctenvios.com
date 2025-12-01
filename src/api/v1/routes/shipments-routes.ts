import { Router, Request, Response } from "express";

import { shipmentsController } from "../controllers/shipments-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const shipmentsRoutes = Router();

//get all tracking
shipmentsRoutes.get("/", shipmentsController.getShipments);

// Specific routes MUST come before generic parameter routes
shipmentsRoutes.get("/search", shipmentsController.searchShipments);
shipmentsRoutes.get("/invoice/:invoiceId", shipmentsController.getByInvoiceId);
shipmentsRoutes.get("/delivery/:hbl", shipmentsController.getShipmentsInInvoice);
shipmentsRoutes.post("/delivery", authMiddleware, shipmentsController.deliveryShipments);
shipmentsRoutes.get("/user", authMiddleware, shipmentsController.getShipmentsByUserId);

//get tracking by hbl (keep this AFTER specific routes)
shipmentsRoutes.get("/hbl/:hbl", shipmentsController.getShipmentByHbl);

//upsert shipments
shipmentsRoutes.get("/scanned/:statusId", authMiddleware, shipmentsController.scannedShipments);
shipmentsRoutes.post("/scan", authMiddleware, shipmentsController.scanShipment);

export default shipmentsRoutes;
