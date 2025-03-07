import mysql_client from "../../config/mysql-client";
import { formatSearchResult } from "../../utils/_format_response";
import { toCamelCase } from "../../utils/_to_camel_case";
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
				throw error;
			}
		},
		getAll: async (limit = 30) => {
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
				? `SELECT 
					oe_emp_det.codigo_paquete AS hbl,
					a.nombre AS agency,
					a.id AS agencyId,
					oe.cod_envio AS invoiceId,
					co.fecha_update AS containerDate,
					oe.fecha AS invoiceDate,
					oe_emp_det.pallet AS palletId,
					p.fecha AS palletDate,
					despachos.fecha AS dispatchDate,
					despachos.codigo AS dispatchId,
					CONCAT(c.nombre, ' ', c.nombre2, ' ', c.apellido, ' ', c.apellido2) AS sender,
					CONCAT(d.nombre, ' ', d.nombre2, ' ', d.apellido, ' ', d.apellido2) AS receiver,
					cc.ciudad AS city,
					ci.ciudad AS province,
					oe_emp_det.descripcion AS description,
					oe_emp_det.num_contenedor AS containerName,
					oe_emp_det.peso AS weight
				FROM orden_envio_emp_det oe_emp_det
					JOIN orden_envio oe ON oe_emp_det.cod_envio = oe.cod_envio
					JOIN agencias a ON oe_emp_det.agencia = a.id
					LEFT JOIN destinatarios d ON d.codigo = oe.destinatario
					LEFT JOIN pallets p ON oe_emp_det.pallet = p.codigo
					LEFT JOIN contenedores co ON oe_emp_det.contenedor = co.codigo
					LEFT JOIN clientes c ON oe.cliente = c.codigo
					LEFT JOIN ciudades_cuba cc ON d.ciudad = cc.codigo
					LEFT JOIN ciudades ci ON ci.id = d.estado
					LEFT JOIN despachos ON oe_emp_det.factura = despachos.codigo
				WHERE oe_emp_det.contenedor = ?`
				: `SELECT 
					oe_emp_det.codigo_paquete AS hbl,
					oe.cod_envio AS invoiceId,
					oe_emp_det.contenedor AS containerId,
					oe_emp_det.tipo_producto AS type,
					a.id AS agencyId,
					oe_emp_det.estado AS currentLocation
				FROM orden_envio_emp_det oe_emp_det
					JOIN orden_envio oe ON oe_emp_det.cod_envio = oe.cod_envio
					JOIN agencias a ON oe_emp_det.agencia = a.id
				WHERE oe_emp_det.contenedor = ?`;
			const result = await mysql_client(queryStr, [containerId]);

			return result;
		},
	},
	parcels: {
		getAll: async (page = 1, limit = 50) => {
			page = Math.max(1, page);
			limit = Math.max(1, limit);
			const offset = (page - 1) * limit;

			const queryStr = `
				SELECT 
					oe_emp_det.codigo_paquete AS hbl,
					oe.cod_envio AS invoiceId,
					oe_emp_det.tipo_producto AS parcelType,
					oe_emp_det.descripcion AS description,
					oe.cliente AS senderId,
					CONCAT(c.nombre, ' ', c.nombre2, ' ', c.apellido, ' ', c.apellido2) AS sender,
					oe.destinatario AS receiverId,
					c.cel AS senderMobile,
					c.email AS senderEmail,
					CONCAT(d.nombre, ' ', d.nombre2, ' ', d.apellido, ' ', d.apellido2) AS receiver,
					d.cel AS receiverMobile,
					d.documento AS receiverCi,
					cc.ciudad AS city,
					ci.ciudad AS province,
					oe.fecha AS invoiceDate,
					oe_emp_det.estado AS currentLocation,
					oe_emp_det.num_contenedor AS containerName,
					co.fecha_update AS containerDate,
					oe_emp_det.contenedor AS containerId,
					d.ciudad AS cityId,
					d.estado AS stateId,
					oe_emp_det.pallet AS palletId,
					despachos.codigo AS dispatchId,
					despachos.fecha AS dispatchDate,
					despachos.estado AS dispatchStatus,
					p.fecha AS palletDate,
					a.nombre AS agency,
					a.id AS agencyId,
					oe_emp_det.peso AS weight
				FROM orden_envio_emp_det oe_emp_det
					JOIN orden_envio oe ON oe_emp_det.cod_envio = oe.cod_envio
					JOIN agencias a ON oe_emp_det.agencia = a.id
					LEFT JOIN destinatarios d ON d.codigo = oe.destinatario
					LEFT JOIN pallets p ON oe_emp_det.pallet = p.codigo
					LEFT JOIN contenedores co ON oe_emp_det.contenedor = co.codigo
					LEFT JOIN clientes c ON oe.cliente = c.codigo
					LEFT JOIN ciudades_cuba cc ON d.ciudad = cc.codigo
					LEFT JOIN ciudades ci ON ci.id = d.estado
					LEFT JOIN despachos ON oe_emp_det.factura = despachos.codigo
				ORDER BY invoiceId DESC 
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
		search: async (searchTerm: string, limit = 50, page = 1) => {
			try {
				page = Math.max(1, page);
				limit = Math.max(1, limit);
				const offset = (page - 1) * limit;
				const trimmedSearchTerm = searchTerm ? searchTerm.trim() : "";

				// Add SQL_CALC_FOUND_ROWS to get accurate total count
				const baseQuery = `
					SELECT SQL_CALC_FOUND_ROWS 
					oe_emp_det.codigo_paquete AS hbl,
					oe.cod_envio AS invoiceId,
					oe_emp_det.descripcion AS description,
					oe.cliente AS senderId,
					CONCAT(c.nombre, ' ', c.nombre2, ' ', c.apellido, ' ', c.apellido2) AS sender,
					oe.destinatario AS receiverId,
					c.cel AS senderMobile,
					c.email AS senderEmail,
					CONCAT(d.nombre, ' ', d.nombre2, ' ', d.apellido, ' ', d.apellido2) AS receiver,
					d.cel AS receiverMobile,
					d.documento AS receiverCi,
					cc.ciudad AS city,
					ci.ciudad AS state,
					oe.fecha AS invoiceDate,
					oe_emp_det.estado AS currentLocation,
					oe_emp_det.num_contenedor AS containerName,
					co.fecha_update AS containerDate,
					oe_emp_det.contenedor AS containerId,
					oe_emp_det.pallet AS palletId,
					despachos.codigo AS dispatchId,
					despachos.fecha AS dispatchDate,
					despachos.estado AS dispatchStatus,
					p.fecha AS palletDate,
					a.nombre AS agency,
					a.id AS agencyId,
					oe_emp_det.peso AS weight
				FROM orden_envio_emp_det oe_emp_det
					JOIN orden_envio oe ON oe_emp_det.cod_envio = oe.cod_envio
					JOIN agencias a ON oe_emp_det.agencia = a.id
					LEFT JOIN destinatarios d ON d.codigo = oe.destinatario
					LEFT JOIN pallets p ON oe_emp_det.pallet = p.codigo
					LEFT JOIN contenedores co ON oe_emp_det.contenedor = co.codigo
					LEFT JOIN clientes c ON oe.cliente = c.codigo
					LEFT JOIN ciudades_cuba cc ON d.ciudad = cc.codigo
					LEFT JOIN ciudades ci ON ci.id = d.estado
					LEFT JOIN despachos ON oe_emp_det.factura = despachos.codigo
				WHERE`;

				let whereClause: string;
				let queryParams: any[] = [];

				// Determine the WHERE clause based on search term
				if (trimmedSearchTerm.length === 10 && !isNaN(Number(trimmedSearchTerm))) {
					whereClause = "c.cel = ? ";
					queryParams = [trimmedSearchTerm];
				} else if (trimmedSearchTerm.length === 8 && !isNaN(Number(trimmedSearchTerm))) {
					whereClause = "d.cel = ?";
					queryParams = [trimmedSearchTerm];
				} else if (trimmedSearchTerm.length === 11 && !isNaN(Number(trimmedSearchTerm))) {
					whereClause = "d.documento = ?";
					queryParams = [trimmedSearchTerm];
				} else if (trimmedSearchTerm.startsWith("CTE")) {
					whereClause = "oe_emp_det.codigo_paquete = ?";
					queryParams = [trimmedSearchTerm];
				} else if (!isNaN(Number(trimmedSearchTerm))) {
					whereClause = "oe.cod_envio = ?";
					queryParams = [trimmedSearchTerm];
				} else {
					const searchTermWildcard = `%${trimmedSearchTerm.replace(/\s+/g, "%")}%`;
					whereClause =
						"CONCAT(c.nombre, ' ', c.nombre2, ' ', c.apellido, ' ', c.apellido2) LIKE ? OR CONCAT(d.nombre, ' ', d.nombre2, ' ', d.apellido, ' ', d.apellido2) LIKE ? OR oe_emp_det.descripcion LIKE ?";
					queryParams = [searchTermWildcard, searchTermWildcard, searchTermWildcard];
				}

				const queryStr = `${baseQuery} ${whereClause} ORDER BY InvoiceId DESC LIMIT ? OFFSET ?`;
				queryParams.push(limit, offset);

				const [parcels, [{ total }]] = await Promise.all([
					mysql_client(queryStr, queryParams),
					mysql_client("SELECT FOUND_ROWS() as total"),
				]);

				return [parcels, total];
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
				? `select *  FROM parcels WHERE hbl IN (${placeholders})`
				: `SELECT hbl,containerId,invoiceId,agencyId FROM parcels WHERE hbl IN (${placeholders})`;

			const result = await mysql_client(query, hblArray);
			return result;
		},

		getByInvoiceId: async (invoiceId: number) => {
			const query = "SELECT * FROM parcels WHERE invoiceId = ? ";
			try {
				const result = await mysql_client(query, [invoiceId]);
				const formattedResult = formatSearchResult(result, result);
				// Check if result is an array and has elements
				if (Array.isArray(result) && result.length > 0) {
					return formattedResult;
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
	stats: {
		getSalesStats: async () => {
			const result = await mysql_client(
				"SELECT agency, sum(weight) as weight FROM u373067935_cte.parcels where containerId=0 and invoiceDate >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND invoiceDate < CURDATE() group by agencyId order by weight desc;",
			);
			const agency = result.map((item: any) => {
				return {
					agency: toCamelCase(item.agency),
					weight: item.weight,
				};
			});
			return agency;
		},
		getDailySalesByAgency: async (
			agencyId: number = 2,
			startDate: string = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), 1))
				.toISOString()
				.split("T")[0],
			endDate: string = new Date().toISOString().split("T")[0],
		) => {
			const result = await mysql_client(
				"SELECT  fecha as date,  SUM(total+tarjeta_credito) AS sales FROM u373067935_cte.orden_envio WHERE orden_envio.agencia = ? AND fecha BETWEEN ? AND ? GROUP BY fecha ORDER BY fecha Asc;",
				[agencyId, startDate, endDate],
			);
			return result;
		},
		getEmployeeSales: async (agencyId: number = 2) => {
			const result = await mysql_client(
				"   SELECT  sum( total+tarjeta_credito) as sales,usuario as employee FROM orden_envio INNER JOIN agencias ON orden_envio.agencia = agencias.id WHERE DATE(fecha) = CURDATE() AND agencia = ? group by usuario ORDER BY sales DESC;",
				[agencyId],
			);
			return result;
		},
	},
};
