import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVehicle } from "../services/vehicle.service";
import { toast } from "sonner";

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVehicle,

    onSuccess: () => {
      toast.success("Vehicle deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete vehicle.");
    },
  });
};