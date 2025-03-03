import { Prisma, Shipment, ShipmentEvent } from "@prisma/client";
import supabase from "../../config/supabase-client";

export const supabase_db = {
	shipments: {
		upsert: async (shipments: Shipment[]) => {
			return await supabase.from("Shipment").upsert(shipments, { onConflict: "hbl" });
		},
	},
	events: {
		upsert: async (events: Omit<ShipmentEvent, "id">[]) => {
			return await supabase.from("ShipmentEvent").upsert(events, {
				onConflict: "hbl,statusId",
			});
		},
	},

};
