import { Shipment, ShipmentEvent, Status } from "@prisma/client";
import { generateMySqlEvents } from "./_generate_sql_events";
import { toCamelCase } from "./_to_camel_case";
interface MySqlParcel {
	containerDate?: string;
	containerName?: string;
	palletDate?: string;
	palletId?: string;
	agency?: string;
	agencyId?: number;
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
	containerId: number;
	weight?: number;
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
const formatSearchResult = (shipments: any | [], parcels: MySqlParcel[]) => {
	const formattedShipments = parcels.map((parcel) => {
		const flattenedShipment = flattenShipment(shipments).find(
			(shipment: FlattenedShipment) => shipment?.hbl === parcel.hbl,
		);
		let mysql_events: any[] = [];
		if (!flattenedShipment) {
			mysql_events = generateMySqlEvents(parcel);
		}

		return {
			hbl: parcel.hbl,
			invoiceId: parcel.invoiceId,
			sender: toCamelCase(parcel.sender),
			receiver: toCamelCase(parcel.receiver),
			description: toCamelCase(parcel.description),
			state: toCamelCase(parcel.state),
			city: toCamelCase(parcel.city),
			containerId: parcel.containerId,
			agencyId: parcel.agencyId,
			agency: parcel.agency,
			weight: parcel?.weight,
			status: flattenedShipment?.status
				? flattenedShipment?.status
				: mysql_events[mysql_events.length - 1]?.status?.name,
			status_code: flattenedShipment?.status_code
				? flattenedShipment?.status_code
				: mysql_events[mysql_events.length - 1]?.status?.code,
			status_description: flattenedShipment?.status_description
				? flattenedShipment?.status_description
				: mysql_events[mysql_events.length - 1]?.status?.description,
			timestamp: flattenedShipment?.timestamp || mysql_events[mysql_events.length - 1]?.timestamp,
		};
	});
	return formattedShipments;
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
				agency: shipment?.agency?.name,
				status: shipment?.events[0]?.status ? shipment?.events[0]?.status?.name : undefined,
				status_code: shipment?.events[0]?.status ? shipment?.events[0]?.status?.code : undefined,
				status_description: shipment?.events[0]?.status
					? shipment?.events[0]?.status?.description
					: undefined,
				timestamp: shipment?.events[0]?.timestamp,
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
		status_description: shipments?.events[0].status
			? shipments.events[0].status.description
			: undefined,
		timestamp: shipments?.events[0].timestamp,
		events: undefined,
	};
};

export { formatSearchResult, flattenShipment };
