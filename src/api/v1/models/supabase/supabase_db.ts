import { Agency, Shipment, ShipmentEvent } from "@prisma/client";
import supabase from "../../config/supabase-client";

export const supabase_db = {
	shipments: {
		upsert: async (shipments: Partial<Shipment>[]) => {
			return await supabase.from("Shipment").upsert(shipments, { onConflict: "hbl" });
		},
	},
	shipments_by_hbls: {
		get: async (hbls: string[]) => {
			try {
				return await supabase.from("Shipment").select("hbl").in("hbl", hbls);
			} catch (error) {
				console.log(error, "error on shipments_by_hbls.get");
				throw new Error(`Error checking shipments: ${error}`);
			}
		},
	},
	events: {
		upsert: async (events: Partial<ShipmentEvent>[]) => {
			return await supabase.from("ShipmentEvent").upsert(events, {
				onConflict: "hbl,statusId",
			});
		},
	},
	agencies: {
		upsert: async (agencies: Partial<Agency>[]) => {
			return await supabase.from("Agency").upsert(agencies, { onConflict: "id" });
		},
	},
};
