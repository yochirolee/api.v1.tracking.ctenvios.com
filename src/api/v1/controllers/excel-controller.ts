import { Shipment, Status, UpdateMethod } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import XLSX from "xlsx";
import supabase from "../config/supabase-client";
import { mysql_db } from "../models/myslq/mysql_db";
import { create } from "domain";

type ExcelRow = {
	HBL: string;
	F_AFORO: Date;
	F_SALIDA: Date;
	F_ENTREGA: Date;
};

interface UpsertResult {
	succeeded: any[];
	failed: Array<{
		event: any;
		error: string;
	}>;
}

export const excelController = {
	uploadExcel: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const file = req.file;
			if (!file?.buffer) {
				return res.status(400).json({ error: "No file uploaded" });
			}
			const userId = req.user?.userId;
			if (!userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const workbook = XLSX.read(file.buffer, { type: "buffer" });
			const allSheetsData = await processAllSheets(workbook, userId);
			res.json(allSheetsData);
		} catch (error) {
			console.error(error);
			res.status(500).json({
				error: "Error processing sheets",
				message: error instanceof Error ? error.message : "Unknown error",
			});
			next(error);
		}
	},
};

// Helper functions
const processAllSheets = async (workbook: XLSX.WorkBook, userId: string) => {
	try {
		const results = await Promise.all(
			workbook.SheetNames.map((sheetName) => processSheet(sheetName, workbook, userId)),
		);
		return Object.assign([], ...results);
	} catch (error) {
		console.error(error);
		throw new Error(`Error processing sheets: ${error}`);
	}
};

const processSheet = async (sheetName: string, workbook: XLSX.WorkBook, userId: string) => {
	const currentSheet = workbook.Sheets[sheetName];
	const rawData = XLSX.utils.sheet_to_json(currentSheet);

	const filteredData = processRawData(rawData as ExcelRow[]);
	const eventData = filteredData.map((row) => createEventData(row, userId));
	const upsertedEvents = await upsertEvents(eventData);
	return upsertedEvents;
};

const processRawData = (rawData: ExcelRow[]) => {
	return rawData.map((row) => ({
		hbl: row.HBL,
		F_AFORO: excelDateToISO(row.F_AFORO),
		F_SALIDA: excelDateToISO(row.F_SALIDA),
		F_ENTREGA: excelDateToISO(row.F_ENTREGA),
	}));
};

const getShipmentStatus = (row: any) => {
	if (row.F_ENTREGA)
		return {
			statusId: 10,
			timestamp: row.F_ENTREGA,
		};
	if (row.F_SALIDA)
		return {
			statusId: 6,
			timestamp: row.F_SALIDA,
		};
	if (row.F_AFORO)
		return {
			statusId: 5,
			timestamp: row.F_AFORO,
		};
	return {
		statusId: 5,
		timestamp: row.F_AFORO,
	};
};

const upsertEvents = async (eventsToUpsert: any[]): Promise<UpsertResult> => {
	const result: UpsertResult = {
		succeeded: [],
		failed: [],
	};

	// Process events in smaller batches to handle partial failures
	const batchSize = 50;
	for (let i = 0; i < eventsToUpsert.length; i += batchSize) {
		const batch = eventsToUpsert.slice(i, i + batchSize);

		try {
			const { data, error } = await supabase.from("ShipmentEvent").upsert(batch, {
				onConflict: "hbl,statusId",
				returning: "minimal",
			});

			if (data) {
				result.succeeded.push(...data);
			}

			if (error) {
				batch.forEach((event) => {
					result.failed.push({
						event,
						error: error.message,
					});
				});
			}
		} catch (error) {
			batch.forEach((event) => {
				result.failed.push({
					event,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			});
		}
	}
	console.log(result);
	return result;
};

const createEventData = (row: any, userId: string) => {
	const status = getShipmentStatus(row);
	if (!status) return null;
	return {
		hbl: row.hbl,
		statusId: status.statusId,
		timestamp: status.timestamp,
		userId: userId,
		updateMethod: "EXCEL_FILE",
	};
};

// Helper function to convert Excel date to ISO string
const excelDateToISO = (excelDate: any): Date | null => {
	if (!excelDate) return null;

	// Check if it's a number and within valid Excel date range
	// Excel dates start from 1900-01-01 (serial number 1)
	// Negative numbers or extremely large numbers are invalid
	if (typeof excelDate !== "number" || excelDate < 0 || excelDate > 2958465.99999999) {
		// 9999-12-31
		return null;
	}

	// Excel dates are numbers representing days since 1900-01-01
	// Convert to milliseconds and account for Excel's date system
	const date = new Date((excelDate - 25569) * 86400 * 1000);

	// Verify the date is valid (not Invalid Date)
	return isNaN(date.getTime()) ? null : date;
};
