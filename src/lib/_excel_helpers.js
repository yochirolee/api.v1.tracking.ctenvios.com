"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExcelEvents = void 0;
exports.createUTCDate = createUTCDate;
const client_1 = require("@prisma/client");
const EVENT_MAPPINGS = {
    fecha_aforo: {
        locationId: 5,
        status: client_1.ParcelStatus.AFORADO,
        description: "Su paquete ha sido aforado",
    },
    fecha_traslado: {
        locationId: 6,
        status: client_1.ParcelStatus.EN_TRASLADO,
        description: "Su paquete esta en traslado a destino final",
    },
    fecha_entregado: {
        locationId: 7,
        status: client_1.ParcelStatus.ENTREGADO,
        description: "Su paquete ha sido entregado",
    },
};
function createUTCDate(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
}
const createExcelEvents = (row, hbl_list, userId) => {
    const valid_hbl = hbl_list.find((item) => item.hbl === row.hbl);
    if (!valid_hbl)
        return [];
    return Object.entries(EVENT_MAPPINGS)
        .filter(([key]) => row[key] !== null && row[key] !== undefined)
        .map(([key, config]) => ({
        hbl: valid_hbl.hbl,
        locationId: config.locationId,
        status: config.status,
        updatedAt: createUTCDate(row[key]),
        description: config.description,
        updateMethod: client_1.UpdateMethod.EXCEL_FILE,
        userId,
        type: client_1.EventType.UPDATE,
    }));
};
exports.createExcelEvents = createExcelEvents;
