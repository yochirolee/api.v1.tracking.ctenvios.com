import express from "express";
import { Router } from "express";
import { StatusController } from "../controllers/statusController";

const router: Router = express.Router();
const statusController = new StatusController();

// Get all statuses
router.get("/", statusController.getAllStatuses);

export default router;
