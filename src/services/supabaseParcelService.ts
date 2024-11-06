import { Parcel, Event } from "@prisma/client";
import supabase from "../config/supabase_client";

/* export const getAllParcelsFromSupabase = async (): Promise<Parcel[]> => {
	const { data, error } = await supabase.from<Parcel>("Parcel").select("*");

	if (error) {
		throw new Error(error.message);
	}

	return data;
}; */

/* export const upsertParcelToSupabase = async (parcels: Parcel[]): Promise<Parcel[]> => {
	const { data, error } = await supabase
		.from<Parcel>("Parcel")
		.upsert(parcels, {
			onConflict: "hbl,status,currentLocationId",
		})
		.select("*");

	if (error) {
		console.error("Supabase error:", error);
		throw new Error(`Error upserting parcel: ${error.message || JSON.stringify(error)}`);
	}
	//Data is an array,
	return data || [];
}; */

/* export const upsertParcelEvents = async (events: Omit<Event, "id">[]): Promise<Event[]> => {
	const { data, error } = await supabase
		.from<Event>("Event")
		.upsert(events, { onConflict: "hbl,locationId,status" })
		.select("*");

	if (error) {
		console.error("Supabase error:", error);
		throw new Error(`Error upserting events: ${error.message || JSON.stringify(error)}`);
	}

	return data || [];
};
 */
/* export const parcelsBulkDelete = async (hbl_array: string[]): Promise<string[]> => {
	const { data, error } = await supabase.from("Parcel").delete().in("hbl", hbl_array);
	if (error) {
		console.error("Supabase error:", error);
		throw new Error(`Error deleting parcels: ${error.message || JSON.stringify(error)}`);
	}
	return data || [];
}; */
