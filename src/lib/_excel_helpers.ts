import { Event, EventType, UpdateMethod } from "@prisma/client";

interface EventConfig {
	locationId: number;
	statusId: number;
}

const EVENT_MAPPINGS: Record<string, EventConfig> = {
	fecha_aforo: {
		locationId: 5,
		statusId: 6,
	},
	fecha_traslado: {
		locationId: 6,
		statusId: 7,
	},
	fecha_entregado: {
		locationId: 7,
		statusId: 8,
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
				statusId: config.statusId,
				updatedAt: createUTCDate(row[key]),
				updateMethod: UpdateMethod.EXCEL_FILE,
				userId,
				type: EventType.UPDATE,
			}),
		);
};

/* const eventMap = {
	fecha_aforo: { locationId: 5, statusId: 6 },
	fecha_traslado: { locationId: 6, statusId: 7 },
	fecha_entregado: { locationId: 7, statusId: 8 },
}; */

/* export const createEventFromExcelDataRow = (
	excelEvents: [],
	hbl_list: Array<{ hbl: string }>,
	userId: string,
) => {
	return Object.entries(excelEvents)
		.filter(([key]) => key in eventMap)
		.map(([key, value]) => {
			const valid_hbl = hbl_list.find((item) => item.hbl === value);
			if (!valid_hbl) return [];
			return {
				hbl: valid_hbl.hbl,
				updatedAt: value,
				userId,
				...eventMap[key as keyof typeof eventMap],
			};
		});
}; */
