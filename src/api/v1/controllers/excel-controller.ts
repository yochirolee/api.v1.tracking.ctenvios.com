import { Shipment, ShipmentEvent, Status, UpdateMethod } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import XLSX from "xlsx";
import supabase from "../config/supabase-client";
import { mysql_db } from "../models/myslq/mysql_db";

type ExcelRow = {
	HBL: string;
	F_AFORO: Date;
	F_SALIDA: Date;
	F_ENTREGA: Date;
};

interface UpsertResult {
	succeeded: Array<{
		sheetName: string;
		count: number;
		success: boolean;
	}>;
	failed: Array<{
		count: number;
		sheetName: string;
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

			// Return structured response
			return res.status(200).json(allSheetsData);
		} catch (error) {
			console.error("Excel upload error:", error);
			return res.status(500).json({
				success: false,
				error: "Error processing sheets",
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},
};

// Helper functions
const processAllSheets = async (workbook: XLSX.WorkBook, userId: string) => {
	try {
		const results = await Promise.all(
			workbook.SheetNames.map((sheetName) => processSheet(sheetName, workbook, userId)),
		);

		// Combine all results into a single UpsertResult
		return results;
	} catch (error) {
		console.error("Process sheets error:", error);
		throw new Error(
			`Error processing sheets: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
};

const processSheet = async (sheetName: string, workbook: XLSX.WorkBook, userId: string) => {
	const currentSheet = workbook.Sheets[sheetName];
	const rawData = XLSX.utils.sheet_to_json(currentSheet);
	//remove all rows with HBL null or empty

	const filteredData = processRawData(rawData as ExcelRow[]);

	const eventData = await Promise.all(filteredData.map((row) => createEventData(row, userId)));
	const upsertedEvents = await upsertEvents(eventData as ShipmentEvent[], sheetName);
	return upsertedEvents;
};

const processRawData = (rawData: ExcelRow[]) => {
	//remove all rows with HBL null or empty or F_AFORO null or empty
	const filteredData = rawData.filter(
		(row) => row.HBL && row.HBL !== "" && row.F_AFORO && row.F_AFORO !== null,
	);
	return filteredData.map((row) => ({
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
		statusId: 4,
		timestamp: null,
	};
};

const upsertEvents = async (eventsToUpsert: ShipmentEvent[], sheetName: string) => {
	try {
		const { data, error } = await supabase.from("ShipmentEvent").upsert(eventsToUpsert, {
			onConflict: "hbl,statusId",
		});

		if (data) {
			return {
				sheetName: sheetName,
				count: data.length,
				success: true,
				error: null,
			};
		}

		if (error) {
			return {
				sheetName: sheetName,
				count: 0,
				success: false,
				error: error.message,
			};
		}
	} catch (error) {
		return {
			sheetName: sheetName,
			count: 0,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

const createEventData = async (
	row: any,
	userId: string,
): Promise<
	Pick<ShipmentEvent, "hbl" | "statusId" | "timestamp" | "userId" | "updateMethod" | "locationId">
> => {
	const status = getShipmentStatus(row);

	return {
		hbl: row.hbl,
		statusId: status.statusId,
		timestamp: status.timestamp,
		userId: userId,
		updateMethod: UpdateMethod.EXCEL_FILE,
		locationId: null,
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
