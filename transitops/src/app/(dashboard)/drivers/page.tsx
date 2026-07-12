"use client";

import React from "react";
import { Users, Plus } from "lucide-react";

export default function DriversPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Driver & Compliance Roster</h1>
          <p className="text-sm text-zinc-400">Track driver licenses, categories, safety scores, and operational availability.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20">
          <Plus className="w-4 h-4" />
          <span>Register Driver</span>
        </button>
      </div>

      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Driver Module Ready</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Enforces license expiry checks, safety scores (`0-100`), and dispatch block rules for `Suspended` or `Off Duty` personnel.
        </p>
      </div>
    </div>
  );
}
