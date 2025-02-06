import { toCamelCase } from "./_to_camel_case";

interface MySqlParcel {
	containerDate?: string;
	containerName?: string;
	palletDate?: string;
	palletId?: string;
	dispatchDate?: string;
	dispatchId?: string;
	dispatchStatus?: number;
	invoiceDate?: string;
	hbl: string;
	invoiceId: string;
	description: string;
	sender: string;
	receiver: string;
	province: string;
	city: string;
	state: string;
}

interface Shipment {
	hbl: string;
	locationId?: number;
	location?: { name: string };
	status?: string;
	timestamp?: Date;
	updateMethod?: string;
}

interface ParcelEvent {
	locationId: number;
	timestamp: Date;
	location: string;
	status: string;
	statusDetails?: string;
	updateMethod: string;
}

const getMySqlParcelLastEvent = (mysqlParcel: MySqlParcel | null): ParcelEvent | null => {
	if (!mysqlParcel) return null;

	// Check conditions in order of priority with early returns
	if (mysqlParcel.containerDate) {
		return {
			locationId: 3,
			timestamp: new Date(mysqlParcel.containerDate),
			location: "Contenedor",
			status: "IN_CONTAINER",
			statusDetails: mysqlParcel.containerName?.slice(-4),
			updateMethod: "SYSTEM",
		};
	}

	if (mysqlParcel.palletDate) {
		return {
			locationId: 2,
			timestamp: new Date(mysqlParcel.palletDate),
			location: "Almacen",
			status: "IN_PALLET",
			statusDetails: mysqlParcel.palletId,

			updateMethod: "SYSTEM",
		};
	}

	if (mysqlParcel.dispatchDate) {
		return {
			locationId: 2,
			timestamp: new Date(mysqlParcel.dispatchDate),
			location: "Almacen",
			status: "IN_DISPATCH",
			statusDetails: `${mysqlParcel.dispatchId} ${
				mysqlParcel.dispatchStatus === 2 ? "Recibido " + mysqlParcel.dispatchId : "Generado"
			}`,

			updateMethod: "SYSTEM",
		};
	}

	if (mysqlParcel.invoiceDate) {
		return {
			locationId: 1,
			timestamp: new Date(mysqlParcel.invoiceDate),
			location: "Agencia",
			status: "INVOICED",
			updateMethod: "SYSTEM",
		};
	}

	return null;
};

const formatSearchResult = (shipments: Shipment[], parcels: MySqlParcel[]) => {
	// Create a Map for O(1) shipment lookups
	const shipmentMap = new Map(shipments.map((shipment) => [shipment.hbl, shipment]));

	// Pre-calculate lastEvents for parcels without shipments to avoid redundant calculations
	const lastEventMap = new Map();
	parcels.forEach((parcel) => {
		if (!shipmentMap.has(parcel.hbl)) {
			lastEventMap.set(parcel.hbl, getMySqlParcelLastEvent(parcel));
		}
	});

	return parcels.map((parcel) => {
		const shipment = shipmentMap.get(parcel.hbl);

		if (!shipment) {
			const lastEvent = lastEventMap.get(parcel.hbl);
			return {
				hbl: parcel.hbl,
				invoiceId: parcel.invoiceId,
				description: toCamelCase(parcel.description),
				sender: toCamelCase(parcel.sender),
				receiver: toCamelCase(parcel.receiver),
				state: parcel.state,
				city: parcel.city,
				...lastEvent,
			};
		}

		return {
			hbl: parcel.hbl,
			invoiceId: parcel.invoiceId,
			description: toCamelCase(parcel.description),
			sender: toCamelCase(parcel.sender),
			receiver: toCamelCase(parcel.receiver),
			locationId: shipment.locationId,
			location: shipment.location?.name,
			status: shipment.status,
			state: parcel.state,
			city: parcel.city,
			timestamp: shipment.timestamp,
			updateMethod: shipment.updateMethod,
		};
	});
};

export { formatSearchResult };
