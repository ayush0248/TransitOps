"use client";

import { useMemo, useState } from "react";
import { Car, Plus } from "lucide-react";

import VehicleTable from "./_components/vehicle-table";
import VehicleDialog from "./_components/vehicle-dialog";
import VehicleDeleteDialog from "./_components/vehicle-delete-dialog";

import { Vehicle, VehicleFormValues } from "@/types/types";

import { useVehicles } from "@/hooks/useVehicles";
import { useCreateVehicle } from "@/hooks/useCreateVehicle";
import { useUpdateVehicle } from "@/hooks/useUpdateVehicle";
import { useDeleteVehicle } from "@/hooks/useDeleteVehicle";

export default function VehiclesPage() {
  const { data, vehicles: vehiclesList = [], isLoading } = useVehicles();

  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const vehicles: Vehicle[] = Array.isArray(vehiclesList) && vehiclesList.length > 0
    ? vehiclesList
    : (Array.isArray(data) ? data : (data?.vehicles ?? []));


  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedVehicle, setSelectedVehicle] =
    useState<Vehicle | null>(null);

  const [search, setSearch] = useState("");



const filteredVehicles = vehicles.filter((vehicle) => {
  return (
    vehicle.registrationNumber
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    vehicle.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );
});

  function handleCreate() {
    setSelectedVehicle(null);
    setDialogOpen(true);
  }

  function handleEdit(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  }

  function handleDelete(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setDeleteOpen(true);
  }

  async function handleSubmit(values: VehicleFormValues) {
    if (selectedVehicle) {
      await updateVehicle.mutateAsync({
        id: selectedVehicle.id,
        payload: values,
      });
    } else {
      await createVehicle.mutateAsync(values);
    }

    setDialogOpen(false);
    setSelectedVehicle(null);
  }

  async function confirmDelete() {
    if (!selectedVehicle) return;

    await deleteVehicle.mutateAsync(selectedVehicle.id);

    setDeleteOpen(false);
    setSelectedVehicle(null);
  }

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-white">
            Fleet Vehicles
          </h1>

          <p className="text-zinc-400 mt-1">
            Manage all registered fleet vehicles.
          </p>

        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-3 font-semibold text-white"
        >
          <Plus className="w-5 h-5" />
          Add Vehicle
        </button>

      </div>

      {/* Search */}

      <input
        placeholder="Search by registration or vehicle..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white"
      />

      {/* Table */}

      {isLoading ? (

        <div className="rounded-xl border border-zinc-800 p-10 text-center text-zinc-400">
          Loading vehicles...
        </div>

      ) : filteredVehicles.length ? (

        <VehicleTable
          vehicles={filteredVehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      ) : (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-16">

          <div className="flex flex-col items-center">

            <div className="rounded-full bg-amber-500/10 p-5">
              <Car className="h-10 w-10 text-amber-500" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">
              No Vehicles Found
            </h3>

            <p className="mt-2 text-zinc-400">
              Register your first vehicle to begin fleet operations.
            </p>

          </div>

        </div>

      )}

      {/* Create/Edit */}

      <VehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedVehicle}
        onSubmit={handleSubmit}
        isLoading={
          createVehicle.isPending ||
          updateVehicle.isPending
        }
      />

      {/* Delete */}

      <VehicleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        loading={deleteVehicle.isPending}
      />

    </div>
  );
}