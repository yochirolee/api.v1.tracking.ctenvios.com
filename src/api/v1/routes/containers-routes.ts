import { Router } from "express";
import { containerController } from "../controllers/container-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const containerRoutes = Router();

containerRoutes.post("/toPort/:id", authMiddleware, containerController.containerToPort);
containerRoutes.put("/update/:id/shipments", authMiddleware, containerController.updateContainerStatus);
containerRoutes.get("/", authMiddleware, containerController.getContainers);
containerRoutes.get("/:id/shipments", containerController.getShipmentsByContainerId);
//containerRoutes.get("/stats", containerController.containersStats);
export default containerRoutes;
