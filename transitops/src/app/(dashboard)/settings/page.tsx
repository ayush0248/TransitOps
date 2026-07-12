"use client";

import React from "react";
import { Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white font-serif">System Settings & RBAC Audit</h1>
        <p className="text-sm text-zinc-400">View current session claims, role permissions, and database connectivity.</p>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <span>Session Verification</span>
        </h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-500">Authenticated Email:</span>
            <span className="text-white font-bold">{user?.email || "N/A"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-800">
            <span className="text-zinc-500">Active Role:</span>
            <span className="text-amber-400 font-bold uppercase">{user?.role || "N/A"}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-zinc-500">Auth Cookie Storage:</span>
            <span className="text-emerald-400 font-bold">HTTP-Only JWT Token (7-Day Expiry)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
