"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = void 0;
const zod_1 = __importDefault(require("zod"));
exports.schemas = {
    loginSchema: zod_1.default.object({
        email: zod_1.default.string().email(),
        password: zod_1.default.string().min(6),
    }),
    excelSchema: {
        HBL: {
            prop: "hbl",
            unique: true,
        },
        F_AFORO: {
            prop: "fecha_aforo",
            type: Date,
        },
        F_SALIDA: {
            prop: "fecha_traslado",
            type: Date,
        },
        F_ENTREGA: {
            prop: "fecha_entregado",
            type: Date,
        },
    },
};
