import { Router } from "express";
import { agencies_controller } from "../controllers/agencies-controller";
import { authMiddleware } from "../middlewares/auth-middleware";

const agenciesRoutes = Router();

//get all agencies
agenciesRoutes.get("/", authMiddleware, agencies_controller.getAgencies);

export default agenciesRoutes;
