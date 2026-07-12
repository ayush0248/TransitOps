"use client";

import React, { useState } from "react";
import { Driver, useUpdateDriver, useDeleteDriver } from "@/hooks/useDrivers";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Phone,
  FileBadge,
} from "lucide-react";

interface DriverTableProps {
  drivers: Driver[];
  isLoading?: boolean;
  onEdit: (driver: Driver) => void;
}

export function DriverTable({ drivers, isLoading, onEdit }: DriverTableProps) {
  const { user } = useAuth();
  const isSafetyOfficerOrManager = user?.role === "safety_officer" || user?.role === "fleet_manager";

  const updateMutation = useUpdateDriver();
  const deleteMutation = useDeleteDriver();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-zinc-400 font-mono">Loading driver compliance roster...</p>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Drivers Found</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          No driver profiles match your current search or status filter criteria. Click "Register Driver" above to add new personnel.
        </p>
      </div>
    );
  }

  const now = new Date();

  const handleToggleSuspend = async (driver: Driver) => {
    const newStatus = driver.status === "suspended" ? "available" : "suspended";
    await updateMutation.mutateAsync({
      id: driver.id,
      data: { status: newStatus },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this driver profile? This cannot be undone.")) {
      setDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Available
          </span>
        );
      case "on_trip":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            On Trip
          </span>
        );
      case "off_duty":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30 font-mono">
            <Clock className="w-3.5 h-3.5" />
            Off Duty
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 font-mono">
            <XCircle className="w-3.5 h-3.5" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/90 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-4 px-6">Driver / Contact</th>
              <th className="py-4 px-6">License & Category</th>
              <th className="py-4 px-6">Expiry Audit</th>
              <th className="py-4 px-6">Safety Score (0-100)</th>
              <th className="py-4 px-6">Operational Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-sm">
            {drivers.map((driver) => {
              const expiryDate = new Date(driver.licenseExpiryDate);
              const isExpired = expiryDate < now;
              const formattedExpiry = expiryDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              return (
                <tr key={driver.id} className="hover:bg-zinc-800/40 transition group">
                  {/* Driver & Contact */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold font-mono shrink-0">
                        {driver.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-amber-400 transition">
                          {driver.name}
                        </div>
                        {driver.contactNumber ? (
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-zinc-500" />
                            <span>{driver.contactNumber}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 font-mono">No contact</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* License & Category */}
                  <td className="py-4 px-6 font-mono">
                    <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <FileBadge className="w-4 h-4 text-amber-500" />
                      <span>{driver.licenseNumber}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {driver.licenseCategory}
                    </div>
                  </td>

                  {/* Expiry Audit */}
                  <td className="py-4 px-6 font-mono">
                    {isExpired ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>EXPIRED ({formattedExpiry})</span>
                      </div>
                    ) : (
                      <div className="text-zinc-300 text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{formattedExpiry}</span>
                      </div>
                    )}
                  </td>

                  {/* Safety Score */}
                  <td className="py-4 px-6">
                    <div className="space-y-1.5 max-w-[140px]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white">{driver.safetyScore} pts</span>
                        <span className="text-[10px] text-zinc-500">Target 90+</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
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

                  {/* Status */}
                  <td className="py-4 px-6">{getStatusBadge(driver.status)}</td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    {isSafetyOfficerOrManager ? (
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Suspension button */}
                        {driver.status !== "on_trip" && (
                          <button
                            onClick={() => handleToggleSuspend(driver)}
                            disabled={updateMutation.isPending}
                            title={driver.status === "suspended" ? "Activate Driver" : "Suspend Driver"}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition flex items-center gap-1 ${
                              driver.status === "suspended"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                            }`}
                          >
                            {driver.status === "suspended" ? "Activate" : "Suspend"}
                          </button>
                        )}

                        {/* Edit Profile */}
                        <button
                          onClick={() => onEdit(driver)}
                          title="Edit Profile"
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(driver.id)}
                          disabled={driver.status === "on_trip" || deletingId === driver.id}
                          title={driver.status === "on_trip" ? "Cannot delete driver On Trip" : "Delete Driver"}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-800">
                        View Only
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
