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
statsRouter.get("/containers-status", async (req, res) => {
	const containers = await prisma?.container.findMany({
		select: {
			id: true,
			containerNumber: true,
			shipments: {
				select: {
					status: {
						select: {
							id: true,
							name: true,
							code: true,
						},
					},
				},
			},
		},
		orderBy: { id: "desc" },
		take: 6,
	});

	const formattedContainers = containers?.map((container) => {
		const status: Record<string, number> = {};

		// Count occurrences of each status
		container.shipments.forEach((shipment) => {
			const statusName = shipment.status.name;
			status[statusName] = (status[statusName] || 0) + 1;
		});

		return {
			id: container.id,
			containerNumber: container.containerNumber,
			status,
			count: container.shipments.length,
		};
	});

	res.json(formattedContainers);
});

export default statsRouter;
