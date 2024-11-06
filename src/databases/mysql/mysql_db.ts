import mysql_client from "./mysql_client";

export const mysql_db = {
	containers: {
		getById: async (id: number) => {
			try {
				const [result] = await mysql_client(
					"select codigo as id, fecha as createdAt, numero as name, servicio as service, master, paquetes as total_parcels,peso as weight from contenedores WHERE codigo=?",
					[id],
				);
				return result;
			} catch (error) {
				console.log(error);
			}
		},
		getAll: async (limit = 20) => {
			try {
				const result = await mysql_client(
					"select codigo as id, fecha as createdAt, numero as name, servicio as service, master, paquetes as total_parcels,peso as weight from contenedores order by codigo DESC limit ?	;",
					[limit],
				);
				return result;
			} catch (error) {
				console.log(error);
				throw error;
			}
		},
		getParcelsByContainerId: async (containerId: number, verbose = false) => {
			const queryStr = verbose
				? "select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName from parcels where containerId = ?"
				: "SELECT hbl,invoiceId,containerId,parcelType as type, agencyId,currentLocation from parcels where containerId = ?";
			const result = await mysql_client(queryStr, [containerId]);

			return result;
		},
	},
	parcels: {
		getAll: async (page = 1, limit = 25) => {
			page = Math.max(1, page);
			limit = Math.max(1, limit);
			const offset = (page - 1) * limit;

			const queryStr = `
	    select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight
		FROM parcels 
		ORDER BY invoiceDate DESC 
		LIMIT ? OFFSET ?
	`;
			const countQueryStr = "SELECT COUNT(*) as total FROM parcels";

			const [packagesFound, [{ total }]] = await Promise.all([
				mysql_client(queryStr, [limit, offset]),
				mysql_client(countQueryStr),
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				packages: packagesFound,
				meta: {
					totalResults: total,
					totalPages,
					currentPage: page,
					limit,
				},
			};
		},
		search: async (searchTerm: string, limit = 15, page = 1) => {
			try {
				page = Math.max(1, page);
				limit = Math.max(1, limit);
				const offset = (page - 1) * limit;
				let queryStr: string;
				let queryParams: any[] = [];

				const trimmedSearchTerm = searchTerm ? searchTerm.trim() : "";

				// Existing switch cases can be converted to else-if statements
				if (trimmedSearchTerm.length === 10 && !isNaN(Number(trimmedSearchTerm))) {
					queryStr =
						"select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight FROM `parcels` WHERE senderMobile = ? ORDER BY InvoiceId DESC LIMIT ? OFFSET ?";
					queryParams = [trimmedSearchTerm, limit, offset];
				} else if (trimmedSearchTerm.length === 8 && !isNaN(Number(trimmedSearchTerm))) {
					queryStr =
						"select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight FROM `parcels` WHERE receiverMobile = ? ORDER BY InvoiceId DESC LIMIT ? OFFSET ?";
					queryParams = [trimmedSearchTerm, limit, offset];
				} else if (trimmedSearchTerm.length === 11 && !isNaN(Number(trimmedSearchTerm))) {
					queryStr =
						"select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight FROM `parcels` WHERE receiverCi = ? ORDER BY InvoiceId DESC LIMIT ? OFFSET ?";
					queryParams = [trimmedSearchTerm, limit, offset];
				} else if (trimmedSearchTerm.startsWith("CTE")) {
					queryStr =
						"select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight FROM `parcels` WHERE hbl = ? ORDER BY InvoiceId DESC LIMIT ? OFFSET ?";
					queryParams = [trimmedSearchTerm, limit, offset];
				} else if (!isNaN(Number(trimmedSearchTerm))) {
					queryStr =
						"select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight FROM `parcels` WHERE InvoiceId = ? ORDER BY InvoiceId DESC LIMIT ? OFFSET ?";
					queryParams = [trimmedSearchTerm, limit, offset];
				} else {
					const searchTermWildcard = `%${trimmedSearchTerm.replace(/\s+/g, "%")}%`;
					queryStr = `
						select hbl,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight FROM \`parcels\`
						WHERE sender LIKE ? OR receiver LIKE ? OR description LIKE ?
						ORDER BY InvoiceId DESC LIMIT ? OFFSET ?
				`;
					queryParams = [searchTermWildcard, searchTermWildcard, searchTermWildcard, limit, offset];
				}

				const [packagesFound, [{ total }]] = await Promise.all([
					mysql_client(queryStr, queryParams),
					mysql_client("SELECT FOUND_ROWS() as total"),
				]);

				const totalPages = Math.ceil(total / limit);

				return {
					packages: packagesFound,
					meta: {
						totalResults: total,
						totalPages,
						currentPage: page,
						limit,
					},
				};
			} catch (error) {
				console.error(`Error occurred during package search with term "${searchTerm}":`, error);
				throw new Error("An error occurred while searching for packages. Please try again later.");
			}
		},

		getInHblArray: async (hblArray: string[], verbose = false) => {
			if (hblArray.length === 0) {
				return [];
			}

			const placeholders = hblArray.map(() => "?").join(",");
			const query = verbose
				? `SELECT hbl,invoiceId,parcelType as type,currentLocation,containerName,agency,sender,receiver,city,invoiceDate, province,description, weight FROM parcels WHERE hbl IN (${placeholders})`
				: `SELECT hbl FROM parcels WHERE hbl IN (${placeholders})`;

			const result = await mysql_client(query, hblArray);
			return result;
		},

		getByInvoiceId: async (invoiceId: number) => {
			const query = "SELECT * FROM parcels WHERE invoiceId = ? LIMIT 1";
			try {
				const result = await mysql_client(query, [invoiceId]);
				// Check if result is an array and has elements
				if (Array.isArray(result) && result.length > 0) {
					return result[0];
				} else {
					return null;
				}
			} catch (error) {
				console.error("Error fetching parcel by invoice ID:", error);
				throw error;
			}
		},

		getByHbl: async (hbl: string) => {
			try {
				const result = await mysql_client(`SELECT * FROM parcels WHERE hbl = ?`, [hbl]);

				if (!result || result.length === 0) {
					return [];
				}

				return result;
			} catch (error) {
				console.error(`Error fetching parcel by HBL ${hbl}:`, error);
				throw new Error("Failed to fetch parcel data");
			}
		},
	},
};
