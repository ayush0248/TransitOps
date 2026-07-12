"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import { useAuth } from "@/providers/AuthProvider";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AlertCircle, ArrowRight, CheckSquare, KeyRound, Loader2, Shield, Truck, Users, PieChart, Activity } from "lucide-react";

const ROLE_PROFILES = [
  {
    role: "fleet_manager",
    title: "Fleet Manager",
    email: "manager@transitops.in",
    password: "password123",
    description: "Lands on Fleet & Vehicles Dashboard (`/vehicles`)",
    icon: Truck,
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    activeColor: "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10",
  },
  {
    role: "driver_user",
    title: "Dispatcher / Driver",
    email: "dispatcher@transitops.in",
    password: "password123",
    description: "Lands on Trips & Operations (`/trips`)",
    icon: Activity,
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    activeColor: "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10",
  },
  {
    role: "safety_officer",
    title: "Safety Officer",
    email: "safety@transitops.in",
    password: "password123",
    description: "Lands on Driver Roster & Scores (`/drivers`)",
    icon: Users,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    activeColor: "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10",
  },
  {
    role: "financial_analyst",
    title: "Financial Analyst",
    email: "finance@transitops.in",
    password: "password123",
    description: "Lands on Financial & ROI Reports (`/reports`)",
    icon: PieChart,
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    activeColor: "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "manager@transitops.in",
      password: "password123",
      role: "fleet_manager",
    },
  });

  const selectedRole = watch("role");

  const selectRoleProfile = (profile: typeof ROLE_PROFILES[0]) => {
    setValue("role", profile.role);
    setValue("email", profile.email);
    setValue("password", profile.password);
    setErrorMessage(null);
  };

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    try {
      await login(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your email and role.");
    }
  };

  return (
    <AuthLayout
      title="Access Operational Portal"
      subtitle="Select a role profile to automatically populate credentials and land on that role's dashboard"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/50 text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-400">Authentication Failed</p>
              <p className="mt-0.5 text-zinc-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Interactive Role Profile Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
            <span>1. Select Profile to Login As:</span>
            <span className="text-[10px] text-amber-500 font-normal">Auto-fills ID & Password</span>
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ROLE_PROFILES.map((profile) => {
              const IconComponent = profile.icon;
              const isSelected = selectedRole === profile.role;
              return (
                <button
                  key={profile.role}
                  type="button"
                  onClick={() => selectRoleProfile(profile)}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? profile.activeColor
                      : "border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-zinc-700 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-zinc-500"}`} />
                      <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                        {profile.title}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-normal leading-relaxed">
                    {profile.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-zinc-800 my-4" />

        {/* Credentials Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              2. Verify Credentials & Scope
            </span>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 font-mono">
              Role ID / Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm font-sans"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 font-mono">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm font-sans"
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          {/* Role (Hidden/Selectable Override) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 font-mono">
              RBAC Target Scope
            </label>
            <select
              {...register("role")}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm font-sans cursor-pointer"
            >
              <option value="fleet_manager">Fleet Manager → Fleet & Maintenance (/vehicles)</option>
              <option value="driver_user">Dispatcher / Driver → Trips & Dispatch (/trips)</option>
              <option value="safety_officer">Safety Officer → Driver Roster & Scores (/drivers)</option>
              <option value="financial_analyst">Financial Analyst → Fuel, Expenses & ROI (/reports)</option>
            </select>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer select-none"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                rememberMe
                  ? "bg-amber-600 border-amber-500 text-white"
                  : "border-zinc-700 bg-zinc-900"
              }`}
            >
              {rememberMe && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span>Remember session for 7 days</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating Session...</span>
            </>
          ) : (
            <>
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Navigation to Sign Up */}
        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-xs text-zinc-400">
            Need a new custom account?{" "}
            <Link
              href="/register"
              className="text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-4 ml-1 transition"
            >
              Register Account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
