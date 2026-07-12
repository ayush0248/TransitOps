"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber?: string | null;
  safetyScore: number;
  status: "available" | "on_trip" | "off_duty" | "suspended";
  createdAt: string;
  updatedAt: string;
  trips?: any[];
}

export interface CreateDriverPayload {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber?: string;
  safetyScore?: number;
  status?: "available" | "on_trip" | "off_duty" | "suspended";
  loginEmail?: string;
  loginPassword?: string;
}

export interface UpdateDriverPayload {
  id: string;
  data: Partial<CreateDriverPayload>;
}

export function useDrivers(filters?: { status?: string; search?: string }) {
  return useQuery<Driver[]>({
    queryKey: ["drivers", filters],
    queryFn: async () => {
      const res = await fetch("/api/drivers");
      if (!res.ok) throw new Error("Failed to fetch drivers list.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching drivers.");
      
      let drivers: Driver[] = json.data || [];
      if (filters?.status && filters.status !== "all") {
        drivers = drivers.filter((d) => d.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        drivers = drivers.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.licenseNumber.toLowerCase().includes(q) ||
            d.licenseCategory.toLowerCase().includes(q)
        );
      }
      return drivers;
    },
  });
}

export function useDriver(id?: string) {
  return useQuery<Driver>({
    queryKey: ["drivers", id],
    queryFn: async () => {
      if (!id) throw new Error("Driver ID missing");
      const res = await fetch(`/api/drivers/${id}`);
      if (!res.ok) throw new Error("Failed to fetch driver details.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching driver.");
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDriverPayload) => {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to register driver.");
      }
      return json.data;
    },
    onSuccess: (newDriver) => {
      toast.success(`Driver ${newDriver.name} registered successfully!`);
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not create driver.");
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateDriverPayload) => {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update driver.");
      }
      return json.data;
    },
    onSuccess: (updated) => {
      toast.success(`Driver ${updated.name} updated.`);
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", updated.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not update driver.");
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete driver.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Driver profile deleted.");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not delete driver.");
    },
  });
}
