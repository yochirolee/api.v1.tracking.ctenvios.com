import { Shipment, ShipmentEvent, Status } from "@prisma/client";
import { generateMySqlEvents } from "./_generate_sql_events";
import { toCamelCase } from "./_to_camel_case";
import { Code128Reader } from "@zxing/library";

interface MySqlParcel {
	containerDate?: string;
	containerName?: string;
	palletDate?: string;
	palletId?: string;
	agency?: string;
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

// Add return type interface
interface FormattedParcel {
	hbl: string;
	invoiceId: string;
	agency?: string;
	invoiceDate?: string;
	description: string;
	sender: string;
	receiver: string;
	state: string;
	city: string;
	timestamp?: Date;
	events?: ShipmentEvent[];
	status?: [
		{
			id: number;
			name: string;
			code: string;
			description: string;
		},
	];
	updateMethod?: string;
	location?: string;
	user?: [
		{
			name: string;
			id: string;
		},
	];
}

interface FlattenedShipment {
	hbl: string;
	invoiceId: number;
	sender: string;
	receiver: string;
	description: string;
	state: string;
	city: string;
	containerId: number;
	agency: [
		{
			id: number;
			name: string;
		},
	];
	status: [
		{
			id: number;
			code: string;
			name: string;
			description: string;
		},
	];
}

const formatSearchResult = (shipments: Shipment[], parcels: MySqlParcel[]): FormattedParcel[] => {
	// Create both maps in a single pass through shipments
	const shipmentMap = new Map<string, Shipment>();
	shipments.forEach((shipment) => shipmentMap.set(shipment.hbl, shipment));

	// Create a Set of HBLs with shipments for faster lookups
	const hblsWithShipments = new Set(shipmentMap.keys());

	// Pre-calculate all events in a single pass
	const lastEventMap = new Map<string, any>();
	const parcelEvents = parcels
		.filter((parcel) => !hblsWithShipments.has(parcel.hbl))
		.map((parcel) => ({
			hbl: parcel.hbl,
			events: generateMySqlEvents(parcel),
		}));

	parcelEvents.forEach(({ hbl, events }) => {
		lastEventMap.set(hbl, events[events.length - 1]);
	});

	// Process parcels with memoized data
	return parcels.map((parcel): FormattedParcel => {
		const baseParcel = {
			hbl: parcel.hbl,
			invoiceId: parcel.invoiceId,
			agency: parcel.agency ? toCamelCase(parcel.agency) : undefined,
			invoiceDate: parcel.invoiceDate,
			description: toCamelCase(parcel.description),
			sender: toCamelCase(parcel.sender),
			receiver: toCamelCase(parcel.receiver),
			state: toCamelCase(parcel.state),
			city: toCamelCase(parcel.city),
		};

		const shipment = shipmentMap.get(parcel.hbl);

		return shipment
			? {
					...baseParcel,
			  }
			: {
					...baseParcel,
					timestamp: lastEventMap.get(parcel.hbl)?.timestamp,
					status: lastEventMap.get(parcel.hbl)?.status,
					updateMethod: lastEventMap.get(parcel.hbl)?.updateMethod,
					location: lastEventMap.get(parcel.hbl)?.location,
					user: lastEventMap.get(parcel.hbl)?.user,
			  };
	});
};

const flattenShipment = (shipments: any | []) => {
	//if is array, return array of flattened shipments
	if (!shipments) {
		return [];
	}
	if (Array.isArray(shipments)) {
		return shipments.map((shipment) => {
			return {
				...shipment,
				agency: shipment?.agency.name,
				status: shipment?.events[0].status ? shipment.events[0].status.name : undefined,
				status_code: shipment?.events[0].status ? shipment.events[0].status.code : undefined,
				timestamp: shipment?.events[0].timestamp,
				events: undefined,
			};
		});
	}
	//if is object, return flattened shipment
	return {
		...shipments,
		agency: shipments?.agency.name,
		status: shipments?.events[0].status ? shipments.events[0].status.name : undefined,
		status_code: shipments?.events[0].status ? shipments.events[0].status.code : undefined,
		timestamp: shipments?.events[0].timestamp,
		events: undefined,
	};
};

export { formatSearchResult, flattenShipment };
