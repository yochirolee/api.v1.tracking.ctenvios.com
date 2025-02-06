import { Shipment, ShipmentStatus, UpdateMethod } from "@prisma/client";
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

			res.status(200).json({ ...allSheetsData });
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
	const uniqueHbls = [...new Set(filteredData.map((row) => row.hbl))];
	const mysql_data = await mysql_db.parcels.getInHblArray(uniqueHbls);

	const upsertData = createUpsertData(filteredData, mysql_data, userId);
	const { shipments, events } = await upsertShipmentsAndEvents(upsertData);

	return {
		[sheetName]: {
			sheetName,
			shipments: shipments?.length,
			events: events?.length,
			error: null,
			eventsError: null,
		},
	};
};

const processRawData = (rawData: ExcelRow[]) => {
	return rawData.map((row) => ({
		hbl: row.HBL,
		F_AFORO: excelDateToISO(row.F_AFORO),
		F_SALIDA: excelDateToISO(row.F_SALIDA),
		F_ENTREGA: excelDateToISO(row.F_ENTREGA),
	}));
};

const createUpsertData = (filteredData: any[], mysql_data: any[], userId: string) => {
	return filteredData
		.map((row) => {
			const matchingData = mysql_data.find((data) => row.hbl === data.hbl);
			if (!matchingData) return null;

			return {
				hbl: matchingData.hbl,
				timestamp: row.F_ENTREGA || row.F_SALIDA || row.F_AFORO || new Date(),
				locationId: getLocationId(row),
				status: getShipmentStatus(row),
				userId: userId,
				updateMethod: UpdateMethod.EXCEL_FILE,
				invoiceId: matchingData.invoiceId,
			};
		})
		.filter(Boolean);
};

const getLocationId = (row: any) => {
	if (row.F_ENTREGA) return 7;
	if (row.F_SALIDA) return 6;
	if (row.F_AFORO) return 5;
	return 1;
};

const getShipmentStatus = (row: any) => {
	if (row.F_ENTREGA) return ShipmentStatus.DELIVERED;
	if (row.F_SALIDA) return ShipmentStatus.IN_TRANSIT;
	if (row.F_AFORO) return ShipmentStatus.READY_FOR_DELIVERY;
	return ShipmentStatus.UNKNOWN;
};

const upsertShipmentsAndEvents = async (upsertData: any[]) => {
	const { data: shipments, error } = await supabase
		.from("Shipment")
		.upsert(upsertData, { onConflict: "hbl" });

	if (error) {
		throw new Error(`Error upserting shipments: ${error.message}`);
	}

	const eventsToUpsert = upsertData.map(createEventData);
	const { data: events, error: eventsError } = await supabase
		.from("ShipmentEvent")
		.upsert(eventsToUpsert, { onConflict: "hbl,locationId,status" });
	if (eventsError) {
		throw new Error(`Error upserting events: ${eventsError.message}`);
	}
	return { shipments, events };
};

const createEventData = (row: any) => ({
	hbl: row.hbl,
	locationId: row.locationId,
	status: row.status,
	timestamp: row.timestamp,
	userId: row.userId,
	updateMethod: row.updateMethod,
	description: "Excel file upload",
});

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
