"use client";

import React, { useState } from "react";
import { useDrivers, Driver } from "@/hooks/useDrivers";
import { useAuth } from "@/hooks/useAuth";
import { SafetyScoreCard } from "@/components/drivers/SafetyScoreCard";
import { DriverTable } from "@/components/drivers/DriverTable";
import { DriverFormModal } from "@/components/drivers/DriverFormModal";
import { Users, Plus, Search, Filter, RefreshCw, ShieldCheck, UserCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function DriversPage() {
  const { user } = useAuth();
  const isSafetyOfficerOrManager = user?.role === "safety_officer" || user?.role === "fleet_manager";

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);

  const { data: drivers = [], isLoading, refetch, isRefetching } = useDrivers({
    status: statusFilter,
    search: searchQuery,
  });

  // Also fetch all drivers without filter for the KPI score cards
  const { data: allDrivers = [] } = useDrivers();

  const handleOpenRegister = () => {
    setDriverToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setDriverToEdit(driver);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setDriverToEdit(null);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {isSafetyOfficerOrManager ? (
            <>
              <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Safety Officer & Compliance Scope</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
                Driver & Compliance Roster
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Manage driver profiles, monitor license expiry dates, enforce safety scores (`0-100`), and manage suspensions.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase font-bold mb-1">
                <UserCheck className="w-4 h-4" />
                <span>Driver Operations — Directory & Compliance Scope</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
                Fleet Driver Roster
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                View active driver profiles, license credentials (`LMV`/`HMV`), and current safety ratings across the network.
              </p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh Roster"
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          </button>
          {isSafetyOfficerOrManager && (
            <>
              <Link
                href="/safety"
                className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition flex items-center gap-2 border border-zinc-700/80 shadow font-mono"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Safety Audit Center</span>
              </Link>
              <button
                onClick={handleOpenRegister}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/25 transform active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Register New Driver</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards Header */}
      <SafetyScoreCard drivers={allDrivers} />

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drivers by name, license number, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400 px-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {[
            { id: "all", label: "All Drivers" },
            { id: "available", label: "Available" },
            { id: "on_trip", label: "On Trip" },
            { id: "off_duty", label: "Off Duty" },
            { id: "suspended", label: "Suspended" },
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

      {/* Driver Data Table */}
      <DriverTable drivers={drivers} isLoading={isLoading} onEdit={handleOpenEdit} />

      {/* Register/Edit Driver Modal */}
      <DriverFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        driverToEdit={driverToEdit}
      />
    </div>
  );
}
