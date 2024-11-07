import { toCamelCase } from "./_toCamelCase";

export const formatResult = (packages: any[], events: any[]) => {
	const eventMap = new Map(events.map((event) => [event.hbl, event]));

	return packages.map((pkg) => {
		const matchingEvent = eventMap.get(pkg.hbl);
		const lastMySqlEvent = matchingEvent ? null : getMySqlParcelLastEvent(pkg);
		const eventData = matchingEvent || lastMySqlEvent;

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

		return {
			hbl,
			invoiceId,
			invoiceDate,
			agency,
			sender: toCamelCase(sender),
			receiver: toCamelCase(receiver),
			description: toCamelCase(description),
			city,
			province,
			weight,
			updatedAt: eventData?.updatedAt,
			status: eventData?.status?.status,
			statusName: eventData?.status?.name,
			statusDetails: eventData?.statusDetails,
			locationName: eventData?.location?.name || eventData?.locationName,
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

	switch (true) {
		case !!containerDate:
			return {
				locationId: 3,
				updatedAt: containerDate,
				locationName: "En Contenedor",
				status: "En Contenedor",
				statusDetails: containerName,
			};
		case !!palletDate:
			return {
				locationId: 2,
				updatedAt: palletDate,
				locationName: "Almacen Central",
				status: "En Pallet",
				statusDetails: palletId,
			};
		case !!dispatchDate:
			return {
				locationId: 2,
				updatedAt: dispatchDate,
				locationName: "Almacen Central",
				status: "En Despacho",
				statusDetails: `${dispatchId} ${dispatchStatus === 2 ? "Recibido" : "Generado"}`,
			};
		case !!invoiceDate:
			return {
				locationId: 1,
				updatedAt: invoiceDate,
				locationName: "En Agencia",
				status: "Facturado",
			};
		default:
			return null;
	}
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
		updatedAt: invoiceDate,
		locationName: "En Agencia",
		status: "Facturado",
	});

	if (dispatchDate) {
		createdEvents.push({
			locationId: 2,
			updatedAt: dispatchDate,
			locationName: "Almacen Central",
			status: "En Despacho",
			statusDetails: `${dispatchId} ${dispatchStatus === 2 ? "Recibido" : "Generado"}`,
		});
	}

	if (palletDate) {
		createdEvents.push({
			locationId: 2,
			updatedAt: palletDate,
			locationName: "Almacen Central",
			status: "En Pallet",
			statusDetails: palletId,
		});
	}

	if (containerDate) {
		createdEvents.push({
			locationId: 3,
			updatedAt: containerDate,
			locationName: "En Contenedor",
			status: "En Contenedor",
			statusDetails: containerName,
		});
	}

	if (events?.length) {
		createdEvents.push(...events);
	}

	return createdEvents;
};
