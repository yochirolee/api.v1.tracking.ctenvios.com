import { SHIPMENT_STATUSES } from "../models/prisma/status";


export type ShipmentStatusCode = keyof typeof SHIPMENT_STATUSES;


export interface PaginationParams {
	limit?: number;
	page?: number;
	offset?: number;
}

export interface ShipmentStatus {
	code: string;
	label: string;
	description: string;
}

export interface ShipmentStats {
	byStatus: Record<string, number>;
	byLocation: Record<string, number>;
	totalActive: number;
	totalDelivered: number;
	averageDeliveryTime: number;
}

export interface GeoLocation {
	latitude: number;
	longitude: number;
	accuracy?: number;
}

export interface ShipmentEvent {
	id: string;
	shipmentId: string;
	status: keyof typeof SHIPMENT_STATUSES;
	location: GeoLocation;
	timestamp: Date;
	notes?: string;
	userId: string;
}

export interface DeliveryPrediction {
	estimatedDeliveryTime: Date;
	confidence: number;
	factors: {
		weatherDelay?: number;
		customsDelay?: number;
		routeComplexity?: number;
	};
}

export interface ShipmentFilters {
	dateRange?: {
		start: Date;
		end: Date;
	};
	status?: Array<keyof typeof SHIPMENT_STATUSES>;
	locations?: string[];
	priority?: "HIGH" | "MEDIUM" | "LOW";
}

