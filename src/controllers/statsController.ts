import { NextFunction, Request, Response } from "express";
import { mysql_db } from "../databases/mysql/mysql_db";

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await mysql_db.stats.getStats();
		res.json(result);
	} catch (error) {
		console.error("Error in getStats:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getDailySales = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await mysql_db.stats.getDailySales();
		res.json(result);
	} catch (error) {
		console.error("Error in getDailySales:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getEmployeesSales = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await mysql_db.stats.getEmployeeSales();
		res.json(result);
	} catch (error) {
		console.error("Error in getEmployeeSales:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
