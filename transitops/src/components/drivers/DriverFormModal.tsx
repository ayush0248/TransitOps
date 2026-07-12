"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Driver, useCreateDriver, useUpdateDriver } from "@/hooks/useDrivers";
import { X, Loader2, UserPlus, Save, ShieldCheck } from "lucide-react";

// Local schema for form string formatting before API transform
const driverFormSchema = z.object({
  name: z.string().min(2, "Driver name is required (min 2 characters)"),
  licenseNumber: z.string().min(3, "Unique license number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiryDate: z.string().min(10, "License expiry date is required (YYYY-MM-DD)"),
  contactNumber: z.string().optional(),
  safetyScore: z.coerce.number().min(0).max(100),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]),
});

type DriverFormInput = z.infer<typeof driverFormSchema>;

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverToEdit?: Driver | null;
}

export function DriverFormModal({ isOpen, onClose, driverToEdit }: DriverFormModalProps) {
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();

  const isEditing = !!driverToEdit;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormInput>({
    resolver: zodResolver(driverFormSchema) as any,
    defaultValues: {
      name: "",
      licenseNumber: "",
      licenseCategory: "HMV - Heavy Motor Vehicle",
      licenseExpiryDate: new Date(Date.now() + 31536000000).toISOString().split("T")[0], // +1 year default
      contactNumber: "",
      safetyScore: 100,
      status: "available",
    },
  });

  useEffect(() => {
    if (driverToEdit) {
      reset({
        name: driverToEdit.name,
        licenseNumber: driverToEdit.licenseNumber,
        licenseCategory: driverToEdit.licenseCategory,
        licenseExpiryDate: new Date(driverToEdit.licenseExpiryDate).toISOString().split("T")[0],
        contactNumber: driverToEdit.contactNumber || "",
        safetyScore: driverToEdit.safetyScore,
        status: driverToEdit.status,
      });
    } else {
      reset({
        name: "",
        licenseNumber: "",
        licenseCategory: "HMV - Heavy Motor Vehicle",
        licenseExpiryDate: new Date(Date.now() + 31536000000).toISOString().split("T")[0],
        contactNumber: "",
        safetyScore: 100,
        status: "available",
      });
    }
  }, [driverToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: DriverFormInput) => {
    try {
      if (isEditing && driverToEdit) {
        await updateMutation.mutateAsync({
          id: driverToEdit.id,
          data: {
            name: data.name,
            licenseNumber: data.licenseNumber,
            licenseCategory: data.licenseCategory,
            licenseExpiryDate: data.licenseExpiryDate,
            contactNumber: data.contactNumber || undefined,
            safetyScore: data.safetyScore,
            status: data.status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          licenseNumber: data.licenseNumber,
          licenseCategory: data.licenseCategory,
          licenseExpiryDate: data.licenseExpiryDate,
          contactNumber: data.contactNumber || undefined,
          safetyScore: data.safetyScore,
          status: data.status,
        });
      }
      onClose();
    } catch (e) {
      // Error is caught and shown by toast in hook mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-serif">
                {isEditing ? `Edit Driver Profile: ${driverToEdit.name}` : "Register New Driver Profile"}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {isEditing ? "Modify license compliance, scores, or status" : "Add driver to transport compliance database"}
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Driver Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Driver Full Name *
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Unique License Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                License Number (Unique) *
              </label>
              <input
                {...register("licenseNumber")}
                type="text"
                placeholder="e.g. DL-14201100123"
                disabled={isEditing} // License number should stay consistent once created
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase"
              />
              {errors.licenseNumber && <p className="text-xs text-red-400">{errors.licenseNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* License Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                License Category *
              </label>
              <select
                {...register("licenseCategory")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="HMV - Heavy Motor Vehicle">HMV - Heavy Motor Vehicle</option>
                <option value="LMV - Light Motor Vehicle">LMV - Light Motor Vehicle</option>
                <option value="HAZMAT - Hazardous Cargo">HAZMAT - Hazardous Cargo</option>
                <option value="MCWG - Two Wheeler">MCWG - Two Wheeler</option>
                <option value="Universal Commercial">Universal Commercial</option>
              </select>
              {errors.licenseCategory && <p className="text-xs text-red-400">{errors.licenseCategory.message}</p>}
            </div>

            {/* License Expiry Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                License Expiry Date *
              </label>
              <input
                {...register("licenseExpiryDate")}
                type="date"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              {errors.licenseExpiryDate && <p className="text-xs text-red-400">{errors.licenseExpiryDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Contact Number
              </label>
              <input
                {...register("contactNumber")}
                type="text"
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              {errors.contactNumber && <p className="text-xs text-red-400">{errors.contactNumber.message}</p>}
            </div>

            {/* Safety Score Gauge/Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
                <span>Safety Score (0-100)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              </label>
              <input
                {...register("safetyScore")}
                type="number"
                min="0"
                max="100"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
              {errors.safetyScore && <p className="text-xs text-red-400">{errors.safetyScore.message}</p>}
            </div>
          </div>

          {/* Operational Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono flex items-center justify-between">
              <span>Operational Status *</span>
              {isEditing && driverToEdit?.status === "on_trip" && (
                <span className="text-[10px] text-amber-400 font-normal">Locked (Driver currently On Trip)</span>
              )}
            </label>
            <select
              {...register("status")}
              disabled={isEditing && driverToEdit?.status === "on_trip"}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="available">Available (Active & Ready for Dispatch)</option>
              <option value="on_trip" disabled={!isEditing}>On Trip (Assigned to Active Trip)</option>
              <option value="off_duty">Off Duty (Currently Off Shift)</option>
              <option value="suspended">Suspended (Blocked from All Dispatches by Safety Officer)</option>
            </select>
            {errors.status && <p className="text-xs text-red-400">{errors.status.message}</p>}
          </div>

          {/* Business Rule Notice Note */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Safety Compliance Rule Enforcement:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Drivers marked as <strong className="text-red-400 font-mono">Suspended</strong> or whose <strong className="text-red-400 font-mono">License Expiry Date</strong> has passed will be automatically rejected by the Dispatch state machine during trip allocation (`POST /api/trips/:id/dispatch`).
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm font-bold transition shadow-lg shadow-amber-600/25 flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Update Driver Profile" : "Register Driver Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
