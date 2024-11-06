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
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma_db = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.prisma_db = {
    /* 	parcels: {
        getAll: async () => {
            try {
                const parcels = await prisma.parcel.findMany();
                return parcels;
            } catch (error) {
                console.error("Error fetching all parcels:", error);
                throw error;
            }
        },
        getByHbl: async (hbl: string) => {
            try {
                const parcel = await prisma.parcel.findUnique({
                    where: { hbl },
                    include: {
                        events: {
                            include: {
                                issues: {
                                    include: {
                                        comments: true,
                                    },
                                },
                                location: true,
                            },
                        },
                        currentLocation: true,
                    },
                });
                console.log(parcel);
                return parcel;
            } catch (error) {
                console.error(`Error fetching parcel with HBL ${hbl}:`, error);
                throw error;
            }
        },
        getByHblArray: async (hbl_array: string[]) => {
            try {
                const parcels = await prisma.parcel.findMany({
                    where: {
                        hbl: { in: hbl_array },
                    },
                    include: {
                        currentLocation: true,
                    },
                });
                return parcels;
            } catch (error) {
                console.error("Error fetching parcels by HBL array:", error);
                throw error;
            }
        },
    }, */
    events: {
        getLatestEvents: (hbl_array) => __awaiter(void 0, void 0, void 0, function* () {
            const event = yield prisma.event.findMany({
                where: { hbl: { in: hbl_array } },
                include: {
                    location: true,
                },
                orderBy: [{ updatedAt: "desc" }, { locationId: "desc" }],
                distinct: ["hbl"],
            });
            return event;
        }),
        getEventsByHbl: (hbl_array) => __awaiter(void 0, void 0, void 0, function* () {
            const events = yield prisma.event.findMany({
                where: { hbl: { in: hbl_array } },
                include: {
                    location: true,
                },
            });
            const eventsWithLocationName = events.map((event) => (Object.assign(Object.assign({}, event), { locationName: event.location.name })));
            return eventsWithLocationName;
        }),
    },
    issues: {
        getAll: () => __awaiter(void 0, void 0, void 0, function* () {
            const issues = yield prisma.issue.findMany({
                include: {
                    comments: true,
                },
            });
            return issues;
        }),
        resolve: (id) => __awaiter(void 0, void 0, void 0, function* () {
            const issue = yield prisma.issue.update({
                where: { id },
                data: { resolvedAt: new Date(), status: client_1.IssueStatus.RESOLVED },
            });
            return issue;
        }),
    },
    /* containers: {
        getByContainerId: async (containerId: number) => {
            const containers = await prisma.parcel.findMany({
                where: { containerId: containerId },
                include: {
                    currentLocation: true,
                },
            });
            return containers;
        },
    }, */
};
