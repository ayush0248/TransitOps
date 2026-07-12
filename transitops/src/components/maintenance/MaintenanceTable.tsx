"use client";

import React, { useState } from "react";
import { MaintenanceLog, useCloseMaintenance } from "@/hooks/useMaintenance";
import { Wrench, Search, CheckCircle2, AlertCircle, Check } from "lucide-react";

interface MaintenanceTableProps {
  tickets: MaintenanceLog[];
  isLoading: boolean;
  userRole?: string;
}

export function MaintenanceTable({ tickets, isLoading, userRole = "driver_user" }: MaintenanceTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const closeMutation = useCloseMaintenance();

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.vehicle?.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search reg no or issue notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 w-full sm:w-auto font-mono uppercase text-xs"
        >
          <option value="all">All Ticket Statuses</option>
          <option value="active">Active (In Shop)</option>
          <option value="closed">Closed (Released)</option>
        </select>
      </div>

      <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Started / Opened</th>
                <th className="py-3.5 px-4 font-semibold">Vehicle Asset</th>
                <th className="py-3.5 px-4 font-semibold">Reported Issue / Work Order</th>
                <th className="py-3.5 px-4 font-semibold">Estimated Cost</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      <span>Loading maintenance tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Wrench className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-50" />
                    <p className="font-semibold text-zinc-400">No maintenance tickets found</p>
                    <p className="text-xs text-zinc-600 mt-1">Breakdown and workshop repair requests appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                      {new Date(ticket.startedAt || ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono">{ticket.vehicle?.registrationNumber || ticket.vehicleId}</div>
                      <div className="text-xs text-zinc-400">{ticket.vehicle?.name || "Asset"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 max-w-xs truncate">
                      {ticket.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                      ${Number(ticket.cost).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {ticket.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
                          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ticket.status === "active" && (userRole === "fleet_manager" || userRole === "driver_user") ? (
                        <button
                          onClick={() => closeMutation.mutate(ticket.id)}
                          disabled={closeMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono transition flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Release Asset</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-zinc-500">—</span>
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
