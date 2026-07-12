"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import VehicleForm from "./vehicle-form";
import { Vehicle, VehicleFormValues } from "@/types/types";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  initialData?: Vehicle | null;

  onSubmit: (data: VehicleFormValues) => void;

  isLoading?: boolean;
}

export default function VehicleDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: VehicleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-zinc-950 border border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {initialData ? "Edit Vehicle" : "Register Vehicle"}
          </DialogTitle>
        </DialogHeader>

        <VehicleForm
          initialData={initialData}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}