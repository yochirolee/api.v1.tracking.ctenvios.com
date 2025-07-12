import { ShipmentEvent, UpdateMethod } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import XLSX from "xlsx";
import supabase from "../config/supabase-client";

import { supabase_db } from "../models/supabase/supabase_db";
import { prisma_db } from "../models/prisma/prisma_db";

type ExcelRow = {
	HBL: string;
	F_ENTRADA: Date; // Changed from F_AFORO to match your data
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

	const filteredData = processRawData(rawData as ExcelRow[]);

	// Check if shipments exist before creating events
	const validatedData = await validateShipments(filteredData);

	const eventData = await Promise.all(validatedData.map((row) => createEventData(row, userId)));
	const upsertedEvents = await upsertEvents(eventData as ShipmentEvent[], sheetName);
	return upsertedEvents;
};

const processRawData = (rawData: ExcelRow[]) => {
	// Fixed filtering logic: remove rows with invalid HBL
	const filteredData = rawData.filter((row) => {
		// Check if HBL exists, is not empty, and meets length requirements
		return row.HBL && row.HBL.toString().trim() !== "" && row.HBL.toString().trim().length >= 8; // Assuming minimum 8 characters
	});

	return filteredData
		.map((row) => {
			const processedRow = {
				hbl: row.HBL.toString().trim(),
				F_ENTRADA: row.F_ENTRADA ? excelDateToISO(row.F_ENTRADA) : null,
				F_SALIDA: row.F_SALIDA ? excelDateToISO(row.F_SALIDA) : null,
				F_ENTREGA: row.F_ENTREGA ? excelDateToISO(row.F_ENTREGA) : null,
			};

			// If no valid dates found, return null to filter out later
			if (!processedRow.F_ENTRADA && !processedRow.F_SALIDA && !processedRow.F_ENTREGA) {
				return null;
			}

			return processedRow;
		})
		.filter(Boolean); // Remove null entries
};

// New function to validate shipments exist
const validateShipments = async (data: any[]) => {
	try {
		// Get all unique HBL values
		const hblValues = [...new Set(data.map((row) => row.hbl))];

		// Check which shipments exist in the database
		const existingShipments = await prisma_db.shipments.getShipmentsByHbls(hblValues);

		const existingHBLs = new Set(existingShipments?.map((s: any) => s.hbl) || []);

		// Filter data to only include existing shipments
		const validData = data.filter((row) => existingHBLs.has(row.hbl));

		// Log missing shipments for debugging
		const missingHBLs = hblValues.filter((hbl) => !existingHBLs.has(hbl));
		if (missingHBLs.length > 0) {
			console.warn("Missing shipments (will be skipped):", missingHBLs);
		}

		return validData;
	} catch (error) {
		console.error("Error validating shipments:", error);
		throw error;
	}
};

const getShipmentStatus = (row: any) => {
	if (row.F_ENTREGA) {
		return {
			statusId: 10,
			timestamp: row.F_ENTREGA,
		};
	} else if (row.F_SALIDA) {
		return {
			statusId: 7,
			timestamp: row.F_SALIDA,
		};
	} else if (row.F_ENTRADA) {
		// Changed from F_AFORO
		return {
			statusId: 6,
			timestamp: row.F_ENTRADA,
		};
	}
	// Use current date as fallback when no specific timestamp is available
	return {
		statusId: 5,
		timestamp: new Date(),
	};
};

const upsertEvents = async (eventsToUpsert: ShipmentEvent[], sheetName: string) => {
	try {
		// Only proceed if there are events to upsert
		if (eventsToUpsert.length === 0) {
			return {
				sheetName: sheetName,
				count: 0,
				success: true,
				error: "No valid shipments found to update",
			};
		}

		const { data, error } = await supabase_db.events.upsert(eventsToUpsert);
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
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

const createEventData = async (
	row: any,
	userId: string,
): Promise<Pick<ShipmentEvent, "hbl" | "statusId" | "timestamp" | "userId" | "updateMethod">> => {
	const status = getShipmentStatus(row);

	return {
		hbl: row.hbl,
		statusId: status.statusId,
		timestamp: status.timestamp || new Date(), // Fallback to current date if timestamp is null
		userId: userId,
		updateMethod: UpdateMethod.EXCEL_FILE,
	};
};

// Helper function to convert Excel date to ISO string
const excelDateToISO = (excelDate: any): Date | null => {
	if (!excelDate) return null;

	// If it's already a Date object, return it
	if (excelDate instanceof Date) {
		return isNaN(excelDate.getTime()) ? null : excelDate;
	}

	// If it's a string, try to parse it
	if (typeof excelDate === "string") {
		const parsedDate = new Date(excelDate);
		return isNaN(parsedDate.getTime()) ? null : parsedDate;
	}

	// Check if it's a number and within valid Excel date range
	if (typeof excelDate !== "number" || excelDate < 0 || excelDate > 2958465.99999999) {
		return null;
	}

	// Excel dates are numbers representing days since 1900-01-01
	const date = new Date((excelDate - 25569) * 86400 * 1000);
	return isNaN(date.getTime()) ? null : date;
};
