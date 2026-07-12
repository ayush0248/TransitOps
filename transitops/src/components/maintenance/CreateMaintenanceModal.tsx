"use client";

import React, { useState } from "react";
import { useCreateMaintenance } from "@/hooks/useMaintenance";
import { useVehicles } from "@/hooks/useVehicles";
import { Wrench, X } from "lucide-react";
import { toast } from "sonner";

interface CreateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMaintenanceModal({ isOpen, onClose }: CreateMaintenanceModalProps) {
  const { data: vehiclesData, vehicles: vehiclesList = [] } = useVehicles();
  const vehicles = Array.isArray(vehiclesList) && vehiclesList.length > 0
    ? vehiclesList
    : (Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.vehicles ?? []));

  const createMutation = useCreateMaintenance();

  const [vehicleId, setVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !description || !cost) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createMutation.mutate(
      {
        vehicleId,
        description,
        cost: Number(cost),
        status: "active",
      },
      {
        onSuccess: () => {
          onClose();
          setVehicleId("");
          setDescription("");
          setCost("");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-serif">Open Maintenance Ticket</h3>
              <p className="text-xs text-zinc-400 font-mono">Move asset In Shop & record breakdown work order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
              Select Fleet Vehicle <span className="text-rose-500">*</span>
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              required
            >
              <option value="">-- Choose Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} ({v.name} - {v.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
              Reported Issue / Work Order Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Engine coolant overheating check and brake pad replacement"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
              Estimated Workshop Cost (USD / INR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 350.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 disabled:opacity-50 transition"
            >
              {createMutation.isPending ? "Opening Ticket..." : "Open Ticket & Move In Shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
