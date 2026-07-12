import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicle } from "../services/vehicle.service";
import { toast } from "sonner";

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicle,

    onSuccess: () => {
      toast.success("Vehicle registered successfully.");

      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to register vehicle.");
    },
  });
};