import { Router } from "express";
import { mysql_db } from "../models/myslq/mysql_db";
import { prisma_db } from "../models/prisma/prisma_db";
import { authMiddleware } from "../middlewares/auth-middleware";
const statsRouter = Router();

statsRouter.get("/", authMiddleware, async (req, res) => {
   const sales = await mysql_db.stats.getSalesStats();
   res.json(sales);
});
statsRouter.get("/daily-sales", authMiddleware, async (req, res) => {
   const user = req.user;
   const sales = await mysql_db.stats.getDailySalesByAgency(user.agencyId);
   res.json(sales);
});
statsRouter.get("/employees-sales", authMiddleware, async (req, res) => {
   const user = req.user;
   const sales = await mysql_db.stats.getEmployeeSales(user.agencyId);
   res.json(sales);
});
statsRouter.get("/employees-sales-by-month", authMiddleware, async (req, res) => {
   const user = req.user;
   const sales = await mysql_db.stats.getEmployeeSalesByMonth(user.agencyId, new Date().getMonth() + 1);
   res.json(sales);
});
statsRouter.get("/containers-status", authMiddleware, async (req, res) => {
   const containersStatus = await prisma_db.stats.containersStatus();
   res.json(containersStatus);
});
statsRouter.get("/delivery-todays", authMiddleware, async (req, res) => {
   const deliveryTodays = await prisma_db.stats.deliveryTodays();
   res.json(deliveryTodays);
});

export default statsRouter;
