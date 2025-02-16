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

export const SHIPMENT_STATUSES = {
  PENDING: {
    code: 'PENDING',
    label: 'Pending',
    description: 'Shipment registered but not yet in transit'
  },
  IN_TRANSIT: {
    code: 'IN_TRANSIT',
    label: 'In Transit',
    description: 'Shipment is being transported'
  },
  CUSTOMS: {
    code: 'CUSTOMS',
    label: 'In Customs',
    description: 'Package is being processed by customs'
  },
  DELIVERED: {
    code: 'DELIVERED',
    label: 'Delivered',
    description: 'Package has been delivered to recipient'
  },
  EXCEPTION: {
    code: 'EXCEPTION',
    label: 'Exception',
    description: 'There is an issue with the shipment'
  }
} as const;

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
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
} 