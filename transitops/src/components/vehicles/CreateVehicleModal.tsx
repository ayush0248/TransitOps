"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Car, X } from "lucide-react";

interface CreateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateVehicleModal({ isOpen, onClose }: CreateVehicleModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    registrationNumber: "",
    name: "",
    model: "",
    type: "HMV",
    maxLoadCapacity: "",
    acquisitionCost: "",
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to register vehicle.");
      }
      return json.data;
    },
    onSuccess: (newVeh) => {
      toast.success(`Vehicle registered (${newVeh.registrationNumber}) successfully!`);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      onClose();
      setFormData({
        registrationNumber: "",
        name: "",
        model: "",
        type: "HMV",
        maxLoadCapacity: "",
        acquisitionCost: "",
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Could not register vehicle.");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber || !formData.name || !formData.maxLoadCapacity || !formData.acquisitionCost) {
      toast.error("Please fill in all required fields.");
      return;
    }

    createMutation.mutate({
      registrationNumber: formData.registrationNumber.toUpperCase(),
      name: formData.name,
      model: formData.model || undefined,
      type: formData.type,
      maxLoadCapacity: Number(formData.maxLoadCapacity),
      acquisitionCost: Number(formData.acquisitionCost),
      status: "available",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-serif">Register Fleet Vehicle</h3>
              <p className="text-xs text-zinc-400 font-mono">Add new asset to active operational roster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
              Registration Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. DL-01-AB-1234"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
                Vehicle Make / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Tata Prima"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
                Model / Year
              </label>
              <input
                type="text"
                placeholder="e.g. 5530.S 2024"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
                License Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                <option value="LMV">LMV (Light Motor Vehicle)</option>
                <option value="Tanker">Tanker / Hazardous</option>
                <option value="Refrigerated">Refrigerated Container</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
                Max Load Capacity (kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={formData.maxLoadCapacity}
                onChange={(e) => setFormData({ ...formData, maxLoadCapacity: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 font-semibold">
              Acquisition Cost (USD / INR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 85000"
              value={formData.acquisitionCost}
              onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
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
              {createMutation.isPending ? "Registering Asset..." : "Register Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
