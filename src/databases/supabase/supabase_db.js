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
exports.supabase_db = void 0;
const client_1 = require("@prisma/client");
const supabase_client_1 = __importDefault(require("./supabase_client"));
exports.supabase_db = {
    /* parcels: {
        upsert: async (parcels: Parcel[]): Promise<Parcel[]> => {
            const { data, error } = await supabase
                .from<Parcel>("Parcel")
                .upsert(parcels, {
                    onConflict: "hbl",
                })
                .select("*");

            if (error) {
                console.error("Supabase error:", error);
                throw new Error(`Error upserting parcel: ${error.message || JSON.stringify(error)}`);
            }
            //Data is an array,
            return data || [];
        },
        deleteMany: async (hbl_array: string[]): Promise<string[]> => {
            const { data, error } = await supabase
                .from("Parcel")
                .delete()
                .eq("updateMethod", UpdateMethod.EXCEL_FILE)
                .in("hbl", hbl_array);
            if (error) {
                console.error("Supabase error:", error);
                throw new Error(`Error deleting parcels: ${error.message || JSON.stringify(error)}`);
            }
            return data || [];
        },
    }, */
    events: {
        upsert: (events) => __awaiter(void 0, void 0, void 0, function* () {
            const { data, error } = yield supabase_client_1.default
                .from("Event")
                .upsert(events, { onConflict: "hbl,locationId,status" })
                .select("*");
            if (error) {
                console.error("Supabase error:", error);
                throw new Error(`Error upserting events: ${error.message || JSON.stringify(error)}`);
            }
            return data || [];
        }),
        deleteMany: (hbl_array) => __awaiter(void 0, void 0, void 0, function* () {
            const { data, error } = yield supabase_client_1.default
                .from("Event")
                .delete()
                .eq("updateMethod", client_1.UpdateMethod.EXCEL_FILE)
                .in("hbl", hbl_array);
            if (error) {
                console.error("Supabase error:", error);
                throw new Error(`Error deleting events: ${error.message || JSON.stringify(error)}`);
            }
            return data || [];
        }),
    },
};
