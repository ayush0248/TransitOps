"use client";

import React, { useState } from "react";
import { Fuel, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFuelLogs } from "@/hooks/useFuelLogs";
import { FuelLogTable } from "@/components/fuel-logs/FuelLogTable";
import { CreateFuelLogModal } from "@/components/fuel-logs/CreateFuelLogModal";

export default function FuelLogsPage() {
  const { user } = useAuth();
  const { data: logs = [], isLoading } = useFuelLogs();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Driver & Operations Scope — En-Route Refueling</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Fuel Consumption Logs</h1>
          <p className="text-sm text-zinc-400">Record fuel liters, total costs, and monitor efficiency across active trips.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Log Fuel Refill</span>
        </button>
      </div>

      <FuelLogTable logs={logs} isLoading={isLoading} />

      <CreateFuelLogModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
