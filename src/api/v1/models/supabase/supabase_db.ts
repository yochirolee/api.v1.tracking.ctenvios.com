import {  IssuesImages, Prisma, Shipment, ShipmentEvent } from "@prisma/client";
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
	issues: {
		upsert: async (issues: Omit<Prisma.IssuesCreateInput, "id">[]) => {
			return await supabase.from("Issues").upsert(issues, { onConflict: "hbl" });
		},
	},
	issuesImages: {
		upsert: async (issuesImages: Omit<IssuesImages, "id">[]) => {
			return await supabase.from("IssuesImages").upsert(issuesImages, { onConflict: "issueId" });
		},
	},
};
