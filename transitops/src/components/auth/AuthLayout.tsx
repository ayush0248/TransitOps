"use client";

import React from "react";
import { ShieldCheck, Truck, Users, PieChart, Activity, Layers } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isRegister?: boolean;
}

export function AuthLayout({ children, title, subtitle, isRegister = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#0f0f11] text-zinc-100 selection:bg-amber-500/30 font-sans">
      {/* Left Column - Enterprise Branding & Role Capabilities */}
      <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-[#131316] to-[#0d0d0f] p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800/80 relative overflow-hidden">
        {/* Subtle ambient glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Logo Section */}
          <div className="flex items-center gap-3.5 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-600/30">
              <Truck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 font-mono">
                TransitOps
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                Enterprise Transport & Fleet Management
              </p>
            </div>
          </div>

          <div className="my-8 h-px bg-gradient-to-r from-zinc-800 via-zinc-700/50 to-transparent" />

          {/* Role Profiles Overview */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Role-Based Operational Access</span>
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Each profile provides tailored dashboards and strictly bounded administrative permissions.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3.5 transition hover:border-amber-500/40">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Fleet Manager</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Direct access to fleet roster (`/vehicles`), vehicle acquisition, load metrics, and shop status.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3.5 transition hover:border-amber-500/40">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dispatcher / Driver Ops</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Direct access to trip control (`/trips`), dispatching, cargo tracking, and fuel logging.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3.5 transition hover:border-amber-500/40">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Safety Officer</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Direct access to driver compliance (`/drivers`), license audits, and safety score management.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-3.5 transition hover:border-amber-500/40">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Financial Analyst</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Direct access to financial reports (`/reports`), expense audits, and vehicle ROI formulas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-8 mt-8 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>TRANSITOPS PLATFORM © 2026</span>
          <span className="flex items-center gap-1.5 text-amber-500 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            STRICT RBAC ENFORCED
          </span>
        </div>
      </div>

      {/* Right Column - Main Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-12 lg:p-16 relative z-10">
        <div className="max-w-lg w-full mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif mb-2">
              {title}
            </h2>
            <p className="text-sm text-zinc-400 font-normal">{subtitle}</p>
          </div>

          {/* Form Card */}
          <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/60">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
