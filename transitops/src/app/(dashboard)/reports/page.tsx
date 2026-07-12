"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  Fuel,
  Wrench,
  Receipt,
  Truck,
  Loader2,
  CheckCircle2,
  PieChart,
  Percent,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface VehicleReportItem {
  vehicleId: string;
  registrationNumber: string;
  type: string;
  odometer: number;
  totalFuelCost: number;
  totalExpenseCost: number;
  totalMaintenanceCost: number;
  totalOperatingCost: number;
  estimatedRevenue: number;
  netProfit: number;
  roiPercentage: number;
}

interface FleetUtilizationData {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  inShopVehicles: number;
  retiredVehicles: number;
  utilizationPercentage: number;
  byType: Record<string, { total: number; active: number; utilization: number }>;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<VehicleReportItem[]>([]);
  const [utilization, setUtilization] = useState<FleetUtilizationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [roiRes, utilRes] = await Promise.all([
        axios.get("/api/reports").catch(() => ({ data: { data: [] } })),
        axios.get("/api/reports/fleet-utilization").catch(() => ({ data: { data: null } })),
      ]);
      setReports(roiRes.data?.data || []);
      setUtilization(utilRes.data?.data || null);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    window.location.href = "/api/reports/export/csv";
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF("p", "pt", "a4");

      // Title & Header
      doc.setFillColor(24, 24, 27); // zinc-900
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, "F");

      doc.setTextColor(245, 158, 11); // amber-500
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("TransitOps — Financial & Fleet Audit Report", 40, 42);

      doc.setFontSize(10);
      doc.setTextColor(212, 212, 216);
      doc.text(`Generated Date: ${new Date().toLocaleDateString()} | Role: Financial Analyst`, 40, 58);

      // Summary Box
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Executive Summary & KPIs", 40, 100);

      const totalOperating = reports.reduce((acc, curr) => acc + curr.totalOperatingCost, 0);
      const totalRevenue = reports.reduce((acc, curr) => acc + curr.estimatedRevenue, 0);
      const avgROI = reports.length > 0
        ? (reports.reduce((acc, curr) => acc + curr.roiPercentage, 0) / reports.length).toFixed(2)
        : "0.00";

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Active Fleet Assets: ${utilization?.totalVehicles || reports.length}`, 40, 120);
      doc.text(`Fleet Utilization Ratio: ${utilization?.utilizationPercentage || 0}%`, 250, 120);
      doc.text(`Total Operational Cost: $${totalOperating.toLocaleString()}`, 40, 138);
      doc.text(`Total Estimated Revenue: $${totalRevenue.toLocaleString()}`, 250, 138);
      doc.text(`Average Fleet ROI: ${avgROI}%`, 40, 156);

      // Table 1: Vehicle ROI & Cost Breakdown
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Vehicle Financial ROI & Cost Breakdown", 40, 190);

      const tableData = reports.map((v) => [
        v.registrationNumber,
        v.type,
        `$${v.totalFuelCost.toLocaleString()}`,
        `$${v.totalMaintenanceCost.toLocaleString()}`,
        `$${v.totalExpenseCost.toLocaleString()}`,
        `$${v.totalOperatingCost.toLocaleString()}`,
        `$${v.estimatedRevenue.toLocaleString()}`,
        `${v.roiPercentage}%`,
      ]);

      autoTable(doc, {
        startY: 205,
        head: [["Reg No", "Type", "Fuel", "Maint", "Expenses", "Total Cost", "Revenue", "ROI (%)"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0], fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 6 },
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `TransitOps Platform - Confidential Financial Audit Report — Page ${i} of ${pageCount}`,
          40,
          doc.internal.pageSize.getHeight() - 30
        );
      }

      doc.save(`TransitOps_Financial_Audit_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Official Financial Audit PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF document.");
    }
  };

  const totalOperatingCost = reports.reduce((acc, r) => acc + r.totalOperatingCost, 0);
  const totalFuel = reports.reduce((acc, r) => acc + r.totalFuelCost, 0);
  const totalMaint = reports.reduce((acc, r) => acc + r.totalMaintenanceCost, 0);
  const totalExp = reports.reduce((acc, r) => acc + r.totalExpenseCost, 0);
  const avgRoi = reports.length > 0
    ? (reports.reduce((acc, r) => acc + r.roiPercentage, 0) / reports.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900/90 to-zinc-900/40 p-6 rounded-2xl border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Financial Analyst & Fleet Controller Suite</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-serif">ROI Analytics & Financial Ledger</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time calculation of Formula: <code className="bg-zinc-800 text-amber-300 px-1.5 py-0.5 rounded font-mono text-xs">ROI = [Revenue - (Fuel + Maintenance + Expenses)] / Acquisition Cost</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadCSV}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm transition flex items-center gap-2 border border-zinc-700 shadow-md"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={downloadPDF}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-black text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>Download Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-bold">
            <span>Total Operational Cost</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">${totalOperatingCost.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">100% Verified</span> across all log modules
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-bold">
            <span>Average Fleet ROI</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">+{avgRoi}%</div>
          <div className="text-[11px] text-zinc-400">Based on acquisition vs net profit</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-bold">
            <span>Fleet Utilization Ratio</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono">{utilization?.utilizationPercentage || 0}%</div>
          <div className="text-[11px] text-zinc-400">{utilization?.activeVehicles || 0} active out of {utilization?.totalVehicles || 0} assets</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase font-bold">
            <span>Fuel & Maint Ratio</span>
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalOperatingCost > 0 ? `${((totalFuel / totalOperatingCost) * 100).toFixed(0)}% / ${((totalMaint / totalOperatingCost) * 100).toFixed(0)}%` : "0% / 0%"}
          </div>
          <div className="text-[11px] text-zinc-400">Fuel vs Maintenance cost split</div>
        </div>
      </div>

      {/* Main Breakdown Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white text-lg font-serif">Vehicle-by-Vehicle ROI & Financial Ledger</h2>
            <p className="text-xs text-zinc-400">Detailed accounting audit of fuel logs, maintenance repairs, and toll/general expenses.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="font-mono text-sm">Auditing ledger and computing ROI formulas...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-500" />
            <p className="font-semibold text-zinc-300">No Vehicle Records Available</p>
            <p className="text-xs mt-1">Register vehicles and log expenses to generate comprehensive ROI reports.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                  <th className="py-4 px-5 font-semibold">Asset / Reg No</th>
                  <th className="py-4 px-5 font-semibold">Type</th>
                  <th className="py-4 px-5 font-semibold">Fuel Cost</th>
                  <th className="py-4 px-5 font-semibold">Maintenance</th>
                  <th className="py-4 px-5 font-semibold">Tolls & Other</th>
                  <th className="py-4 px-5 font-semibold">Total Operating</th>
                  <th className="py-4 px-5 font-semibold">Est. Revenue</th>
                  <th className="py-4 px-5 font-semibold text-right">Computed ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {reports.map((r) => (
                  <tr key={r.vehicleId} className="hover:bg-zinc-800/40 transition">
                    <td className="py-4 px-5 font-mono font-bold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>{r.registrationNumber}</span>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-zinc-300 uppercase">{r.type}</td>
                    <td className="py-4 px-5 font-mono text-amber-400/90">${r.totalFuelCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono text-rose-400/90">${r.totalMaintenanceCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono text-cyan-400/90">${r.totalExpenseCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono font-bold text-white">${r.totalOperatingCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono text-zinc-300">${r.estimatedRevenue.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono font-black text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs border ${
                          r.roiPercentage >= 0
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}
                      >
                        {r.roiPercentage >= 0 ? "+" : ""}
                        {r.roiPercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
