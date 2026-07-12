"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateUser, CreateUserPayload } from "@/hooks/useUsers";
import { X, Loader2, UserPlus, ShieldCheck } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["fleet_manager", "driver_user", "safety_officer", "financial_analyst"]),
});

type UserFormInput = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserFormModal({ isOpen, onClose }: UserFormModalProps) {
  const createMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "safety_officer",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        email: "",
        password: "",
        role: "safety_officer",
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: UserFormInput) => {
    try {
      await createMutation.mutateAsync(data as CreateUserPayload);
      onClose();
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-serif">
                Register
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Create internal access credentials and assign role scope.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Full Name *
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Email Address *
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="name@transitops.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex justify-between items-center">
              <span>Temporary Password *</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
              Role / Access Scope *
            </label>
            <select
              {...register("role")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="fleet_manager">{ROLE_LABELS["fleet_manager"]}</option>
              <option value="safety_officer">{ROLE_LABELS["safety_officer"]}</option>
              <option value="financial_analyst">{ROLE_LABELS["financial_analyst"]}</option>
              <option value="driver_user">{ROLE_LABELS["driver_user"]}</option>
            </select>
            {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold transition shadow-lg shadow-amber-600/25 flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
