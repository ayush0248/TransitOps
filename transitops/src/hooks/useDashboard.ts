"use client";

import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  inShopVehicles: number;
  fleetUtilization: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  totalDrivers: number;
}

export interface VehicleStatusCounts {
  available: number;
  on_trip: number;
  in_shop: number;
  retired: number;
}

export interface RecentTrip {
  id: string;
  source: string;
  destination: string;
  status: string;
  createdAt: string;
  dispatchedAt: string | null;
  completedAt: string | null;
  vehicle: { registrationNumber: string };
  driver: { name: string };
}

export interface DashboardData {
  stats: DashboardStats;
  vehicleStatusCounts: VehicleStatusCounts;
  recentTrips: RecentTrip[];
}

export interface DashboardFilters {
  type?: string;
  status?: string;
  region?: string;
}

export function useDashboard(filters: DashboardFilters = {}) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== "all") params.append("type", filters.type);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.region && filters.region !== "all") params.append("region", filters.region);
      
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/dashboard${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching dashboard.");
      return json.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
