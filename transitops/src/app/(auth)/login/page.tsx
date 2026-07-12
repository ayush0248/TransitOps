"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import { useAuth } from "@/providers/AuthProvider";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AlertCircle, Check, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "driver_user",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMessage(null);
    try {
      await login(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Account locked after 5 failed attempts.");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access the portal."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">Authentication Failed</p>
              <p className="text-xs text-red-300/80 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 ml-1">
            Email Address
          </label>
          <div className="relative group">
            <input
              {...register("email")}
              type="email"
              placeholder="name@transitops.in"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm group-hover:bg-white/10"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1 pl-1">{errors.email.message}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 ml-1">
            Password
          </label>
          <div className="relative group">
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm group-hover:bg-white/10"
            />
          </div>
          {errors.password && <p className="text-xs text-red-400 mt-1 pl-1">{errors.password.message}</p>}
        </div>

        {/* Role Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-400 ml-1">
            Role (RBAC)
          </label>
          <div className="relative group">
            <select
              {...register("role")}
              className="w-full px-4 py-3 rounded-xl bg-[#1e1e21] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm appearance-none cursor-pointer group-hover:border-white/20"
            >
              <option value="fleet_manager">Fleet Manager</option>
              <option value="driver_user">Dispatcher / Driver</option>
              <option value="safety_officer">Safety Officer</option>
              <option value="financial_analyst">Financial Analyst</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-zinc-400" />
            </div>
          </div>
          {errors.role && <p className="text-xs text-red-400 mt-1 pl-1">{errors.role.message}</p>}
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-white transition cursor-pointer select-none group"
          >
            <div
              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                rememberMe
                  ? "bg-amber-500 border-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  : "border-zinc-600 bg-transparent group-hover:border-zinc-500"
              }`}
            >
              {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span className="text-xs font-medium">Keep me signed in</span>
          </label>
          <button type="button" className="text-xs text-amber-500 hover:text-amber-400 transition font-medium">
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 transform active:scale-[0.98]"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
