import { Parcel, UpdateMethod } from "@prisma/client";
import supabase from "./supabase_client";

export interface ErrorLog {
	timestamp: Date;
	level: string;
	message: string;
	stack?: string;
	path?: string;
	method?: string;
}

export const supabase_db = {
	parcels: {
		upsert: async (parcels: Parcel[]): Promise<Parcel[]> => {
			const { data, error } = await supabase.from<Parcel>("Parcel").upsert(parcels, {
				onConflict: "hbl",
			});

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
	},
	events: {
		upsert: async (events: Omit<Event, "id">[]): Promise<Event[]> => {
			
			const { data, error } = await supabase
				.from<Event>("Event")
				.upsert(events, { onConflict: "hbl,locationId,statusId" })
				.select("*");

			if (error) {
				console.error("Supabase error - Upserting events:", error);
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
	users: {
		signUp: async (email: string, password: string) => {
			const { user, session, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				console.error("Supabase error:", error);
				throw new Error(`Error signing up: ${error.message || JSON.stringify(error)}`);
			}
			return { user, session };
		},

		signIn: async (email: string, password: string) => {
			try {
				const { session, user, error } = await supabase.auth.signIn({
					email,
					password,
				});

				if (error) {
					console.error("Supabase error:", error);
					throw new Error(`Error signing in: ${error.message || JSON.stringify(error)}`);
				}
				return { session, user };
			} catch (err) {
				const error = err as Error;
				console.error("Supabase error:", error);
				throw new Error(`Error signing in: ${error.message || JSON.stringify(error)}`);
			}
		},

		signOut: async () => {
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error("Supabase error:", error);
				throw new Error(`Error signing out: ${error.message || JSON.stringify(error)}`);
			}
		},
		getUsers: async () => {
			const { data, error } = await supabase.from("User").select("*");
		},
	},
	logger: {
		log: async (errorLog: ErrorLog) => {
			console.log("Logging error to Supabase", errorLog);
			const { data, error } = await supabase.from("error_logs").insert([
				{
					timestamp: errorLog.timestamp,
					level: errorLog.level,
					message: errorLog.message,
					stack: errorLog.stack,
					path: errorLog.path,
					method: errorLog.method,
				},
			]);
			console.log("Error logged to Supabase", data, error);
		},
	},
};
