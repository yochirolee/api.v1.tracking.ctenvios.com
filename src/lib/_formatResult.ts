import { ParcelStatus, Event } from "@prisma/client";
import { toCamelCase } from "./_toCamelCase";

export const formatResult = (packages: any[], events: any[]) => {
	return packages.map((pkg) => {
		const matchingLastEvent = events.find((event) => event.hbl === pkg.hbl);
		return {
			hbl: pkg.hbl,
			invoiceId: pkg.invoiceId,
			invoiceDate: pkg.invoiceDate,
			agency: pkg.agency,
			sender: toCamelCase(pkg.sender),
			receiver: toCamelCase(pkg.receiver),
			description: toCamelCase(pkg.description),
			city: pkg.city,
			province: pkg.province,
			weight: pkg.weight,
			updatedAt: matchingLastEvent
				? matchingLastEvent.updatedAt
				: getMySqlParcelLastEvent(pkg)?.updatedAt,
			status: matchingLastEvent ? matchingLastEvent.status : getMySqlParcelLastEvent(pkg)?.status,
			statusDetails: matchingLastEvent
				? matchingLastEvent.statusDetails
				: getMySqlParcelLastEvent(pkg)?.statusDetails,
			locationName: matchingLastEvent
				? matchingLastEvent.location.name
				: getMySqlParcelLastEvent(pkg)?.locationName,
		};
	});
};

const getMySqlParcelLastEvent = (mysqlParcel: any) => {
	if (mysqlParcel?.containerDate) {
		return {
			locationId: 3,
			updatedAt: mysqlParcel?.containerDate,
			locationName: "En Contenedor",
			status: ParcelStatus.EN_CONTENEDOR,
			statusDetails: mysqlParcel?.containerName,
		};
	}
	if (mysqlParcel?.palletDate) {
		return {
			locationId: 2,
			updatedAt: mysqlParcel?.palletDate,
			locationName: "Almacen Central",
			status: ParcelStatus.EN_PALLET,
			statusDetails: mysqlParcel?.palletId,
		};
	}
	if (mysqlParcel?.dispatchDate) {
		return {
			locationId: 2,
			updatedAt: mysqlParcel?.dispatchDate || null,
			locationName: "Almacen Central",
			status: ParcelStatus.EN_DESPACHO,
			statusDetails:
				mysqlParcel?.dispatchId +
				" " +
				(mysqlParcel?.dispatchStatus == 2 ? "Recibido" : "Generado"),
		};
	}
	if (mysqlParcel?.invoiceDate) {
		return {
			locationId: 1,
			updatedAt: mysqlParcel?.invoiceDate,
			locationName: "En Agencia",
			status: ParcelStatus.FACTURADO,
		};
	}
	return null;
	// Sort events by date and return the most recent one
};

export const formatResultwithEvents = (myslqParcel: any, events: any) => {
	// Create a Map for quick lookup by `hbl`
	if (myslqParcel.length === 0) return null;
	const formatedResult = {
		invoiceId: myslqParcel[0].invoiceId,
		customer: {
			id: myslqParcel[0]?.senderId,
			fullName: toCamelCase(myslqParcel[0]?.sender),
			mobile: myslqParcel[0]?.senderMobile,
		},
		receiver: {
			id: myslqParcel[0]?.receiverId,
			fullName: toCamelCase(myslqParcel[0]?.receiver),
			mobile: myslqParcel[0]?.receiverMobile,
			ci: myslqParcel[0]?.receiverCi,
		},
		agency: toCamelCase(myslqParcel[0]?.agency),
		province: myslqParcel[0]?.province,
		city: myslqParcel[0]?.city,
		weight: myslqParcel[0]?.weight,
		description: toCamelCase(myslqParcel[0]?.description),

		shippingAddress: toCamelCase(
			myslqParcel[0]?.cll +
				" " +
				myslqParcel[0]?.entre_cll +
				" " +
				myslqParcel[0]?.no +
				" " +
				myslqParcel[0]?.apto +
				" " +
				myslqParcel[0]?.reparto,
		),

		events: createEventHistory(myslqParcel[0], events),
	};

	return formatedResult;
};

const createEventHistory = (mysqlParcel: any, event: any) => {
	const createdEvents = [];
	if (mysqlParcel?.invoiceDate) {
		createdEvents.push({
			locationId: 1,
			updatedAt: mysqlParcel?.invoiceDate,
			locationName: "En Agencia",
			status: ParcelStatus.FACTURADO,
		});
		if (mysqlParcel?.dispatchDate) {
			createdEvents.push({
				locationId: 2,
				updatedAt: mysqlParcel?.dispatchDate || null,
				locationName: "Almacen Central",
				status: ParcelStatus.EN_DESPACHO,
				statusDetails:
					mysqlParcel?.dispatchId +
					" " +
					(mysqlParcel?.dispatchStatus == 2 ? "Recibido" : "Generado"),
			});
		}

		if (mysqlParcel?.palletDate) {
			createdEvents.push({
				locationId: 2,
				updatedAt: mysqlParcel?.palletDate,
				locationName: "Almacen Central",
				status: ParcelStatus.EN_PALLET,
				statusDetails: mysqlParcel?.palletId,
			});
		}

		if (mysqlParcel?.containerDate) {
			createdEvents.push({
				locationId: 3,
				updatedAt: mysqlParcel?.containerDate,
				locationName: "En Contenedor",
				status: ParcelStatus.EN_CONTENEDOR,
				statusDetails: mysqlParcel?.containerName,
			});
		}
		if (event?.length > 0) createdEvents.push(...event);
	}
	return createdEvents;
};
