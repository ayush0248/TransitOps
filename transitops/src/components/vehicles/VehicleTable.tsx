"use client";

import React, { useState } from "react";
import { Vehicle } from "@/hooks/useTrips";
import { Car, Search, ShieldAlert, Wrench, CheckCircle2, Truck, Eye } from "lucide-react";

interface VehicleTableProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  userRole?: string;
}

export function VehicleTable({ vehicles, isLoading, userRole = "driver_user" }: VehicleTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Vehicle["status"]) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Available
          </span>
        );
      case "on_trip":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            On Trip
          </span>
        );
      case "in_shop":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
            <Wrench className="w-3.5 h-3.5" />
            In Shop
          </span>
        );
      case "retired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/30 text-zinc-400 text-xs font-bold font-mono">
            Retired
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search reg no, name, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 w-full sm:w-auto font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Registration / Asset</th>
                <th className="py-3.5 px-4 font-semibold">Type / Category</th>
                <th className="py-3.5 px-4 font-semibold">Max Capacity</th>
                <th className="py-3.5 px-4 font-semibold">Odometer</th>
                <th className="py-3.5 px-4 font-semibold">Operational Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Access Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      <span>Loading fleet roster...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Car className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-50" />
                    <p className="font-semibold text-zinc-400">No matching vehicles found</p>
                    <p className="text-xs text-zinc-600 mt-1">Try adjusting your search terms or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-zinc-800/30 transition group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-amber-400 font-mono font-bold text-xs shrink-0">
                          {vehicle.type === "HMV" || vehicle.type.toLowerCase().includes("heavy") ? "HMV" : "LMV"}
                        </div>
                        <div>
                          <p className="font-bold text-white font-mono tracking-tight">{vehicle.registrationNumber}</p>
                          <p className="text-xs text-zinc-400">{vehicle.name} {vehicle.model ? `(${vehicle.model})` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono">
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {Number(vehicle.maxLoadCapacity).toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">
                      {Number(vehicle.odometer).toLocaleString()} km
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {userRole === "fleet_manager" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                          Manage Asset
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2 py-1 rounded">
                          <Eye className="w-3 h-3 text-cyan-400" />
                          View / Dispatch Only
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
