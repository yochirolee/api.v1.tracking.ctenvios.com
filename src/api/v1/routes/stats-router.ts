import { Router } from "express";
import { mysql_db } from "../models/myslq/mysql_db";
import { prisma_db } from "../models/prisma/prisma_db";

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
statsRouter.get("/containers-status", async (req, res) => {
	const containersStatus = await prisma_db.stats.containersStatus();
	res.json(containersStatus);
});
statsRouter.get("/delivery-todays", async (req, res) => {
	const deliveryTodays = await prisma_db.stats.deliveryTodays();
	res.json(deliveryTodays);
});

export default statsRouter;
