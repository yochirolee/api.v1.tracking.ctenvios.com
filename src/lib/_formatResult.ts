import { Event, EventType } from "@prisma/client";
import { UpdateMethod } from "@prisma/client";
import { toCamelCase } from "./_toCamelCase";
import { createUTCDate } from "./_excel_helpers";

export const formatResult = (packages: any[], events: any[]) => {
	const eventMap = new Map(events.map((event) => [event.hbl, event]));

	return packages.map((pkg) => {
		const matchingEvent = eventMap.get(pkg.hbl);
		const eventData = matchingEvent || getMySqlParcelLastEvent(pkg);

		const {
			hbl,
			invoiceId,
			invoiceDate,
			agency,
			sender,
			receiver,
			description,
			city,
			province,
			weight,
		} = pkg;

		// Store camelCase conversions in variables to avoid repeated calls
		const camelCaseSender = toCamelCase(sender);
		const camelCaseReceiver = toCamelCase(receiver);
		const camelCaseDescription = toCamelCase(description);

		return {
			hbl,
			invoiceId,
			invoiceDate,
			agency,
			sender: camelCaseSender,
			receiver: camelCaseReceiver,
			description: camelCaseDescription,
			city,
			province,
			weight,
			updatedAt: createUTCDate(new Date(eventData?.updatedAt)),
			status: eventData?.status?.status ?? eventData?.status,
			statusDetails: eventData?.statusDetails,
			location: eventData?.location?.name ?? eventData?.location,
		};
	});
};

const getMySqlParcelLastEvent = (mysqlParcel: any) => {
	if (!mysqlParcel) return null;

	const {
		containerDate,
		containerName,
		palletDate,
		palletId,
		dispatchDate,
		dispatchId,
		dispatchStatus,
		invoiceDate,
	} = mysqlParcel;

	// Check conditions in order of priority
	if (containerDate) {
		return {
			locationId: 3,
			updatedAt: createUTCDate(new Date(containerDate)),
			location: "Contenedor",
			status: "EN_CONTENEDOR",
			statusDetails: containerName,
		};
	}

	if (palletDate) {
		return {
			locationId: 2,
			updatedAt: createUTCDate(new Date(palletDate)),
			location: "Almacen",
			status: "EN_PALLET",
			statusDetails: palletId,
		};
	}

	if (dispatchDate) {
		return {
			locationId: 2,
			updatedAt: createUTCDate(new Date(dispatchDate)),
			location: "Almacen",
			status: "EN_DESPACHO",
			statusDetails: `${dispatchId} ${dispatchStatus === 2 ? "Recibido" : "Generado"}`,
		};
	}

	if (invoiceDate) {
		return {
			locationId: 1,
			updatedAt: createUTCDate(new Date(invoiceDate)),
			location: "Agencia",
			status: "FACTURADO",
		};
	}

	return null; // Add explicit return for when no conditions match
};

export const formatResultwithEvents = (mysqlParcel: any[], events: any) => {
	if (!mysqlParcel?.length) return null;

	const parcel = mysqlParcel[0];
	const {
		invoiceId,
		senderId,
		sender,
		senderMobile,
		receiverId,
		receiver,
		receiverMobile,
		receiverCi,
		agency,
		province,
		city,
		weight,
		description,
		cll,
		entre_cll,
		no,
		apto,
		reparto,
	} = parcel;

	const shippingAddress = toCamelCase(
		[cll, entre_cll, no, apto, reparto].filter(Boolean).join(" "),
	);

	return {
		invoiceId,
		customer: {
			id: senderId,
			fullName: toCamelCase(sender),
			mobile: senderMobile,
		},
		receiver: {
			id: receiverId,
			fullName: toCamelCase(receiver),
			mobile: receiverMobile,
			ci: receiverCi,
		},
		agency: toCamelCase(agency),
		province,
		city,
		weight,
		description: toCamelCase(description),
		shippingAddress,
		events: createEventHistory(parcel, events),
	};
};

const createEventHistory = (mysqlParcel: any, events: any) => {
	if (!mysqlParcel?.invoiceDate) return [];

	const createdEvents = [];
	const {
		invoiceDate,
		dispatchDate,
		dispatchId,
		dispatchStatus,
		palletDate,
		palletId,
		containerDate,
		containerName,
	} = mysqlParcel;

	createdEvents.push({
		locationId: 1,
		updatedAt: createUTCDate(new Date(invoiceDate)),
		location: "Agencia",
		status: "FACTURADO",
	});

	if (dispatchDate) {
		createdEvents.push({
			locationId: 2,
			updatedAt: createUTCDate(new Date(dispatchDate)),
			location: "Almacen Central",
			status: "EN_DESPACHO",
			statusDetails: `${dispatchId} ${dispatchStatus === 2 ? "Recibido" : "Generado"}`,
		});
	}

	if (palletDate) {
		createdEvents.push({
			locationId: 2,
			updatedAt: createUTCDate(new Date(palletDate)),
			location: "Almacen Central",
			status: "EN_PALLET",
			statusDetails: palletId,
		});
	}

	if (containerDate) {
		createdEvents.push({
			locationId: 3,
			updatedAt: createUTCDate(new Date(containerDate)),
			location: "Contenedor",
			status: "EN_CONTENEDOR",
			statusDetails: containerName,
		});
	}

	if (events?.length) {
		createdEvents.push(...events);
	}

	return createdEvents;
};
export const createEvents = (
	mysql_parcels: any[],
	userId: string,
	updatedAt: string,
	statusId: number,
	locationId: number,
	updateMethod: UpdateMethod = UpdateMethod.SYSTEM,
	type: EventType = EventType.UPDATE,
): any[] => {
	return mysql_parcels.map((parcel) => ({
		hbl: parcel.hbl,
		statusId,
		locationId,
		userId: userId.toString(),
		type,
		updateMethod,
		updatedAt: createUTCDate(new Date(updatedAt)),
	}));
};
