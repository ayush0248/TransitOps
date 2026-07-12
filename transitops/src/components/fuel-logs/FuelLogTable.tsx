"use client";

import React, { useState } from "react";
import { FuelLog } from "@/hooks/useFuelLogs";
import { Fuel, Search, Calendar, DollarSign, Droplets } from "lucide-react";

interface FuelLogTableProps {
  logs: FuelLog[];
  isLoading: boolean;
}

export function FuelLogTable({ logs, isLoading }: FuelLogTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) =>
    log.vehicle?.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.vehicle?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by vehicle reg no or make..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>
      </div>

      <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Date Logged</th>
                <th className="py-3.5 px-4 font-semibold">Vehicle Asset</th>
                <th className="py-3.5 px-4 font-semibold">Liters Refilled</th>
                <th className="py-3.5 px-4 font-semibold">Total Cost (USD / INR)</th>
                <th className="py-3.5 px-4 font-semibold">Cost per Liter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      <span>Loading fuel records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Fuel className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-50" />
                    <p className="font-semibold text-zinc-400">No fuel records logged yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Refuel entries recorded by drivers or dispatchers appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const liters = Number(log.liters);
                  const cost = Number(log.cost);
                  const costPerLiter = liters > 0 ? (cost / liters).toFixed(2) : "0.00";

                  return (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition">
                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                        {new Date(log.date || log.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white font-mono">{log.vehicle?.registrationNumber || log.vehicleId}</div>
                        <div className="text-xs text-zinc-400">{log.vehicle?.name || "Asset"}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                        {liters.toLocaleString()} L
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                        ${cost.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                        ${costPerLiter} / L
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
