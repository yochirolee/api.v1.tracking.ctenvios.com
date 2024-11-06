import { Event, EventType, ParcelStatus, UpdateMethod } from "@prisma/client";

interface EventConfig {
	locationId: number;
	status: ParcelStatus;
	description: string;
}

const EVENT_MAPPINGS: Record<string, EventConfig> = {
	fecha_aforo: {
		locationId: 5,
		status: ParcelStatus.AFORADO,
		description: "Su paquete ha sido aforado",
	},
	fecha_traslado: {
		locationId: 6,
		status: ParcelStatus.EN_TRASLADO,
		description: "Su paquete esta en traslado a destino final",
	},
	fecha_entregado: {
		locationId: 7,
		status: ParcelStatus.ENTREGADO,
		description: "Su paquete ha sido entregado",
	},
};

export function createUTCDate(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
}

export const createExcelEvents = (
	row: Record<string, any>,
	hbl_list: Array<{ hbl: string }>,
	userId: string,
): any[] => {
	const valid_hbl = hbl_list.find((item) => item.hbl === row.hbl);
	if (!valid_hbl) return [];

	return Object.entries(EVENT_MAPPINGS)
		.filter(([key]) => row[key] !== null && row[key] !== undefined)
		.map(
			([key, config]): Omit<Event, "id"> => ({
				hbl: valid_hbl.hbl,
				locationId: config.locationId,
				status: config.status,
				updatedAt: createUTCDate(row[key]),
				description: config.description,
				updateMethod: UpdateMethod.EXCEL_FILE,
				userId,
				type: EventType.UPDATE,
			}),
		);
};
