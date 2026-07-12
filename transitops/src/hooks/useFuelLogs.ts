"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Vehicle } from "./useTrips";

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  tripId?: string | null;
  liters: number;
  cost: number;
  date: string;
  createdAt: string;
}

export function useFuelLogs() {
  return useQuery<FuelLog[]>({
    queryKey: ["fuel-logs"],
    queryFn: async () => {
      const res = await fetch("/api/fuel-logs");
      if (!res.ok) throw new Error("Failed to fetch fuel logs.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching fuel logs.");
      return json.data || [];
    },
  });
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { vehicleId: string; tripId?: string; liters: number; cost: number }) => {
      const res = await fetch("/api/fuel-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to record fuel log.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Fuel refill log recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["fuel-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not record fuel log.");
    },
  });
}
