import { Router } from "express";
import { getStats, getDailySales } from "../controllers/statsController";
const router = Router();

router.get("/", getStats);
router.get("/daily-sales", getDailySales);

export default router;
