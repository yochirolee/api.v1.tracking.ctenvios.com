import { Agency, Shipment, ShipmentEvent } from "@prisma/client";
import supabase from "../../config/supabase-client";

export const supabase_db = {
	shipments: {
		upsert: async (shipments: Partial<Shipment>[]) => {
			return await supabase.from("Shipment").upsert(shipments, { onConflict: "hbl" });
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
