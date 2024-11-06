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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyPackageUpdate = notifyPackageUpdate;
const axios_1 = __importDefault(require("axios"));
const SIMPLETEXT_API_KEY = process.env.SIMPLETEXT_API_KEY;
const SIMPLETEXT_API_URL = "https://api-app2.simpletexting.com/v2/api/messages";
function sendSMSNotification(_a) {
    return __awaiter(this, arguments, void 0, function* ({ phoneNumber, message }) {
        try {
            const response = yield axios_1.default.post(SIMPLETEXT_API_URL, {
                contactPhone: phoneNumber,
                text: message,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SIMPLETEXT_API_KEY}`
                },
            });
            console.log(response);
            if (response.status === 201) {
                console.log(`SMS sent successfully to ${phoneNumber}`);
            }
            else {
                console.error(`Failed to send SMS to ${phoneNumber}: ${response.data.id, response.data.credits}`);
            }
        }
        catch (error) {
            console.error(`Error sending SMS to ${phoneNumber}:`, error);
            throw new Error("Failed to send SMS notification");
        }
    });
}
function notifyPackageUpdate(phoneNumber, packageId, newStatus, newLocation) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = `CTEnvios Tracking Actualizado el ${new Date().toLocaleString()} Total:2549 Entregados:2502 En traslado:47 Aforados:0`;
        yield sendSMSNotification({ phoneNumber, message });
    });
}
