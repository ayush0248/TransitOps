"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTrip, useDispatchTrip } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import { useAuth } from "@/providers/AuthProvider";
import { X, Loader2, Truck, AlertCircle, ShieldCheck, Scale, MapPin } from "lucide-react";

const createTripFormSchema = z.object({
  source: z.string().min(2, "Source location is required"),
  destination: z.string().min(2, "Destination location is required"),
  cargoWeight: z.coerce.number().positive("Cargo weight must be greater than 0 kg"),
  plannedDistance: z.coerce.number().positive("Planned distance must be positive"),
  vehicleId: z.string().min(1, "Please select an available vehicle"),
  driverId: z.string().min(1, "Please select an available driver"),
});

type CreateTripFormInput = z.infer<typeof createTripFormSchema>;

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTripModal({ isOpen, onClose }: CreateTripModalProps) {
  const { user } = useAuth();
  const createMutation = useCreateTrip();
  const dispatchMutation = useDispatchTrip();
  const [shouldDispatchImmediately, setShouldDispatchImmediately] = useState<boolean>(false);

  const { data: vehiclesData, vehicles: availableVehiclesList = [], isLoading: loadingVehicles } = useVehicles({ status: "available" });
  const availableVehicles = Array.isArray(availableVehiclesList) && availableVehiclesList.length > 0
    ? availableVehiclesList
    : (Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData?.vehicles ?? []));

  const { data: availableDrivers = [], isLoading: loadingDrivers } = useDrivers({ status: "available" });

  const now = new Date();
  const validDrivers = availableDrivers.filter((d) => new Date(d.licenseExpiryDate) > now);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTripFormInput>({
    resolver: zodResolver(createTripFormSchema) as any,
    defaultValues: {
      source: "",
      destination: "",
      cargoWeight: 500,
      plannedDistance: 150,
      vehicleId: "",
      driverId: "",
    },
  });

  const selectedVehicleId = watch("vehicleId");
  const enteredCargoWeight = watch("cargoWeight") || 0;

  const selectedVehicle = availableVehicles.find((v) => v.id === selectedVehicleId);
  const isWeightOverload = selectedVehicle ? enteredCargoWeight > selectedVehicle.maxLoadCapacity : false;

  if (!isOpen) return null;

  const onSubmit = async (data: CreateTripFormInput) => {
    if (isWeightOverload) return;

    try {
      const createdTrip = await createMutation.mutateAsync({
        source: data.source,
        destination: data.destination,
        cargoWeight: Number(data.cargoWeight),
        plannedDistance: Number(data.plannedDistance),
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        createdById: user?.id || "system-dispatcher",
        status: "draft",
      });

      if (shouldDispatchImmediately && createdTrip?.id) {
        await dispatchMutation.mutateAsync(createdTrip.id);
      }

      reset();
      onClose();
    } catch (e) {
      // Error is displayed by toast in hook mutation
    }
  };

  const isPending = createMutation.isPending || dispatchMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-serif">
                Dispatch Command: Create New Trip
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Assign available fleet asset and driver with real-time capacity audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Source */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Source Location *</span>
              </label>
              <input
                {...register("source")}
                type="text"
                placeholder="e.g. Mumbai Port Terminal"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {errors.source && <p className="text-xs text-red-400">{errors.source.message}</p>}
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Destination Location *</span>
              </label>
              <input
                {...register("destination")}
                type="text"
                placeholder="e.g. Pune Hub Warehouse"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {errors.destination && <p className="text-xs text-red-400">{errors.destination.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cargo Weight */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
                <span>Cargo Weight (kg) *</span>
                <Scale className="w-3.5 h-3.5 text-amber-500" />
              </label>
              <input
                {...register("cargoWeight")}
                type="number"
                step="any"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              {errors.cargoWeight && <p className="text-xs text-red-400">{errors.cargoWeight.message}</p>}
            </div>

            {/* Planned Distance */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Planned Distance (km) *
              </label>
              <input
                {...register("plannedDistance")}
                type="number"
                step="any"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              {errors.plannedDistance && <p className="text-xs text-red-400">{errors.plannedDistance.message}</p>}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
              <span>Select Available Vehicle *</span>
              {loadingVehicles && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
            </label>
            <select
              {...register("vehicleId")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            >
              <option value="">-- Choose Available Vehicle (`GET /api/vehicles?status=available`) --</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  [{v.registrationNumber}] {v.name} ({v.type}) | Max Capacity: {v.maxLoadCapacity} kg
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-xs text-red-400">{errors.vehicleId.message}</p>}

            {/* Capacity Overload Warning */}
            {selectedVehicle && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono transition flex items-center justify-between ${
                  isWeightOverload
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isWeightOverload ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {isWeightOverload
                      ? `OVERLOAD REJECTED! Entered ${enteredCargoWeight} kg exceeds ${selectedVehicle.registrationNumber} max capacity of ${selectedVehicle.maxLoadCapacity} kg.`
                      : `Load Verified: ${enteredCargoWeight} kg / ${selectedVehicle.maxLoadCapacity} kg max capacity.`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Driver Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
              <span>Select Available & Compliant Driver *</span>
              {loadingDrivers && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
            </label>
            <select
              {...register("driverId")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            >
              <option value="">-- Choose Valid Driver (`status=available` & license not expired) --</option>
              {validDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.licenseCategory}) | Exp: {new Date(d.licenseExpiryDate).toISOString().split("T")[0]} | Score: {d.safetyScore}
                </option>
              ))}
            </select>
            {errors.driverId && <p className="text-xs text-red-400">{errors.driverId.message}</p>}
          </div>

          {/* Immediate Dispatch Toggle option */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span>Dispatch Immediately upon Creation?</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                If checked, executes atomic transaction (`POST /api/trips/:id/dispatch`) immediately.
              </p>
            </div>
            <input
              type="checkbox"
              checked={shouldDispatchImmediately}
              onChange={(e) => setShouldDispatchImmediately(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-900 cursor-pointer"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isWeightOverload}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold transition shadow-lg shadow-amber-600/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{shouldDispatchImmediately ? "Create & Dispatch Trip" : "Save as Draft"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
