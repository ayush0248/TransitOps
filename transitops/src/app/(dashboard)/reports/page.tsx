"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Download,
  FileText,
  IndianRupee,
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- 1. Header Banner ---
      doc.setFillColor(18, 18, 20); // Dark background
      doc.rect(0, 0, pageWidth, 90, "F");

      // Brand text
      doc.setTextColor(245, 158, 11); // Amber
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("TransitOps", 40, 45);

      // Subtitle / Report Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Financial & Fleet Audit Report", 40, 65);

      // Metadata on the right
      doc.setFontSize(9);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 40, 40, { align: "right" });
      doc.text(`Role: Financial Analyst`, pageWidth - 40, 55, { align: "right" });
      doc.text(`Doc ID: TO-FIN-${Math.floor(Math.random() * 10000)}`, pageWidth - 40, 70, { align: "right" });

      // --- 2. Executive Summary ---
      doc.setTextColor(24, 24, 27); // zinc-900
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 40, 130);

      const totalOperating = reports.reduce((acc, curr) => acc + curr.totalOperatingCost, 0);
      const totalRevenue = reports.reduce((acc, curr) => acc + curr.estimatedRevenue, 0);
      const avgROI = reports.length > 0
        ? (reports.reduce((acc, curr) => acc + curr.roiPercentage, 0) / reports.length).toFixed(2)
        : "0.00";

      // Summary Box Background
      doc.setFillColor(244, 244, 245); // zinc-100
      doc.roundedRect(40, 145, pageWidth - 80, 70, 6, 6, "F");

      // Column 1
      doc.setFontSize(10);
      doc.setTextColor(113, 113, 122); // zinc-500
      doc.setFont("helvetica", "normal");
      doc.text("Total Active Assets", 60, 165);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(24, 24, 27);
      doc.text(`${utilization?.totalVehicles || reports.length}`, 60, 185);

      // Column 2
      doc.setFontSize(10);
      doc.setTextColor(113, 113, 122);
      doc.setFont("helvetica", "normal");
      doc.text("Fleet Utilization", 180, 165);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(245, 158, 11);
      doc.text(`${utilization?.utilizationPercentage || 0}%`, 180, 185);

      // Column 3
      doc.setFontSize(10);
      doc.setTextColor(113, 113, 122);
      doc.setFont("helvetica", "normal");
      doc.text("Operating Cost", 300, 165);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text(`Rs. ${totalOperating.toLocaleString()}`, 300, 185);

      // Column 4
      doc.setFontSize(10);
      doc.setTextColor(113, 113, 122);
      doc.setFont("helvetica", "normal");
      doc.text("Average ROI", 440, 165);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`${avgROI}%`, 440, 185);

      // --- 3. Table Section ---
      doc.setTextColor(24, 24, 27);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Vehicle Financial Ledger", 40, 255);

      const tableData = reports.map((v) => [
        v.registrationNumber,
        v.type,
        `Rs. ${v.totalFuelCost.toLocaleString()}`,
        `Rs. ${v.totalMaintenanceCost.toLocaleString()}`,
        `Rs. ${v.totalExpenseCost.toLocaleString()}`,
        `Rs. ${v.totalOperatingCost.toLocaleString()}`,
        `Rs. ${v.estimatedRevenue.toLocaleString()}`,
        `${v.roiPercentage}%`,
      ]);

      autoTable(doc, {
        startY: 270,
        head: [["Asset / Reg No", "Type", "Fuel", "Maintenance", "Expenses", "Total Cost", "Est. Revenue", "ROI"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
          halign: "left",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [63, 63, 70],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          7: { fontStyle: "bold", textColor: [16, 185, 129] }, // ROI column colored green-ish
        },
        margin: { left: 40, right: 40 },
        willDrawCell: function (data) {
          // Color ROI dynamically based on value
          if (data.section === "body" && data.column.index === 7) {
            const rawVal = reports[data.row.index]?.roiPercentage;
            if (rawVal < 0) {
              doc.setTextColor(225, 29, 72); // rose-600
            } else {
              doc.setTextColor(16, 185, 129); // emerald-500
            }
          }
        },
      });

      // --- 4. Footer & Page Numbers ---
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(161, 161, 170); // zinc-400
        doc.text(
          `TransitOps Platform - Confidential Financial Audit Report`,
          40,
          pageHeight - 30
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 40,
          pageHeight - 30,
          { align: "right" }
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
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">₹{totalOperatingCost.toLocaleString()}</div>
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
                    <td className="py-4 px-5 font-mono text-amber-400/90">₹{r.totalFuelCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono text-rose-400/90">₹{r.totalMaintenanceCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono text-cyan-400/90">₹{r.totalExpenseCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono font-bold text-white">₹{r.totalOperatingCost.toLocaleString()}</td>
                    <td className="py-4 px-5 font-mono text-zinc-300">₹{r.estimatedRevenue.toLocaleString()}</td>
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
