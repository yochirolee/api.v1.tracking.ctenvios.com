import { Router } from "express";
import { mysql_db } from "../models/myslq/mysql_db";

const statsRouter = Router();

statsRouter.get("/", async (req, res) => {
	const sales = await mysql_db.stats.getSalesStats();
	res.json(sales);
});
statsRouter.get("/daily-sales", async (req, res) => {
	const sales = await mysql_db.stats.getDailySalesByAgency(2);
	res.json(sales);
});
statsRouter.get("/employees-sales", async (req, res) => {
	const sales = await mysql_db.stats.getEmployeeSales(2);
	res.json(sales);
});

export default statsRouter;
