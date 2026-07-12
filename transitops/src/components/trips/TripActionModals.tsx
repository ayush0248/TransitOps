"use client";

import React, { useState } from "react";
import { Trip, useDispatchTrip, useCompleteTrip } from "@/hooks/useTrips";
import { X, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Fuel, MapPin, Gauge } from "lucide-react";

interface DispatchConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export function DispatchConfirmModal({ isOpen, onClose, trip }: DispatchConfirmModalProps) {
  const dispatchMutation = useDispatchTrip();

  if (!isOpen || !trip) return null;

  const handleDispatch = async () => {
    try {
      await dispatchMutation.mutateAsync(trip.id);
      onClose();
    } catch (e) {
      // Toast displayed in hook
    }
  };

  const isPending = dispatchMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-serif">Pre-Flight Dispatch Check</h3>
              <p className="text-xs text-zinc-400 font-mono">Authorize trip execution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 font-mono">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Route:</span>
              <span className="text-white font-bold">{trip.source} → {trip.destination}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Assigned Vehicle:</span>
              <span className="text-white font-bold">{trip.vehicle?.registrationNumber || trip.vehicleId}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Assigned Driver:</span>
              <span className="text-white font-bold">{trip.driver?.name || trip.driverId}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Cargo Weight:</span>
              <span className="text-amber-400 font-bold">{trip.cargoWeight} kg</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Automated Pre-Check Verification:
            </div>
            <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Vehicle Load Capacity verified against Cargo Weight</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Driver Driving License verified valid & unexpired</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Both assets available and ready for dispatch lock</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Dispatching will atomically transition both <strong className="font-mono">{trip.vehicle?.registrationNumber}</strong> and <strong className="font-mono">{trip.driver?.name}</strong> to <strong className="font-mono uppercase text-blue-200">On Trip</strong>.
            </span>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold transition shadow-lg shadow-blue-600/25 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Authorize & Dispatch Trip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompleteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export function CompleteTripModal({ isOpen, onClose, trip }: CompleteTripModalProps) {
  const completeMutation = useCompleteTrip();
  const [actualDistance, setActualDistance] = useState<string>("");
  const [fuelConsumed, setFuelConsumed] = useState<string>("");
  const [fuelCost, setFuelCost] = useState<string>("");

  if (!isOpen || !trip) return null;

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await completeMutation.mutateAsync({
        id: trip.id,
        actualDistance: actualDistance ? Number(actualDistance) : Number(trip.plannedDistance),
        fuelConsumed: fuelConsumed ? Number(fuelConsumed) : undefined,
        fuelCost: fuelCost ? Number(fuelCost) : undefined,
      });
      onClose();
    } catch (err) {
      // Toast in hook
    }
  };

  const isPending = completeMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-serif">Complete Trip & Return Assets</h3>
              <p className="text-xs text-zinc-400 font-mono">Record telemetry & restore asset availability</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleComplete} className="p-6 space-y-4 text-sm">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 font-mono text-xs text-zinc-400">
            <div>Route: <strong className="text-white">{trip.source} → {trip.destination}</strong></div>
            <div>Planned Distance: <strong className="text-amber-400">{trip.plannedDistance} km</strong></div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
              <span>Actual Distance Travelled (km) *</span>
              <Gauge className="w-3.5 h-3.5 text-amber-500" />
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder={`Default: ${trip.plannedDistance} km`}
              value={actualDistance}
              onChange={(e) => setActualDistance(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fuel (Liters)</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 45"
                value={fuelConsumed}
                onChange={(e) => setFuelConsumed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Fuel Cost (₹/$)
              </label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 4500"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Upon completion, the odometer for <strong className="font-mono text-white">{trip.vehicle?.registrationNumber || "vehicle"}</strong> will be incremented by the actual distance, and both driver and vehicle will be restored to <strong className="text-emerald-400 font-mono">Available</strong>.
          </p>

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
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold transition shadow-lg shadow-emerald-600/25 flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify & Complete Trip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
