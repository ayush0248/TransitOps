"use client";

import React, { useState } from "react";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/hooks/useAuth";
import { TripTable } from "@/components/trips/TripTable";
import { CreateTripModal } from "@/components/trips/CreateTripModal";
import { Truck, Plus, Search, Filter, RefreshCw, Navigation, Clock, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";

export default function TripsPage() {
  const { user } = useAuth();
  const canCreateOrDispatch = user?.role === "driver_user" || user?.role === "fleet_manager";

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: trips = [], isLoading, refetch, isRefetching } = useTrips({
    status: statusFilter,
    search: searchQuery,
  });

  const { data: allTrips = [] } = useTrips();

  const draftCount = allTrips.filter((t: { status: string; }) => t.status === "draft").length;
  const dispatchedCount = allTrips.filter((t: { status: string; }) => t.status === "dispatched").length;
  const completedCount = allTrips.filter((t: { status: string; }) => t.status === "completed").length;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {user?.role === "driver_user" ? (
            <>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase font-bold mb-1">
                <Navigation className="w-4 h-4 animate-pulse" />
                <span>Driver & Dispatch Operations Scope</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
                Active Trip & Dispatch Board
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Initiate routes, execute pre-flight safety audits, and complete active driver trips with fuel/odometer telemetry.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase font-bold mb-1">
                <Navigation className="w-4 h-4 animate-pulse" />
                <span>Dispatcher & Fleet Operations Scope</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
                Trip Dispatch & State Machine
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Manage trip lifecycles (`Draft → Dispatched → Completed / Cancelled`) with automated capacity & license checks.
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh Board"
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          </button>
          {canCreateOrDispatch && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/25 transform active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Trip</span>
            </button>
          )}
        </div>
      </div>

      {/* Dispatch Board Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono">
        {/* Drafts Ready */}
        <div
          onClick={() => setStatusFilter("draft")}
          className={`p-6 rounded-2xl border transition cursor-pointer ${
            statusFilter === "draft"
              ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
              : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-bold">
            <span>Drafts (Pre-Dispatch)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-4xl font-black text-white mt-2">{draftCount}</div>
          <p className="text-xs text-zinc-400 mt-1">Ready for pre-flight check & asset allocation</p>
        </div>

        {/* Active Dispatched */}
        <div
          onClick={() => setStatusFilter("dispatched")}
          className={`p-6 rounded-2xl border transition cursor-pointer ${
            statusFilter === "dispatched"
              ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10"
              : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-bold">
            <span>Active Dispatched</span>
            <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div className="text-4xl font-black text-white mt-2">{dispatchedCount}</div>
          <p className="text-xs text-blue-300/80 mt-1">Vehicles & Drivers currently locked On Trip</p>
        </div>

        {/* Completed */}
        <div
          onClick={() => setStatusFilter("completed")}
          className={`p-6 rounded-2xl border transition cursor-pointer ${
            statusFilter === "completed"
              ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
              : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs uppercase font-bold">
            <span>Completed Trips</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-black text-white mt-2">{completedCount}</div>
          <p className="text-xs text-zinc-400 mt-1">Telemetry & odometer returns logged</p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips by route, vehicle, or driver name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400 px-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>State:</span>
          </div>
          {[
            { id: "all", label: "All Trips" },
            { id: "draft", label: "Drafts" },
            { id: "dispatched", label: "Dispatched" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                statusFilter === filter.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 border border-transparent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Table */}
      <TripTable trips={trips} isLoading={isLoading} />

      {/* Create Trip Modal */}
      <CreateTripModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
