"use client";

import React, { useState } from "react";
import { useDrivers, Driver, useUpdateDriver } from "@/hooks/useDrivers";
import { useAuth } from "@/hooks/useAuth";
import { DriverFormModal } from "@/components/drivers/DriverFormModal";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Award,
  Users,
  XCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Search,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  ArrowRight,
  Wrench,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SafetyOfficerPage() {
  const { user } = useAuth();
  const updateMutation = useUpdateDriver();

  const [filterType, setFilterType] = useState<"all" | "low_score" | "expired" | "suspended">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);

  const { data: drivers = [], isLoading, refetch, isRefetching } = useDrivers();

  const now = new Date();

  // Calculations for Gauges & Audits
  const totalDrivers = drivers.length;
  const avgSafetyScore =
    totalDrivers > 0
      ? Math.round(drivers.reduce((acc, d) => acc + (d.safetyScore || 100), 0) / totalDrivers)
      : 100;

  const expiredLicenses = drivers.filter((d) => new Date(d.licenseExpiryDate) < now);
  const expiringSoonLicenses = drivers.filter((d) => {
    const exp = new Date(d.licenseExpiryDate);
    const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 30;
  });

  const lowScoreDrivers = drivers.filter((d) => d.safetyScore < 75);
  const suspendedDrivers = drivers.filter((d) => d.status === "suspended");

  // Filtered Roster
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseCategory.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "low_score") return d.safetyScore < 75;
    if (filterType === "expired") {
      const exp = new Date(d.licenseExpiryDate);
      const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return exp < now || (diffDays >= 0 && diffDays <= 30);
    }
    if (filterType === "suspended") return d.status === "suspended";
    return true;
  });

  const handleToggleSuspend = async (driver: Driver) => {
    const newStatus = driver.status === "suspended" ? "available" : "suspended";
    try {
      await updateMutation.mutateAsync({
        id: driver.id,
        data: { status: newStatus },
      });
      toast.success(
        newStatus === "suspended"
          ? `Driver ${driver.name} suspended from dispatch.`
          : `Driver ${driver.name} activated for duty.`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleAdjustScore = async (driver: Driver, delta: number) => {
    const newScore = Math.min(100, Math.max(0, (driver.safetyScore || 100) + delta));
    try {
      await updateMutation.mutateAsync({
        id: driver.id,
        data: { safetyScore: newScore },
      });
      toast.success(`Updated ${driver.name}'s safety score to ${newScore} pts.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update safety score.");
    }
  };

  const handleOpenEdit = (driver: Driver) => {
    setDriverToEdit(driver);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Safety Officer Command & Compliance Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
            Safety & Risk Audit Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Audit driver safety scores (0-100), monitor license expiration deadlines, enforce suspensions, and inspect transport risk metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition flex items-center gap-2 text-sm font-bold font-mono"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            <span>Sync Roster</span>
          </button>
          <Link
            href="/drivers"
            className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition flex items-center gap-2 font-mono border border-zinc-700"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Full Driver Roster</span>
          </Link>
        </div>
      </div>

      {/* Safety Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gauge 1: Fleet Safety Average */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 space-y-3 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Fleet Safety Rating</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-white font-mono">{avgSafetyScore}</span>
            <span className="text-xs text-zinc-400 font-mono">/ 100 pts</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                avgSafetyScore >= 90
                  ? "bg-emerald-500"
                  : avgSafetyScore >= 75
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, avgSafetyScore))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-zinc-400">Compliance Standard</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                avgSafetyScore >= 90
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                  : avgSafetyScore >= 75
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                  : "text-red-400 bg-red-500/10 border border-red-500/30"
              }`}
            >
              {avgSafetyScore >= 90 ? "OPTIMAL" : avgSafetyScore >= 75 ? "SATISFACTORY" : "HIGH RISK"}
            </span>
          </div>
        </div>

        {/* Gauge 2: License Audits */}
        <div
          onClick={() => setFilterType("expired")}
          className={`p-6 rounded-2xl border transition cursor-pointer space-y-3 shadow-xl ${
            filterType === "expired"
              ? "bg-red-500/10 border-red-500/50"
              : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>License Alerts</span>
            <AlertTriangle
              className={`w-4 h-4 ${expiredLicenses.length > 0 ? "text-red-400 animate-pulse" : "text-amber-400"}`}
            />
          </div>
          <div className="text-4xl font-black text-white font-mono">
            {expiredLicenses.length + expiringSoonLicenses.length}
          </div>
          <div className="flex items-center gap-3 text-xs font-mono pt-1">
            <span className="text-red-400 font-bold">{expiredLicenses.length} Expired</span>
            <span className="text-amber-400 font-bold">{expiringSoonLicenses.length} Expiring ({"< 30d"})</span>
          </div>
        </div>

        {/* Gauge 3: Critical Safety Risks (<75 pts) */}
        <div
          onClick={() => setFilterType("low_score")}
          className={`p-6 rounded-2xl border transition cursor-pointer space-y-3 shadow-xl ${
            filterType === "low_score"
              ? "bg-amber-500/10 border-amber-500/50"
              : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>{"High Risk (< 75 pts)"}</span>
            <ShieldAlert className={`w-4 h-4 ${lowScoreDrivers.length > 0 ? "text-orange-400" : "text-zinc-500"}`} />
          </div>
          <div className="text-4xl font-black text-white font-mono">{lowScoreDrivers.length}</div>
          <p className="text-xs text-zinc-400 font-mono">
            {lowScoreDrivers.length > 0
              ? "Requires driver coaching / review"
              : "All drivers above 75 point threshold"}
          </p>
        </div>

        {/* Gauge 4: Suspended Roster */}
        <div
          onClick={() => setFilterType("suspended")}
          className={`p-6 rounded-2xl border transition cursor-pointer space-y-3 shadow-xl ${
            filterType === "suspended"
              ? "bg-red-500/10 border-red-500/50"
              : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
            <span>Suspended Personnel</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-4xl font-black text-white font-mono">{suspendedDrivers.length}</div>
          <p className="text-xs text-zinc-400 font-mono">Blocked from trip dispatching</p>
        </div>
      </div>

      {/* Quick Action Matrix for Safety Officer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-serif font-bold text-lg">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <span>Safety Audit Quick Protocols</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Safety Officers are mandated to verify driver license credentials (HMV / LMV) and enforce safety score rules. Drivers who are On Trip cannot be suspended until their trip is completed or canceled.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1 font-mono text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg border transition font-bold ${
                filterType === "all"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-zinc-800 text-zinc-400 border-transparent hover:text-white"
              }`}
            >
              Show All ({drivers.length})
            </button>
            <button
              onClick={() => setFilterType("expired")}
              className={`px-3 py-1.5 rounded-lg border transition font-bold ${
                filterType === "expired"
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : "bg-zinc-800 text-zinc-400 border-transparent hover:text-white"
              }`}
            >
              License Action ({expiredLicenses.length + expiringSoonLicenses.length})
            </button>
            <button
              onClick={() => setFilterType("low_score")}
              className={`px-3 py-1.5 rounded-lg border transition font-bold ${
                filterType === "low_score"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-zinc-800 text-zinc-400 border-transparent hover:text-white"
              }`}
            >
              Safety Risk ({lowScoreDrivers.length})
            </button>
            <button
              onClick={() => setFilterType("suspended")}
              className={`px-3 py-1.5 rounded-lg border transition font-bold ${
                filterType === "suspended"
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : "bg-zinc-800 text-zinc-400 border-transparent hover:text-white"
              }`}
            >
              Suspended ({suspendedDrivers.length})
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-white font-serif font-bold text-lg mb-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Cross-Module Safety Inspection</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Inspect active trip dispatches for cargo weight compliance and review vehicle shop logs for structural safety hazards.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2 font-mono text-xs">
            <Link
              href="/trips"
              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-between border border-zinc-700"
            >
              <span>Audit Dispatches</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
            <Link
              href="/maintenance"
              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition flex items-center justify-between border border-zinc-700"
            >
              <span>Shop Inspection</span>
              <Wrench className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by driver name, license number, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
          <span>Active View:</span>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase">
            {filterType.replace("_", " ")}
          </span>
          <span className="text-zinc-500">({filteredDrivers.length} personnel)</span>
        </div>
      </div>

      {/* Safety Compliance Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-zinc-400 font-mono">Loading safety compliance roster...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No Drivers Match Filter</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              No personnel found matching the selected filter ({filterType.replace("_", " ")}). Try switching back to "Show All".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6">Personnel Info</th>
                  <th className="py-4 px-6">License & Expiry Status</th>
                  <th className="py-4 px-6">Safety Rating (0-100)</th>
                  <th className="py-4 px-6">Quick Score Adjust</th>
                  <th className="py-4 px-6">Operational Status</th>
                  <th className="py-4 px-6 text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {filteredDrivers.map((driver) => {
                  const expDate = new Date(driver.licenseExpiryDate);
                  const isExpired = expDate < now;
                  const diffDays = (expDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
                  const isExpiringSoon = !isExpired && diffDays <= 30;

                  return (
                    <tr key={driver.id} className="hover:bg-zinc-800/40 transition group">
                      {/* Driver Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold font-mono shrink-0 border border-zinc-700/50">
                            {driver.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-400 transition">
                              {driver.name}
                            </div>
                            <div className="text-xs text-zinc-400 font-mono mt-0.5">
                              {driver.contactNumber || "No phone listed"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* License Status */}
                      <td className="py-4 px-6 font-mono">
                        <div className="font-bold text-zinc-200">{driver.licenseNumber}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{driver.licenseCategory}</div>
                        <div className="mt-1.5">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              EXPIRED ({expDate.toISOString().split("T")[0]})
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              <Clock className="w-3.5 h-3.5 animate-pulse" />
                              Expiring in {Math.round(diffDays)}d ({expDate.toISOString().split("T")[0]})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Valid until {expDate.toISOString().split("T")[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Safety Score Bar */}
                      <td className="py-4 px-6">
                        <div className="space-y-1.5 max-w-[130px]">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span
                              className={`font-bold ${
                                driver.safetyScore >= 90
                                  ? "text-emerald-400"
                                  : driver.safetyScore >= 75
                                  ? "text-amber-400"
                                  : "text-red-400"
                              }`}
                            >
                              {driver.safetyScore} pts
                            </span>
                            <span className="text-[10px] text-zinc-500">Max 100</span>
                          </div>
                          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                driver.safetyScore >= 90
                                  ? "bg-emerald-500"
                                  : driver.safetyScore >= 75
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, driver.safetyScore))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quick Score Adjust */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            onClick={() => handleAdjustScore(driver, -5)}
                            disabled={updateMutation.isPending || driver.safetyScore <= 0}
                            title="Deduct 5 Safety Points (Violation)"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition border border-zinc-700/60 disabled:opacity-30"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-zinc-300">Score</span>
                          <button
                            onClick={() => handleAdjustScore(driver, 5)}
                            disabled={updateMutation.isPending || driver.safetyScore >= 100}
                            title="Award 5 Safety Points (Compliance Bonus)"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition border border-zinc-700/60 disabled:opacity-30"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Operational Status */}
                      <td className="py-4 px-6">
                        {driver.status === "available" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Available
                          </span>
                        )}
                        {driver.status === "on_trip" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            On Trip
                          </span>
                        )}
                        {driver.status === "off_duty" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            Off Duty
                          </span>
                        )}
                        {driver.status === "suspended" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 font-mono">
                            <XCircle className="w-3.5 h-3.5" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono">
                          {driver.status !== "on_trip" ? (
                            <button
                              onClick={() => handleToggleSuspend(driver)}
                              disabled={updateMutation.isPending}
                              title={driver.status === "suspended" ? "Restore to Duty" : "Suspend Driver"}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                                driver.status === "suspended"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25"
                                  : "bg-red-500/15 text-red-400 border-red-500/40 hover:bg-red-500/25"
                              }`}
                            >
                              {driver.status === "suspended" ? "Activate" : "Suspend"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-500 bg-zinc-800/60 px-2 py-1 rounded border border-zinc-800">
                              Locked (On Trip)
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenEdit(driver)}
                            title="Edit License / Full Details"
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Driver Modal */}
      <DriverFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDriverToEdit(null);
        }}
        driverToEdit={driverToEdit}
      />
    </div>
  );
}
