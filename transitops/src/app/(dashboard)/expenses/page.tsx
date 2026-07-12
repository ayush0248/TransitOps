"use client";

import React, { useState } from "react";
import { Receipt, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { CreateExpenseModal } from "@/components/expenses/CreateExpenseModal";

export default function ExpensesPage() {
  const { user } = useAuth();
  const { data: expenses = [], isLoading } = useExpenses();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Driver & Operations Scope — Tolls & Roadside Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-serif">Fleet Expenses & Tolls</h1>
          <p className="text-sm text-zinc-400">Categorize operational spending: Toll plaza charges, weighbridge fees, and emergency repairs.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      <ExpenseTable expenses={expenses} isLoading={isLoading} />

      <CreateExpenseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
