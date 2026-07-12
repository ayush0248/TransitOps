"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Vehicle } from "./useTrips";

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  description: string;
  cost: number;
  status: "active" | "closed";
  startedAt: string;
  closedAt?: string | null;
  createdAt: string;
}

export function useMaintenance() {
  return useQuery<MaintenanceLog[]>({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const res = await fetch("/api/maintenance");
      if (!res.ok) throw new Error("Failed to fetch maintenance tickets.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching maintenance tickets.");
      return json.data || [];
    },
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { vehicleId: string; description: string; cost: number; status?: string }) => {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to open maintenance ticket.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Maintenance ticket opened! Vehicle moved In Shop.");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not open maintenance ticket.");
    },
  });
}

export function useCloseMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/maintenance/${id}/close`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to close ticket.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Ticket closed. Vehicle restored to Available!");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not close ticket.");
    },
  });
}
