"use client";

import { Vehicle } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

const statusColor = {
  available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  on_trip: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  in_shop: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  retired: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

interface Props {
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export const getVehicleColumns = ({
  onEdit,
  onDelete,
}: Props): ColumnDef<Vehicle>[] => [
  {
    accessorKey: "registrationNumber",
    header: "Registration",
  },
  {
    accessorKey: "name",
    header: "Vehicle",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "maxLoadCapacity",
    header: "Capacity (kg)",
  },
  {
    accessorKey: "odometer",
    header: "Odometer",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={statusColor[row.original.status]}
        variant="outline"
      >
        {row.original.status.replace("_", " ").toUpperCase()}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onEdit(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];