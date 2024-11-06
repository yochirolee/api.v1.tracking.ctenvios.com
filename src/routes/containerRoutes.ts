import { Router } from "express";
import { containerController } from "../controllers/containerController";

const containersRoutes = Router();

containersRoutes.get("/", containerController.getAll);

containersRoutes.get("/:id", containerController.getById);

containersRoutes.get("/:id/parcels", containerController.getParcelsByContainerId);

containersRoutes.post("/toPort", containerController.toPort);
containersRoutes.post("/toWarehouse", containerController.toWarehouse);

export default containersRoutes;
