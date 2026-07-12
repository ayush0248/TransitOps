export type VehicleStatus =
  | "available"
  | "on_trip"
  | "in_shop"
  | "retired";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  model?: string | null;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  revenue: number;
  region?: string | null;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormValues {
  registrationNumber: string;
  name: string;
  model?: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  revenue: number;
  region?: string;
  status: VehicleStatus;
}

export interface VehiclePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  pagination: VehiclePagination;
}

