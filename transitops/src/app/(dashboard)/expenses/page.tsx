"use client";

import React, { useState } from "react";
import { Receipt, Plus, ShieldCheck, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { CreateExpenseModal } from "@/components/expenses/CreateExpenseModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export default function ExpensesPage() {
  const { user } = useAuth();
  const { data: expenses = [], isLoading } = useExpenses();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const downloadExpensesPDF = () => {
    if (!expenses || expenses.length === 0) {
      toast.error("No expenses found to download.");
      return;
    }

    try {
      const doc = new jsPDF("p", "pt", "a4");

      // Header Banner
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 70, "F");

      doc.setTextColor(245, 158, 11);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("TransitOps — Fleet Expenses & Toll Ledger Audit", 40, 42);

      doc.setFontSize(10);
      doc.setTextColor(212, 212, 216);
      doc.text(`Generated Date: ${new Date().toLocaleDateString()} | Scope: Financial & Operations Audit`, 40, 58);

      // Summary Stats
      const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Expense Summary Ledger", 40, 100);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Recorded Entries: ${expenses.length}`, 40, 120);
      doc.text(`Total Expense Expenditure: $${totalAmount.toLocaleString()}`, 250, 120);

      // Table
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("2. Itemized Expenditure Audit Table", 40, 160);

      const tableData = expenses.map((exp) => [
        new Date(exp.date || exp.createdAt).toLocaleDateString(),
        exp.vehicle?.registrationNumber || exp.vehicleId || "N/A",
        exp.type.toUpperCase(),
        exp.description || "-",
        `$${Number(exp.amount).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: 175,
        head: [["Date", "Vehicle Reg No", "Category", "Description / Notes", "Amount ($)"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 6 },
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `TransitOps Platform - Itemized Expenses & Tolls Ledger — Page ${i} of ${pageCount}`,
          40,
          doc.internal.pageSize.getHeight() - 30
        );
      }

      doc.save(`TransitOps_Expenses_Ledger_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Expenses PDF ledger downloaded successfully!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate expenses PDF document.");
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Driver & Operations Scope — Tolls & Roadside Ledger</span>
          </div>
          <h1 className="text-3xl font-black text-white font-serif tracking-tight">Fleet Expenses & Tolls</h1>
          <p className="text-sm text-zinc-400">Categorize operational spending: Toll plaza charges, weighbridge fees, and emergency repairs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadExpensesPDF}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm transition flex items-center gap-2 border border-zinc-700 shadow-md"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Download Expenses PDF</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      <ExpenseTable expenses={expenses} isLoading={isLoading} />

      <CreateExpenseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
