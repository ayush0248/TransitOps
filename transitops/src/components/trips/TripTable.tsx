"use client";

import React, { useState } from "react";
import { Trip, useCancelTrip, useDeleteTrip } from "@/hooks/useTrips";
import { useAuth } from "@/hooks/useAuth";
import { DispatchConfirmModal, CompleteTripModal } from "@/components/trips/TripActionModals";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Play,
  Check,
  Ban,
  Trash2,
  Navigation,
  Scale,
  User,
  AlertTriangle,
} from "lucide-react";

interface TripTableProps {
  trips: Trip[];
  isLoading: boolean;
}

export function TripTable({ trips, isLoading }: TripTableProps) {
  const { user } = useAuth();
  const canManageTrips = user?.role === "driver_user" || user?.role === "fleet_manager";

  const cancelMutation = useCancelTrip();
  const deleteMutation = useDeleteTrip();

  const [tripToDispatch, setTripToDispatch] = useState<Trip | null>(null);
  const [tripToComplete, setTripToComplete] = useState<Trip | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-zinc-400 font-mono">Loading active dispatch board and trip states...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Truck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Trips Dispatched or Drafted</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Create a new trip draft above to assign available vehicles and drivers for route dispatch.
        </p>
      </div>
    );
  }

  const handleCancel = async (id: string) => {
    if (confirm("Cancel this trip? If currently dispatched, assigned vehicle and driver will be unlocked back to available.")) {
      setActionInProgressId(id);
      try {
        await cancelMutation.mutateAsync(id);
      } finally {
        setActionInProgressId(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this trip record? Only drafts and cancelled trips can be removed.")) {
      setActionInProgressId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setActionInProgressId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Draft (Pre-Dispatch)
          </span>
        );
      case "dispatched":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono">
            <Navigation className="w-3.5 h-3.5 animate-pulse" />
            Dispatched (En Route)
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/30 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/90 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-4 px-6">Route & Distance</th>
                <th className="py-4 px-6">Assigned Fleet Asset</th>
                <th className="py-4 px-6">Assigned Driver</th>
                <th className="py-4 px-6">Cargo Load Audit</th>
                <th className="py-4 px-6">Lifecycle State</th>
                <th className="py-4 px-6 text-right">State Transitions & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {trips.map((trip) => {
                const vehicle = trip.vehicle;
                const driver = trip.driver;
                const maxCap = vehicle ? vehicle.maxLoadCapacity : 0;
                const weightRatio = maxCap > 0 ? Math.round((Number(trip.cargoWeight) / maxCap) * 100) : 0;

                return (
                  <tr key={trip.id} className="hover:bg-zinc-800/40 transition group">
                    {/* Route & Distance */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-white flex items-center gap-2 group-hover:text-amber-400 transition">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{trip.source} → {trip.destination}</span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 font-mono flex items-center gap-3">
                        <span>Plan: {trip.plannedDistance} km</span>
                        {trip.actualDistance && (
                          <span className="text-emerald-400">Actual: {trip.actualDistance} km</span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Vehicle */}
                    <td className="py-4 px-6 font-mono">
                      {vehicle ? (
                        <div>
                          <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-blue-400" />
                            <span>[{vehicle.registrationNumber}]</span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {vehicle.name} ({vehicle.type})
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">ID: {trip.vehicleId}</span>
                      )}
                    </td>

                    {/* Assigned Driver */}
                    <td className="py-4 px-6 font-mono">
                      {driver ? (
                        <div>
                          <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-emerald-400" />
                            <span>{driver.name}</span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {driver.licenseCategory}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">ID: {trip.driverId}</span>
                      )}
                    </td>

                    {/* Cargo Load Audit */}
                    <td className="py-4 px-6 font-mono">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{trip.cargoWeight} kg</span>
                        <span className="text-[10px] text-zinc-500">Max {maxCap} kg</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className={`h-full ${
                            weightRatio > 100
                              ? "bg-red-500"
                              : weightRatio >= 85
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, weightRatio)}%` }}
                        />
                      </div>
                      {weightRatio > 100 && (
                        <span className="text-[10px] text-red-400 font-bold">OVERLOAD RISK</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(trip.status)}</td>

                    {/* Actions / State Machine Buttons */}
                    <td className="py-4 px-6 text-right">
                      {canManageTrips ? (
                        <div className="flex items-center justify-end gap-2">
                          {trip.status === "draft" && (
                            <>
                              {/* Dispatch Action */}
                              <button
                                onClick={() => setTripToDispatch(trip)}
                                disabled={actionInProgressId === trip.id}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs font-mono transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Dispatch</span>
                              </button>

                              {/* Cancel Draft */}
                              <button
                                onClick={() => handleCancel(trip.id)}
                                disabled={actionInProgressId === trip.id}
                                title="Cancel Draft"
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                              >
                                <Ban className="w-4 h-4" />
                              </button>

                              {/* Delete Draft */}
                              <button
                                onClick={() => handleDelete(trip.id)}
                                disabled={actionInProgressId === trip.id}
                                title="Delete Draft"
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {trip.status === "dispatched" && (
                            <>
                              {/* Complete Action */}
                              <button
                                onClick={() => setTripToComplete(trip)}
                                disabled={actionInProgressId === trip.id}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs font-mono transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Complete Trip</span>
                              </button>

                              {/* Emergency Abort/Cancel */}
                              <button
                                onClick={() => handleCancel(trip.id)}
                                disabled={actionInProgressId === trip.id}
                                title="Emergency Abort & Unlock Assets"
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {(trip.status === "completed" || trip.status === "cancelled") && (
                            <span className="text-xs text-zinc-500 font-mono italic">
                              {trip.status === "completed" ? "Telemetry Logged" : "Trip Aborted"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-800">
                          Audit Only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Transition Modals */}
      <DispatchConfirmModal
        isOpen={!!tripToDispatch}
        onClose={() => setTripToDispatch(null)}
        trip={tripToDispatch}
      />

      <CompleteTripModal
        isOpen={!!tripToComplete}
        onClose={() => setTripToComplete(null)}
        trip={tripToComplete}
      />
    </div>
  );
}
