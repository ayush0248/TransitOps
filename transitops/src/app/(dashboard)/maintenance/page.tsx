"use client";

import React from "react";
import { Wrench, Plus } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Maintenance Shop Workflow</h1>
          <p className="text-sm text-zinc-400">Track active repair tickets, workshop costs, and vehicle release controls.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20">
          <Plus className="w-4 h-4" />
          <span>Open Maintenance Ticket</span>
        </button>
      </div>

      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Wrench className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Maintenance Module Ready</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Opening a maintenance ticket automatically transitions the vehicle to `In Shop`. Closing transitions it back to `Available`.
        </p>
      </div>
    </div>
  );
}
