import { Router } from "express";
import { containerController } from "../controllers/container-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const containerRoutes = Router();

containerRoutes.post("/toPort/:id", authMiddleware, containerController.containerToPort);
containerRoutes.get("/", authMiddleware, containerController.getContainers);

export default containerRoutes;
