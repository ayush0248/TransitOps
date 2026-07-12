"use client";

import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "./useTrips";

export function useVehicles(filters?: { status?: string; search?: string }) {
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch vehicles.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching vehicles.");

      let vehicles: Vehicle[] = json.data || [];
      if (filters?.status && filters.status !== "all") {
        vehicles = vehicles.filter((v) => v.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        vehicles = vehicles.filter(
          (v) =>
            v.registrationNumber.toLowerCase().includes(q) ||
            v.name.toLowerCase().includes(q) ||
            v.type.toLowerCase().includes(q)
        );
      }
      return vehicles;
    },
  });
}
