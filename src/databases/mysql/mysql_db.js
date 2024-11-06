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
exports.mysql_db = void 0;
const mysql_client_1 = __importDefault(require("./mysql_client"));
exports.mysql_db = {
    containers: {
        getById: (id) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const [result] = yield (0, mysql_client_1.default)("select codigo as id, fecha as createdAt, numero as name, servicio as service, master, paquetes as total_parcels,peso as weight from contenedores WHERE codigo=?", [id]);
                return result;
            }
            catch (error) {
                console.log(error);
            }
        }),
        getAll: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 20) {
            try {
                const result = yield (0, mysql_client_1.default)("select codigo as id, fecha as createdAt, numero as name, servicio as service, master, paquetes as total_parcels,peso as weight from contenedores order by codigo DESC limit ?	;", [limit]);
                return result;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        }),
        getParcelsByContainerId: (containerId_1, ...args_1) => __awaiter(void 0, [containerId_1, ...args_1], void 0, function* (containerId, verbose = false) {
            const queryStr = verbose
                ? "select hbl,agency,agencyId,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight  from parcels where containerId = ?"
                : "SELECT hbl,invoiceId,containerId,parcelType as type, agencyId,currentLocation from parcels where containerId = ?";
            const result = yield (0, mysql_client_1.default)(queryStr, [containerId]);
            return result;
        }),
    },
    parcels: {
        getAll: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 25) {
            page = Math.max(1, page);
            limit = Math.max(1, limit);
            const offset = (page - 1) * limit;
            const queryStr = `
	    select hbl,invoiceId,agency,agencyId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, sender,receiver,city,province,description,containerName,weight
		FROM parcels 
		ORDER BY invoiceDate DESC 
		LIMIT ? OFFSET ?
	`;
            const countQueryStr = "SELECT COUNT(*) as total FROM parcels";
            const [packagesFound, [{ total }]] = yield Promise.all([
                (0, mysql_client_1.default)(queryStr, [limit, offset]),
                (0, mysql_client_1.default)(countQueryStr),
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
        }),
        search: (searchTerm_1, ...args_1) => __awaiter(void 0, [searchTerm_1, ...args_1], void 0, function* (searchTerm, limit = 15, page = 1) {
            try {
                page = Math.max(1, page);
                limit = Math.max(1, limit);
                const offset = (page - 1) * limit;
                const trimmedSearchTerm = searchTerm ? searchTerm.trim() : "";
                // Base query structure
                const baseQuery = `
					select hbl,agency,agencyId,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, 
						   sender,receiver,city,province,description,containerName,weight 
					FROM \`parcels\` WHERE`;
                let whereClause;
                let queryParams = [];
                // Determine the WHERE clause based on search term
                if (trimmedSearchTerm.length === 10 && !isNaN(Number(trimmedSearchTerm))) {
                    whereClause = "senderMobile = ?";
                    queryParams = [trimmedSearchTerm];
                }
                else if (trimmedSearchTerm.length === 8 && !isNaN(Number(trimmedSearchTerm))) {
                    whereClause = "receiverMobile = ?";
                    queryParams = [trimmedSearchTerm];
                }
                else if (trimmedSearchTerm.length === 11 && !isNaN(Number(trimmedSearchTerm))) {
                    whereClause = "receiverCi = ?";
                    queryParams = [trimmedSearchTerm];
                }
                else if (trimmedSearchTerm.startsWith("CTE")) {
                    whereClause = "hbl = ?";
                    queryParams = [trimmedSearchTerm];
                }
                else if (!isNaN(Number(trimmedSearchTerm))) {
                    whereClause = "InvoiceId = ?";
                    queryParams = [trimmedSearchTerm];
                }
                else {
                    const searchTermWildcard = `%${trimmedSearchTerm.replace(/\s+/g, "%")}%`;
                    whereClause = "sender LIKE ? OR receiver LIKE ? OR description LIKE ?";
                    queryParams = [searchTermWildcard, searchTermWildcard, searchTermWildcard];
                }
                const queryStr = `${baseQuery} ${whereClause} ORDER BY InvoiceId DESC LIMIT ? OFFSET ?`;
                queryParams.push(limit, offset);
                const [packagesFound, [{ total }]] = yield Promise.all([
                    (0, mysql_client_1.default)(queryStr, queryParams),
                    (0, mysql_client_1.default)("SELECT FOUND_ROWS() as total"),
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
            }
            catch (error) {
                console.error(`Error occurred during package search with term "${searchTerm}":`, error);
                throw new Error("An error occurred while searching for packages. Please try again later.");
            }
        }),
        getInHblArray: (hblArray_1, ...args_1) => __awaiter(void 0, [hblArray_1, ...args_1], void 0, function* (hblArray, verbose = false) {
            if (hblArray.length === 0) {
                return [];
            }
            const placeholders = hblArray.map(() => "?").join(",");
            const query = verbose
                ? `select hbl,agency,agencyId,invoiceId,containerDate,invoiceDate,palletId,palletDate,dispatchDate,dispatchId, 
						   sender,receiver,city,province,description,containerName,weight  FROM parcels WHERE hbl IN (${placeholders})`
                : `SELECT hbl FROM parcels WHERE hbl IN (${placeholders})`;
            const result = yield (0, mysql_client_1.default)(query, hblArray);
            return result;
        }),
        getByInvoiceId: (invoiceId) => __awaiter(void 0, void 0, void 0, function* () {
            const query = "SELECT * FROM parcels WHERE invoiceId = ? LIMIT 1";
            try {
                const result = yield (0, mysql_client_1.default)(query, [invoiceId]);
                // Check if result is an array and has elements
                if (Array.isArray(result) && result.length > 0) {
                    return result[0];
                }
                else {
                    return null;
                }
            }
            catch (error) {
                console.error("Error fetching parcel by invoice ID:", error);
                throw error;
            }
        }),
        getByHbl: (hbl) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const result = yield (0, mysql_client_1.default)(`SELECT * FROM parcels WHERE hbl = ?`, [hbl]);
                if (!result || result.length === 0) {
                    return [];
                }
                return result;
            }
            catch (error) {
                console.error(`Error fetching parcel by HBL ${hbl}:`, error);
                throw new Error("Failed to fetch parcel data");
            }
        }),
    },
};
