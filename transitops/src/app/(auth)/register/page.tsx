"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useAuth } from "@/providers/AuthProvider";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AlertCircle, ArrowRight, Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { register: registerAuth, isRegistering } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "Raven K.",
      email: "ravenk@transitops.in",
      password: "password123",
      role: "fleet_manager",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setErrorMessage(null);
    try {
      await registerAuth(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register a new TransitOps account with custom RBAC permissions"
      isRegister={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/50 text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-400">Registration Failed</p>
              <p className="mt-0.5 text-zinc-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Full Name Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            Full Name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Raven K."
            className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm font-sans"
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="e.g. ravenk@transitops.in"
            className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm font-sans"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            Password (Min 6 Characters)
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm font-sans"
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Role RBAC Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
            Select Account Role (RBAC)
          </label>
          <select
            {...register("role")}
            className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm font-sans cursor-pointer"
          >
            <option value="fleet_manager">Fleet Manager (Full Fleet & Shop Control)</option>
            <option value="driver_user">Dispatcher / Driver (Trip Dispatch & Logs)</option>
            <option value="safety_officer">Safety Officer (Driver Compliance & Scores)</option>
            <option value="financial_analyst">Financial Analyst (Fuel, Expenses & ROI)</option>
          </select>
          {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm transition shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
        >
          {isRegistering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create TransitOps Account</span>
            </>
          )}
        </button>

        {/* Navigation to Sign In */}
        <div className="pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-amber-500 hover:text-amber-400 font-semibold underline underline-offset-4 ml-1 transition"
            >
              Sign In to Existing Account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
