"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Vehicle, VehicleFormValues } from "@/types/types";

interface Props {
  initialData?: Vehicle | null;
  onSubmit: (data: VehicleFormValues) => void;
  isLoading?: boolean;
}

const defaultValues: VehicleFormValues = {
  registrationNumber: "",
  name: "",
  model: "",
  type: "",
  maxLoadCapacity: 0,
  odometer: 0,
  acquisitionCost: 0,
  revenue: 0,
  region: "",
  status: "available",
};

export default function VehicleForm({
  initialData,
  onSubmit,
  isLoading,
}: Props) {
  const { register, handleSubmit, reset } = useForm<VehicleFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        registrationNumber: initialData.registrationNumber,
        name: initialData.name,
        model: initialData.model || "",
        type: initialData.type,
        maxLoadCapacity: initialData.maxLoadCapacity,
        odometer: initialData.odometer,
        acquisitionCost: initialData.acquisitionCost,
        revenue: initialData.revenue,
        region: initialData.region || "",
        status: initialData.status,
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="text-sm text-zinc-300">
            Registration Number
          </label>

          <input
            {...register("registrationNumber")}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Vehicle Name
          </label>

          <input
            {...register("name")}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Model
          </label>

          <input
            {...register("model")}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Vehicle Type
          </label>

          <input
            {...register("type")}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Max Load Capacity
          </label>

          <input
            type="number"
            {...register("maxLoadCapacity", {
              valueAsNumber: true,
            })}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Odometer
          </label>

          <input
            type="number"
            {...register("odometer", {
              valueAsNumber: true,
            })}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Acquisition Cost
          </label>

          <input
            type="number"
            {...register("acquisitionCost", {
              valueAsNumber: true,
            })}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Revenue
          </label>

          <input
            type="number"
            {...register("revenue", {
              valueAsNumber: true,
            })}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Region
          </label>

          <input
            {...register("region")}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Status
          </label>

          <select
            {...register("status")}
            className="mt-2 w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5"
          >
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={isLoading}
          className="rounded-xl bg-amber-600 hover:bg-amber-500 px-6 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {initialData ? "Update Vehicle" : "Register Vehicle"}
        </button>
      </div>
    </form>
  );
}