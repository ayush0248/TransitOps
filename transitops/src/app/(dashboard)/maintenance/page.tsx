"use client";

import React, { useState } from "react";
import { Wrench, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMaintenance } from "@/hooks/useMaintenance";
import { MaintenanceTable } from "@/components/maintenance/MaintenanceTable";
import { CreateMaintenanceModal } from "@/components/maintenance/CreateMaintenanceModal";

export default function MaintenancePage() {
  const { user } = useAuth();
  const { data: tickets = [], isLoading } = useMaintenance();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Driver & Operations Scope — Breakdown & Workshop Requests</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Maintenance Shop Workflow</h1>
          <p className="text-sm text-zinc-400">Track active repair tickets, workshop costs, and vehicle release controls.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Open Maintenance Ticket</span>
        </button>
      </div>

      <MaintenanceTable tickets={tickets} isLoading={isLoading} userRole={user?.role || "driver_user"} />

      <CreateMaintenanceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
