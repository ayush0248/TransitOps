"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { ROLE_LABELS, ROLE_SCOPES } from "@/lib/constants";
import { Car, ShieldCheck, Truck, Users, Wrench, Fuel, Receipt, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const roleLabel = user ? ROLE_LABELS[user.role] : "Fleet Manager";
  const roleScope = user ? ROLE_SCOPES[user.role] : "Full access";

  return (
    <div className="space-y-8">
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Active Vehicles</span>
            <Car className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">24 / 28</div>
          <p className="text-xs text-emerald-400 font-medium">85.7% Fleet Available</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Active Trips</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">14</div>
          <p className="text-xs text-amber-400 font-medium">Dispatched & On Route</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Drivers On Duty</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">18 / 22</div>
          <p className="text-xs text-emerald-400 font-medium">Average Safety Score: 96/100</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>In Shop Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-white font-mono">4</div>
          <p className="text-xs text-orange-400 font-medium">Currently Under Repair</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-serif">Quick Module Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
