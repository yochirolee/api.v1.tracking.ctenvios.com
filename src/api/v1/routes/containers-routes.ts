import { Router } from "express";
import { containerController } from "../controllers/container-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const containerRoutes = Router();

containerRoutes.post("/toPort/:id", authMiddleware, containerController.containerToPort);
containerRoutes.put("/updateStatus/:id", authMiddleware, containerController.updateContainerStatus);
containerRoutes.get("/", authMiddleware, containerController.getContainers);
containerRoutes.get("/:id", containerController.getShipmentsByContainerId);
export default containerRoutes;
