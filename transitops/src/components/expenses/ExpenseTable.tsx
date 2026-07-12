"use client";

import React, { useState } from "react";
import { Expense } from "@/hooks/useExpenses";
import { Receipt, Search, Tag, DollarSign } from "lucide-react";

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseTable({ expenses, isLoading }: ExpenseTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.vehicle?.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === "all" || exp.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      toll: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      maintenance: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      repair: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      insurance: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      other: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold font-mono uppercase ${colors[type] || colors.other}`}>
        <Tag className="w-3 h-3" />
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by vehicle reg no or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500/50 w-full sm:w-auto font-mono uppercase text-xs"
        >
          <option value="all">All Expense Types</option>
          <option value="toll">Toll / FASTag</option>
          <option value="maintenance">Maintenance</option>
          <option value="repair">Roadside Repair</option>
          <option value="insurance">Insurance</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Vehicle Asset</th>
                <th className="py-3.5 px-4 font-semibold">Expense Category</th>
                <th className="py-3.5 px-4 font-semibold">Description / Notes</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amount (USD / INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                      <span>Loading expense ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-50" />
                    <p className="font-semibold text-zinc-400">No expenses recorded yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Toll plaza fees, repair charges, and operational costs appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-xs">
                      {new Date(exp.date || exp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono">{exp.vehicle?.registrationNumber || exp.vehicleId}</div>
                      <div className="text-xs text-zinc-400">{exp.vehicle?.name || "Asset"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getTypeBadge(exp.type)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 max-w-xs truncate">
                      {exp.description || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold text-right">
                      ${Number(exp.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
