"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatResultwithEvents = exports.formatResult = void 0;
const client_1 = require("@prisma/client");
const _toCamelCase_1 = require("./_toCamelCase");
const formatResult = (packages, events) => {
    return packages.map((pkg) => {
        var _a, _b, _c, _d;
        const matchingLastEvent = events.find((event) => event.hbl === pkg.hbl);
        return {
            hbl: pkg.hbl,
            invoiceId: pkg.invoiceId,
            invoiceDate: pkg.invoiceDate,
            agency: pkg.agency,
            sender: (0, _toCamelCase_1.toCamelCase)(pkg.sender),
            receiver: (0, _toCamelCase_1.toCamelCase)(pkg.receiver),
            description: (0, _toCamelCase_1.toCamelCase)(pkg.description),
            city: pkg.city,
            province: pkg.province,
            weight: pkg.weight,
            updatedAt: matchingLastEvent
                ? matchingLastEvent.updatedAt
                : (_a = getMySqlParcelLastEvent(pkg)) === null || _a === void 0 ? void 0 : _a.updatedAt,
            status: matchingLastEvent ? matchingLastEvent.status : (_b = getMySqlParcelLastEvent(pkg)) === null || _b === void 0 ? void 0 : _b.status,
            statusDetails: matchingLastEvent
                ? matchingLastEvent.statusDetails
                : (_c = getMySqlParcelLastEvent(pkg)) === null || _c === void 0 ? void 0 : _c.statusDetails,
            locationName: matchingLastEvent
                ? matchingLastEvent.location.name
                : (_d = getMySqlParcelLastEvent(pkg)) === null || _d === void 0 ? void 0 : _d.locationName,
        };
    });
};
exports.formatResult = formatResult;
const getMySqlParcelLastEvent = (mysqlParcel) => {
    if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.containerDate) {
        return {
            locationId: 3,
            updatedAt: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.containerDate,
            locationName: "En Contenedor",
            status: client_1.ParcelStatus.EN_CONTENEDOR,
            statusDetails: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.containerName,
        };
    }
    if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.palletDate) {
        return {
            locationId: 2,
            updatedAt: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.palletDate,
            locationName: "Almacen Central",
            status: client_1.ParcelStatus.EN_PALLET,
            statusDetails: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.palletId,
        };
    }
    if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchDate) {
        return {
            locationId: 2,
            updatedAt: (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchDate) || null,
            locationName: "Almacen Central",
            status: client_1.ParcelStatus.EN_DESPACHO,
            statusDetails: (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchId) +
                " " +
                ((mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchStatus) == 2 ? "Recibido" : "Generado"),
        };
    }
    if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.invoiceDate) {
        return {
            locationId: 1,
            updatedAt: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.invoiceDate,
            locationName: "En Agencia",
            status: client_1.ParcelStatus.FACTURADO,
        };
    }
    return null;
    // Sort events by date and return the most recent one
};
const formatResultwithEvents = (myslqParcel, events) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    // Create a Map for quick lookup by `hbl`
    if (myslqParcel.length === 0)
        return null;
    const formatedResult = {
        invoiceId: myslqParcel[0].invoiceId,
        customer: {
            id: (_a = myslqParcel[0]) === null || _a === void 0 ? void 0 : _a.senderId,
            fullName: (0, _toCamelCase_1.toCamelCase)((_b = myslqParcel[0]) === null || _b === void 0 ? void 0 : _b.sender),
            mobile: (_c = myslqParcel[0]) === null || _c === void 0 ? void 0 : _c.senderMobile,
        },
        receiver: {
            id: (_d = myslqParcel[0]) === null || _d === void 0 ? void 0 : _d.receiverId,
            fullName: (0, _toCamelCase_1.toCamelCase)((_e = myslqParcel[0]) === null || _e === void 0 ? void 0 : _e.receiver),
            mobile: (_f = myslqParcel[0]) === null || _f === void 0 ? void 0 : _f.receiverMobile,
            ci: (_g = myslqParcel[0]) === null || _g === void 0 ? void 0 : _g.receiverCi,
        },
        agency: (0, _toCamelCase_1.toCamelCase)((_h = myslqParcel[0]) === null || _h === void 0 ? void 0 : _h.agency),
        province: (_j = myslqParcel[0]) === null || _j === void 0 ? void 0 : _j.province,
        city: (_k = myslqParcel[0]) === null || _k === void 0 ? void 0 : _k.city,
        weight: (_l = myslqParcel[0]) === null || _l === void 0 ? void 0 : _l.weight,
        description: (0, _toCamelCase_1.toCamelCase)((_m = myslqParcel[0]) === null || _m === void 0 ? void 0 : _m.description),
        shippingAddress: (0, _toCamelCase_1.toCamelCase)(((_o = myslqParcel[0]) === null || _o === void 0 ? void 0 : _o.cll) +
            " " +
            ((_p = myslqParcel[0]) === null || _p === void 0 ? void 0 : _p.entre_cll) +
            " " +
            ((_q = myslqParcel[0]) === null || _q === void 0 ? void 0 : _q.no) +
            " " +
            ((_r = myslqParcel[0]) === null || _r === void 0 ? void 0 : _r.apto) +
            " " +
            ((_s = myslqParcel[0]) === null || _s === void 0 ? void 0 : _s.reparto)),
        events: createEventHistory(myslqParcel[0], events),
    };
    return formatedResult;
};
exports.formatResultwithEvents = formatResultwithEvents;
const createEventHistory = (mysqlParcel, event) => {
    const createdEvents = [];
    if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.invoiceDate) {
        createdEvents.push({
            locationId: 1,
            updatedAt: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.invoiceDate,
            locationName: "En Agencia",
            status: client_1.ParcelStatus.FACTURADO,
        });
        if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchDate) {
            createdEvents.push({
                locationId: 2,
                updatedAt: (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchDate) || null,
                locationName: "Almacen Central",
                status: client_1.ParcelStatus.EN_DESPACHO,
                statusDetails: (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchId) +
                    " " +
                    ((mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.dispatchStatus) == 2 ? "Recibido" : "Generado"),
            });
        }
        if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.palletDate) {
            createdEvents.push({
                locationId: 2,
                updatedAt: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.palletDate,
                locationName: "Almacen Central",
                status: client_1.ParcelStatus.EN_PALLET,
                statusDetails: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.palletId,
            });
        }
        if (mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.containerDate) {
            createdEvents.push({
                locationId: 3,
                updatedAt: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.containerDate,
                locationName: "En Contenedor",
                status: client_1.ParcelStatus.EN_CONTENEDOR,
                statusDetails: mysqlParcel === null || mysqlParcel === void 0 ? void 0 : mysqlParcel.containerName,
            });
        }
        if ((event === null || event === void 0 ? void 0 : event.length) > 0)
            createdEvents.push(...event);
    }
    return createdEvents;
};
