"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Driver } from "./useDrivers";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  model?: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  status: "available" | "on_trip" | "in_shop" | "retired";
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  actualDistance?: number | null;
  fuelConsumed?: number | null;
  status: "draft" | "dispatched" | "completed" | "cancelled";
  dispatchedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  vehicleId: string;
  vehicle?: Vehicle;
  driverId: string;
  driver?: Driver;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripPayload {
  vehicleId: string;
  driverId: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  createdById: string;
  status?: "draft" | "dispatched";
}

export interface CompleteTripPayload {
  id: string;
  actualDistance?: number;
  fuelConsumed?: number;
  fuelCost?: number;
}

export function useTrips(filters?: { status?: string; search?: string }) {
  return useQuery<Trip[]>({
    queryKey: ["trips", filters],
    queryFn: async () => {
      const res = await fetch("/api/trips");
      if (!res.ok) throw new Error("Failed to fetch trips list.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching trips.");

      let trips: Trip[] = json.data || [];
      if (filters?.status && filters.status !== "all") {
        trips = trips.filter((t) => t.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        trips = trips.filter(
          (t) =>
            t.source.toLowerCase().includes(q) ||
            t.destination.toLowerCase().includes(q) ||
            t.vehicle?.registrationNumber.toLowerCase().includes(q) ||
            t.driver?.name.toLowerCase().includes(q)
        );
      }
      return trips;
    },
  });
}

export function useTrip(id?: string) {
  return useQuery<Trip>({
    queryKey: ["trips", id],
    queryFn: async () => {
      if (!id) throw new Error("Trip ID missing");
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) throw new Error("Failed to fetch trip details.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching trip.");
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTripPayload) => {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create trip draft.");
      }
      return json.data;
    },
    onSuccess: (newTrip) => {
      toast.success(`Trip draft (${newTrip.source} -> ${newTrip.destination}) created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not create trip.");
    },
  });
}

export function useDispatchTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trips/${id}/dispatch`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Dispatch validation failed.");
      }
      return json.data;
    },
    onSuccess: (trip) => {
      toast.success(`Trip dispatched! Vehicle & Driver locked On Trip.`);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Dispatch failed.");
    },
  });
}

export function useCompleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, actualDistance, fuelConsumed, fuelCost }: CompleteTripPayload) => {
      const res = await fetch(`/api/trips/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualDistance, fuelConsumed, fuelCost }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to complete trip.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Trip completed! Assets restored & odometer updated.");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not complete trip.");
    },
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trips/${id}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to cancel trip.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Trip cancelled. Assigned assets unlocked.");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not cancel trip.");
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trips/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete trip.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Trip record deleted.");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not delete trip.");
    },
  });
}
