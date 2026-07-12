"use client";

import React from "react";
import { Car, Plus } from "lucide-react";

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Vehicle Fleet Management</h1>
          <p className="text-sm text-zinc-400">Manage all transport vehicles, registration numbers, load capacities, and status.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20">
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Car className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Vehicle Module Ready</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          This module supports status constraints (`Available`, `On Trip`, `In Shop`, `Retired`), load capacity checks, and acquisition costs.
        </p>
      </div>
    </div>
  );
}
