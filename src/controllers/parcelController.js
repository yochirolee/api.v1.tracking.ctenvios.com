"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importEventsFromExcel = exports.getByHbl = exports.search = exports.getAll = void 0;
const node_1 = __importStar(require("read-excel-file/node"));
const _formatResult_1 = require("../lib/_formatResult");
const mysql_db_1 = require("../databases/mysql/mysql_db");
const supabase_db_1 = require("../databases/supabase/supabase_db");
const prisma_db_1 = require("../databases/prisma/prisma_db");
const shemas_1 = require("../shemas/shemas");
const _excel_helpers_1 = require("../lib/_excel_helpers");
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const result = yield mysql_db_1.mysql_db.parcels.getAll(page, limit);
        const latest_events = yield prisma_db_1.prisma_db.events.getLatestEvents(result.packages.map((el) => el.hbl));
        const formatedParcels = (0, _formatResult_1.formatResult)(result.packages, latest_events);
        res.json({ parcels: formatedParcels, meta: result.meta });
    }
    catch (error) {
        console.error("Error in getAllParcels:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAll = getAll;
const search = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (typeof req.query.q !== "string" || req.query.q.trim().length === 0) {
            return res.status(400).json({ message: "Search query must be a non-empty string" });
        }
        const mysqlResult = yield mysql_db_1.mysql_db.parcels.search(req.query.q);
        const hbls = (_b = (_a = mysqlResult.packages) === null || _a === void 0 ? void 0 : _a.map((el) => el.hbl)) !== null && _b !== void 0 ? _b : [];
        const latest_events = yield prisma_db_1.prisma_db.events.getLatestEvents(hbls);
        const { packages, meta } = mysqlResult;
        const parcels = (0, _formatResult_1.formatResult)(packages, latest_events);
        res.json({ parcels, meta });
    }
    catch (error) {
        next(error);
    }
});
exports.search = search;
const getByHbl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.params.hbl)
            return res.status(400).json({ message: "HBL is required" });
        const hbl = req.params.hbl;
        const mysqlParcel = yield mysql_db_1.mysql_db.parcels.getByHbl(hbl.trim());
        if (mysqlParcel.length === 0)
            return res.status(404).json({ message: "Parcel not found" });
        const latestEvents = yield prisma_db_1.prisma_db.events.getEventsByHbl([hbl]);
        const formatedParcel = (0, _formatResult_1.formatResultwithEvents)(mysqlParcel, latestEvents);
        if (!formatedParcel) {
            return res.status(404).json({ message: "Parcel not found" });
        }
        res.json(formatedParcel);
    }
    catch (error) {
        next(error);
    }
});
exports.getByHbl = getByHbl;
const importEventsFromExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file || !req.body.userId)
            return res.status(400).json({ message: "No file uploaded or Not userId" });
        const file = req.file;
        const userId = req.body.userId;
        const sheetNames = yield (0, node_1.readSheetNames)(file.buffer);
        // Process each sheet and track results by sheet name
        const sheetResults = yield Promise.all(sheetNames.map((sheetName) => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, node_1.default)(file.buffer, {
                schema: shemas_1.schemas.excelSchema,
                sheet: sheetName,
            });
            return {
                sheetName,
                rows: result.rows,
                errors: result.errors,
            };
        })));
        // Process events for each sheet separately
        const sheetStats = yield Promise.all(sheetResults.map((_a) => __awaiter(void 0, [_a], void 0, function* ({ sheetName, rows, errors }) {
            const uniqueHbls = [...new Set(rows.map((row) => row.hbl))];
            const existing_hbl = yield mysql_db_1.mysql_db.parcels.getInHblArray(uniqueHbls, false);
            const events = rows.flatMap((row) => (0, _excel_helpers_1.createExcelEvents)(row, existing_hbl, userId));
            const eventsUpserted = yield supabase_db_1.supabase_db.events.upsert(events).then((res) => res.length);
            return {
                sheetName,
                hbls: uniqueHbls.length,
                events: eventsUpserted,
                errors: errors.length > 0 ? errors : undefined,
            };
        })));
        const totalEvents = sheetStats.reduce((sum, sheet) => sum + sheet.hbls, 0);
        const allErrors = sheetStats.flatMap((sheet) => sheet.errors || []);
        res.json({
            total: totalEvents,
            sheetStats,
            errors: allErrors.length > 0 ? allErrors : undefined,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.importEventsFromExcel = importEventsFromExcel;
