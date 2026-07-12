"use client";

import React, { useState } from "react";
import { Car, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useVehicles";
import { VehicleTable } from "@/components/vehicles/VehicleTable";
import { CreateVehicleModal } from "@/components/vehicles/CreateVehicleModal";

export default function VehiclesPage() {
  const { user } = useAuth();
  const { data: vehicles = [], isLoading } = useVehicles();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isManager = user?.role === "fleet_manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {isManager ? (
            <h1 className="text-2xl font-extrabold text-white font-serif">Vehicle Fleet Management</h1>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Driver & Operations Scope — Vehicle Roster</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white font-serif">Fleet Vehicles Directory</h1>
            </div>
          )}
          <p className="text-sm text-zinc-400">Manage all transport vehicles, registration numbers, load capacities, and status.</p>
        </div>
        {isManager && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vehicle</span>
          </button>
        )}
      </div>

      <VehicleTable vehicles={vehicles} isLoading={isLoading} userRole={user?.role || "driver_user"} />

      <CreateVehicleModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
