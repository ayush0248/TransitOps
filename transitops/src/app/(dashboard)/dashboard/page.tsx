"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { ROLE_LABELS, ROLE_SCOPES } from "@/lib/constants";
import { Car, ShieldCheck, Truck, Users, Wrench, Fuel, Receipt, BarChart3, ShieldAlert, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const roleLabel = user ? ROLE_LABELS[user.role] : "Fleet Manager";
  const roleScope = user ? ROLE_SCOPES[user.role] : "Full access";

  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    region: "all",
  });

  const { data: dashboardData, isLoading } = useDashboard(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "on_trip":
      case "dispatched": return "bg-blue-500";
      case "in_shop": return "bg-orange-500";
      case "completed": return "bg-green-600";
      case "draft": return "bg-slate-500";
      case "retired":
      case "cancelled": return "bg-red-500";
      default: return "bg-zinc-500";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active RBAC Scope: {roleLabel}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-serif">
            Welcome back, {user?.name || "Operations Commander"}
          </h1>
          <p className="text-sm text-zinc-400">
            You are logged into TransitOps. Your operational scope covers: <strong className="text-zinc-200">{roleScope}</strong>. Use the navigation panel below or on the left to manage the live transport lifecycle.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase font-bold pr-4 border-r border-zinc-800 hidden sm:flex">
          <Filter className="w-4 h-4" />
          <span>Global Filters</span>
        </div>
        
        <select 
          value={filters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none"
        >
          <option value="all">All Vehicle Types</option>
          <option value="Van">Van</option>
          <option value="Truck">Truck</option>
          <option value="Mini">Mini</option>
        </select>

        <select 
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none"
        >
          <option value="all">All Vehicle Statuses</option>
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="in_shop">In Shop</option>
          <option value="retired">Retired</option>
        </select>

        <select 
          value={filters.region}
          onChange={(e) => handleFilterChange("region", e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-amber-500 outline-none"
        >
          <option value="all">All Regions</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
        
        {isLoading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin ml-auto" />}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Active Vehicles</span>
            <Car className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {dashboardData?.stats.activeVehicles || 0} / {dashboardData?.stats.totalVehicles || 0}
          </div>
          <p className="text-xs text-emerald-400 font-medium">
            {dashboardData?.stats.fleetUtilization || 0}% Fleet Utilization
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Active Trips</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {dashboardData?.stats.activeTrips || 0}
          </div>
          <p className="text-xs text-amber-400 font-medium">
            {dashboardData?.stats.pendingTrips || 0} Pending / Draft
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Drivers On Duty</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {dashboardData?.stats.driversOnDuty || 0} / {dashboardData?.stats.totalDrivers || 0}
          </div>
          <p className="text-xs text-emerald-400 font-medium">Monitoring Active Shifts</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>In Shop Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {dashboardData?.stats.inShopVehicles || 0}
          </div>
          <p className="text-xs text-orange-400 font-medium">Currently Under Repair</p>
        </div>
      </div>

      {/* Advanced Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Trips Table (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider mb-6">Recent Trips</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider border-b border-zinc-800/80">
                <tr>
                  <th className="pb-3 font-semibold">Trip ID</th>
                  <th className="pb-3 font-semibold">Vehicle</th>
                  <th className="pb-3 font-semibold">Driver</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading trips...
                    </td>
                  </tr>
                ) : !dashboardData?.recentTrips?.length ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No recent trips found.
                    </td>
                  </tr>
                ) : (
                  dashboardData.recentTrips.map(trip => (
                    <tr key={trip.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 font-mono text-xs text-white">
                        {trip.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 font-bold text-zinc-300">
                        {trip.vehicle?.registrationNumber || "-"}
                      </td>
                      <td className="py-4 text-zinc-300">
                        {trip.driver?.name || "-"}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md text-white font-mono uppercase shadow-sm ${getStatusColor(trip.status)}`}>
                          {getStatusLabel(trip.status)}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs text-zinc-500">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress Bars (Takes up 1 column) */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 flex flex-col">
          <h2 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider mb-8">Vehicle Status</h2>
          
          <div className="space-y-6 flex-1">
            {/* Available Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-300">Available</span>
                <span className="text-zinc-400">{dashboardData?.vehicleStatusCounts?.available || 0}</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500" 
                  style={{ width: `${dashboardData?.stats.totalVehicles ? ((dashboardData?.vehicleStatusCounts?.available || 0) / dashboardData.stats.totalVehicles) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* On Trip Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-300">On Trip</span>
                <span className="text-zinc-400">{dashboardData?.vehicleStatusCounts?.on_trip || 0}</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${dashboardData?.stats.totalVehicles ? ((dashboardData?.vehicleStatusCounts?.on_trip || 0) / dashboardData.stats.totalVehicles) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* In Shop Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-300">In Shop</span>
                <span className="text-zinc-400">{dashboardData?.vehicleStatusCounts?.in_shop || 0}</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-500" 
                  style={{ width: `${dashboardData?.stats.totalVehicles ? ((dashboardData?.vehicleStatusCounts?.in_shop || 0) / dashboardData.stats.totalVehicles) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Retired Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-zinc-300">Retired</span>
                <span className="text-zinc-400">{dashboardData?.vehicleStatusCounts?.retired || 0}</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500" 
                  style={{ width: `${dashboardData?.stats.totalVehicles ? ((dashboardData?.vehicleStatusCounts?.retired || 0) / dashboardData.stats.totalVehicles) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white font-serif">Quick Module Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/reports"
            className="p-5 rounded-xl bg-gradient-to-br from-amber-500/15 to-zinc-900/80 hover:bg-zinc-900 border border-amber-500/40 hover:border-amber-400 transition group space-y-2 shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-amber-400 transition">ROI & Financial Analytics</h3>
            <p className="text-xs text-zinc-400">Compute formula <code className="text-amber-300">[Rev - Cost] / Acq</code>, audit fuel vs maintenance ledgers, and download official multi-table PDF.</p>
          </Link>

          <Link
            href="/expenses"
            className="p-5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition group space-y-2 shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-amber-400 transition">Fleet Expenses & Tolls</h3>
            <p className="text-xs text-zinc-400">Record itemized toll plaza fees, weighbridge receipts, and roadside repairs with PDF ledger export.</p>
          </Link>

          <Link
            href="/safety"
            className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-zinc-900/60 hover:bg-zinc-900 border border-amber-500/30 hover:border-amber-500 transition group space-y-2 shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-amber-400 transition">Safety Audit Center</h3>
            <p className="text-xs text-zinc-400">Audit driver compliance (`0-100 pts`), inspect license expirations (`HMV`/`LMV`), and enforce suspensions.</p>
          </Link>

          <Link
            href="/vehicles"
            className="p-5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition group space-y-2"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-amber-400 transition">Vehicle Fleet CRUD</h3>
            <p className="text-xs text-zinc-400">Manage registration numbers, model types, load capacities, and status.</p>
          </Link>

          <Link
            href="/drivers"
            className="p-5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition group space-y-2"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-amber-400 transition">Driver Lifecycle</h3>
            <p className="text-xs text-zinc-400">Track license categories, expiry compliance, and safety scores.</p>
          </Link>

          <Link
            href="/trips"
            className="p-5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition group space-y-2"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white group-hover:text-amber-400 transition">Trip State Machine</h3>
            <p className="text-xs text-zinc-400">Dispatch trips with transaction-safe state transitions & cargo validation.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
