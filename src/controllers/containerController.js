"use strict";
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
exports.containerController = void 0;
const mysql_db_1 = require("../databases/mysql/mysql_db");
const _formatResult_1 = require("../lib/_formatResult");
const prisma_db_1 = require("../databases/prisma/prisma_db");
const client_1 = require("@prisma/client");
const supabase_db_1 = require("../databases/supabase/supabase_db");
const _excel_helpers_1 = require("../lib/_excel_helpers");
const getAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const containers = yield mysql_db_1.mysql_db.containers.getAll();
    res.json(containers);
});
const getById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const container = yield mysql_db_1.mysql_db.containers.getById(parseInt(req.params.id));
    res.json(container);
});
const getParcelsByContainerId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        return res.status(400).json({ message: "Container ID is required" });
    }
    try {
        const containerId = parseInt(req.params.id);
        const mysql_parcels = yield mysql_db_1.mysql_db.containers.getParcelsByContainerId(containerId, true);
        const latestEvents = yield prisma_db_1.prisma_db.events.getLatestEvents(mysql_parcels.map((parcel) => parcel.hbl));
        const formattedParcels = (0, _formatResult_1.formatResult)(mysql_parcels, latestEvents);
        res.json({
            inPort: (latestEvents === null || latestEvents === void 0 ? void 0 : latestEvents.length) > 0,
            data: formattedParcels,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const toPort = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { containerId, updatedAt, userId } = req.body;
    if (!containerId || !updatedAt) {
        return res.status(400).json({ message: "Container ID and updatedAt are required" });
    }
    const mysql_parcels = yield mysql_db_1.mysql_db.containers.getParcelsByContainerId(containerId, true);
    const createdEvents = createEvents(mysql_parcels, userId, updatedAt, client_1.ParcelStatus.EN_CONTENEDOR, 4);
    const events = yield supabase_db_1.supabase_db.events.upsert(createdEvents);
    res.json(events);
});
const toWarehouse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { containerId, updatedAt, userId } = req.body;
    if (!containerId || !updatedAt) {
        return res.status(400).json({ message: "Container ID and updatedAt are required" });
    }
    const mysql_parcels = yield mysql_db_1.mysql_db.containers.getParcelsByContainerId(containerId, true);
    const createdEvents = createEvents(mysql_parcels, userId, updatedAt, client_1.ParcelStatus.EN_ESPERA_DE_AFORO, 5);
    const events = yield supabase_db_1.supabase_db.events.upsert(createdEvents);
    res.json(events);
});
const createEvents = (mysql_parcels, userId, updatedAt, status, locationId, updateMethod = client_1.UpdateMethod.SYSTEM, type = client_1.EventType.UPDATE) => {
    const createdEvents = mysql_parcels.map((parcel) => ({
        hbl: parcel.hbl,
        status: status,
        locationId: locationId,
        userId,
        type: type,
        updateMethod: updateMethod,
        description: "Su paquete a arribado al puerto del Mariel",
        updatedAt: (0, _excel_helpers_1.createUTCDate)(new Date(updatedAt)),
    }));
    return createdEvents;
};
exports.containerController = {
    getAll,
    getById,
    getParcelsByContainerId,
    toPort,
    toWarehouse,
};
