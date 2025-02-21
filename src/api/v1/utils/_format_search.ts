import { generateMySqlEvents } from "./_generate_sql_events";
import { toCamelCase } from "./_to_camel_case";

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

interface Shipment {
	hbl: string;
	status?: string;
	timestamp?: Date;
	updateMethod?: string;
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
	status?: string;
	timestamp?: Date;
	updateMethod?: string;
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
					status: shipment.status,
					timestamp: shipment.timestamp,
					updateMethod: shipment.updateMethod,
			  }
			: {
					...baseParcel,
					...lastEventMap.get(parcel.hbl),
			  };
	});
};

export { formatSearchResult };
