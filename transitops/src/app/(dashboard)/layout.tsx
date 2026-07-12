"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { ROLE_LABELS } from "@/lib/constants";
import {
  BarChart3,
  Car,
  ChevronRight,
  FileText,
  Fuel,
  Grid,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShieldAlert,
  User,
  Users,
  Wrench,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard Overview", href: "/dashboard", icon: Grid, roles: ["all"] },
  { label: "Safety Audit Center", href: "/safety", icon: ShieldAlert, roles: ["fleet_manager", "safety_officer"] },
  { label: "Fleet Vehicles", href: "/vehicles", icon: Car, roles: ["fleet_manager", "driver_user", "financial_analyst", "safety_officer"] },
  { label: "Drivers & Compliance", href: "/drivers", icon: Users, roles: ["fleet_manager", "safety_officer", "driver_user"] },
  { label: "Trip Dispatching", href: "/trips", icon: ChevronRight, roles: ["fleet_manager", "driver_user", "safety_officer", "financial_analyst"] },
  { label: "Maintenance Shop", href: "/maintenance", icon: Wrench, roles: ["fleet_manager", "driver_user", "safety_officer", "financial_analyst"] },
  { label: "Fuel Consumption", href: "/fuel-logs", icon: Fuel, roles: ["fleet_manager", "financial_analyst", "driver_user"] },
  { label: "Expenses & Tolls", href: "/expenses", icon: Receipt, roles: ["fleet_manager", "financial_analyst", "driver_user"] },
  { label: "ROI & Analytics Reports", href: "/reports", icon: BarChart3, roles: ["fleet_manager", "financial_analyst", "safety_officer"] },
  { label: "System Settings", href: "/settings", icon: Settings, roles: ["all"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = user?.role || "fleet_manager";
  const roleLabel = user ? ROLE_LABELS[user.role] : "Guest Access";

  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100 flex flex-col lg:flex-row">
      {/* Mobile Topbar */}
      <header className="lg:hidden bg-zinc-900/90 border-b border-zinc-800/80 p-4 sticky top-0 z-40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-600/10 border border-amber-600/30 flex items-center justify-center text-amber-500">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black tracking-tight text-white font-mono text-lg">TransitOps</span>
            <span className="block text-[10px] text-amber-400 font-mono uppercase">{roleLabel}</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-72 bg-zinc-900/95 lg:bg-zinc-900 border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white font-mono text-xl">TransitOps</span>
                <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono border border-amber-500/30">
                  RBAC
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">Transport Operations OS</p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name || "Loading..."}</p>
              <p className="text-xs text-amber-400 font-mono truncate">{roleLabel}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Operations Menu
            </p>
            {NAV_ITEMS.filter((item) => item.roles.includes("all") || item.roles.includes(userRole)).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition group ${
                    isActive
                      ? "bg-amber-600/15 text-amber-400 border border-amber-500/30 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer & Sign Out */}
        <div className="p-6 border-t border-zinc-800/80 bg-zinc-950/40">
          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800/70 hover:bg-red-600/20 hover:text-red-300 hover:border-red-500/30 border border-zinc-700/60 text-zinc-300 text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </div>
  );
}
