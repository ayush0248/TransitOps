"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Vehicle } from "./useTrips";

export interface Expense {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  type: "maintenance" | "toll" | "insurance" | "repair" | "other";
  amount: number;
  description?: string | null;
  date: string;
  createdAt: string;
}

export function useExpenses() {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("/api/expenses");
      if (!res.ok) throw new Error("Failed to fetch expenses.");
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Error fetching expenses.");
      return json.data || [];
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { vehicleId: string; type: string; amount: number; description?: string }) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to record expense.");
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success("Expense recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not record expense.");
    },
  });
}
