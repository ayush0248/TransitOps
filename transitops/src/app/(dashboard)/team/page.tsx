"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { ShieldCheck, UserPlus, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { UserFormModal } from "@/components/team/UserFormModal";

export default function TeamManagementPage() {
  const { user } = useAuth();
  const { data: users = [], isLoading, refetch, isRefetching } = useUsers();
  const deleteMutation = useDeleteUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback protection if unauthorized access somehow bypasses layout checks
  if (user?.role !== "fleet_manager") {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-zinc-500 font-mono">Unauthorized access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-mono text-xs uppercase font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Root Admin Scope</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
            Access & Team Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage system users, assign roles, and control access to operational dashboards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh Users"
            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-600/25 transform active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950/50 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User Profile</th>
                <th className="px-6 py-4 font-semibold">Email Address</th>
                <th className="px-6 py-4 font-semibold">Assigned Role</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <span>Loading users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono uppercase ${
                        u.role === "fleet_manager" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        u.role === "safety_officer" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                        u.role === "financial_analyst" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}>
                        {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                            deleteMutation.mutate(u.id);
                          }
                        }}
                        disabled={deleteMutation.isPending && deleteMutation.variables === u.id}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete User"
                      >
                        {deleteMutation.isPending && deleteMutation.variables === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
