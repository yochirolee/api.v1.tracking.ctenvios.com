import { Router } from "express";
import { getStats, getDailySales, getEmployeesSales } from "../controllers/statsController";
const router = Router();

router.get("/", getStats);
router.get("/daily-sales", getDailySales);
router.get("/employees-sales", getEmployeesSales);
export default router;
