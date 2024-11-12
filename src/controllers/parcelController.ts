import { Request, Response, NextFunction } from "express";
import readXlsxFile, { readSheetNames } from "read-excel-file/node";
import { formatResult, formatResultwithEvents } from "../lib/_formatResult";
import { mysql_db } from "../databases/mysql/mysql_db";
import { supabase_db } from "../databases/supabase/supabase_db";
import { prisma_db } from "../databases/prisma/prisma_db";
import { schemas } from "../shemas/shemas";
import { createExcelEvents } from "../lib/_excel_helpers";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 50;

		const result = await mysql_db.parcels.getAll(page, limit);
		const latest_events = await prisma_db.events.getLatestEvents(
			result.packages.map((el) => el.hbl),
		);

		const formatedParcels = formatResult(result.packages, latest_events);
		res.json({ parcels: formatedParcels, meta: result.meta });
	} catch (error) {
		console.error("Error in getAllParcels:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (typeof req.query.q !== "string" || req.query.q.trim().length === 0) {
			return res.status(400).json({ message: "Search query must be a non-empty string" });
		}

		const mysqlResult = await mysql_db.parcels.search(req.query.q);
		const hbls = mysqlResult.packages?.map((el) => el.hbl) ?? [];

		const latest_events = await prisma_db.events.getLatestEvents(hbls);
		const { packages, meta } = mysqlResult;
		const parcels = formatResult(packages, latest_events);
		res.json({ parcels, meta });
	} catch (error) {
		next(error);
	}
};

export const getByHbl = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.params.hbl) return res.status(400).json({ message: "HBL is required" });
		const hbl = req.params.hbl as string;

		const mysqlParcel = await mysql_db.parcels.getByHbl(hbl.trim());

		if (mysqlParcel.length === 0) return res.status(404).json({ message: "Parcel not found" });

		const latestEvents = await prisma_db.events.getEventsByHbl([hbl]);

		const formatedParcel = formatResultwithEvents(mysqlParcel, latestEvents);
		if (!formatedParcel) {
			return res.status(404).json({ message: "Parcel not found" });
		}
		res.json(formatedParcel);
	} catch (error) {
		next(error);
	}
};

export const importEventsFromExcel = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ message: "Unauthorized" });
		if (!req.file) return res.status(400).json({ message: "No file uploaded" });
		const file = req.file;
		const userId = user.id;

		const sheetNames = await readSheetNames(file.buffer);

		// Process each sheet and track results by sheet name
		const sheetResults = await Promise.all(
			sheetNames.map(async (sheetName) => {
				const result = await readXlsxFile(file.buffer, {
					schema: schemas.excelSchema,
					sheet: sheetName,
				});
				return {
					sheetName,
					rows: result.rows,
					errors: result.errors,
				};
			}),
		);

		// Process events for each sheet separately
		const sheetStats = await Promise.all(
			sheetResults.map(async ({ sheetName, rows, errors }) => {
				const uniqueHbls = [...new Set(rows.map((row) => row.hbl))] as string[];
				const existing_hbl = await mysql_db.parcels.getInHblArray(uniqueHbls, false);
				const events = rows.flatMap((row) => createExcelEvents(row, existing_hbl, userId));
				await supabase_db.parcels.upsert(
					existing_hbl.map((el) => ({
						hbl: el.hbl,
						containerId: el.containerId,
						invoiceId: el.invoiceId,
						agencyId: el.agencyId,
					})),
				);
				const eventsUpserted = await supabase_db.events.upsert(events).then((res) => res.length);

				return {
					sheetName,
					hbls: uniqueHbls.length,
					events: eventsUpserted,
					errors: errors.length > 0 ? errors : undefined,
				};
			}),
		);

		res.json(sheetStats);
	} catch (error) {
		next(error);
	}
};
