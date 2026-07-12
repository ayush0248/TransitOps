"use client";

import React from "react";
import { BarChart3, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-serif">ROI Analytics & Operational Reports</h1>
          <p className="text-sm text-zinc-400">Generate efficiency metrics, utilization ratios, and vehicle ROI audits.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("CSV Export Triggered.")}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition flex items-center gap-2 border border-zinc-700"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>Vehicle ROI Formula</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            ROI = Revenue - (Fuel Cost + Maintenance Cost) / Acquisition Cost
          </p>
          <div className="pt-2 text-2xl font-bold text-emerald-400 font-mono">+18.4% Average Fleet ROI</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>Operational Efficiency</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Liters / 100km & Cost per km breakdown by vehicle class.
          </p>
          <div className="pt-2 text-2xl font-bold text-amber-400 font-mono">3.42 USD / km avg cost</div>
        </div>
      </div>
    </div>
  );
}
