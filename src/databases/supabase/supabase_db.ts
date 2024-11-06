import { UpdateMethod } from "@prisma/client";
import supabase from "./supabase_client";

export const supabase_db = {
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
		upsert: async (events: Omit<Event, "id">[]): Promise<Event[]> => {
			const { data, error } = await supabase
				.from<Event>("Event")
				.upsert(events, { onConflict: "hbl,locationId,status" })
				.select("*");

			if (error) {
				console.error("Supabase error:", error);
				throw new Error(`Error upserting events: ${error.message || JSON.stringify(error)}`);
			}

			return data || [];
		},
		deleteMany: async (hbl_array: string[]): Promise<string[]> => {
			const { data, error } = await supabase
				.from("Event")
				.delete()
				.eq("updateMethod", UpdateMethod.EXCEL_FILE)
				.in("hbl", hbl_array);
			if (error) {
				console.error("Supabase error:", error);
				throw new Error(`Error deleting events: ${error.message || JSON.stringify(error)}`);
			}
			return data || [];
		},
	},
};
