"use client";

import React from "react";
import { Driver } from "@/hooks/useDrivers";
import { ShieldAlert, ShieldCheck, UserCheck, UserX, AlertTriangle, Award } from "lucide-react";

interface SafetyScoreCardProps {
  drivers: Driver[];
}

export function SafetyScoreCard({ drivers }: SafetyScoreCardProps) {
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter((d) => d.status === "available").length;
  const onTripDrivers = drivers.filter((d) => d.status === "on_trip").length;
  const suspendedDrivers = drivers.filter((d) => d.status === "suspended").length;

  const now = new Date();
  const expiredLicenses = drivers.filter(
    (d) => new Date(d.licenseExpiryDate) < now
  ).length;

  const avgSafetyScore =
    totalDrivers > 0
      ? Math.round(
          drivers.reduce((acc, d) => acc + (d.safetyScore || 100), 0) / totalDrivers
        )
      : 100;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 75) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Fleet Safety Score Gauge Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/90 space-y-3 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
          <span>Fleet Safety Average</span>
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
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">Compliance Standard</span>
          <span className={`px-2 py-0.5 rounded border font-mono font-bold ${getScoreColor(avgSafetyScore)}`}>
            {avgSafetyScore >= 90 ? "OPTIMAL" : avgSafetyScore >= 75 ? "SATISFACTORY" : "CRITICAL RISK"}
          </span>
        </div>
      </div>

      {/* Available vs On Trip */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
          <span>Operational Drivers</span>
          <UserCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-4xl font-black text-white font-mono">
          {availableDrivers + onTripDrivers} <span className="text-base text-zinc-500 font-normal">/ {totalDrivers}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono pt-1">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{availableDrivers} Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{onTripDrivers} On Trip</span>
          </div>
        </div>
      </div>

      {/* License Expiry Audits */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
          <span>License Compliance</span>
          <AlertTriangle className={`w-4 h-4 ${expiredLicenses > 0 ? "text-red-400" : "text-zinc-500"}`} />
        </div>
        <div className="text-4xl font-black text-white font-mono">
          {expiredLicenses}
        </div>
        <p className={`text-xs font-medium flex items-center gap-1.5 ${expiredLicenses > 0 ? "text-red-400" : "text-emerald-400"}`}>
          {expiredLicenses > 0 ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{expiredLicenses} Expired Licenses (Blocked from Dispatch)</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>All driver licenses valid & current</span>
            </>
          )}
        </p>
      </div>

      {/* Suspensions & Restrictions */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase">
          <span>Suspensions / Off Duty</span>
          <UserX className={`w-4 h-4 ${suspendedDrivers > 0 ? "text-red-400" : "text-zinc-500"}`} />
        </div>
        <div className="text-4xl font-black text-white font-mono">
          {suspendedDrivers}
        </div>
        <p className="text-xs text-zinc-400">
          Suspended drivers are blocked by strict business rules from all trip dispatch dropdowns.
        </p>
      </div>
    </div>
  );
}
