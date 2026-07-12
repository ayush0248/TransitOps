import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVehicle } from "../services/vehicle.service";
import { toast } from "sonner";

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: any;
    }) => updateVehicle(id, payload),

    onSuccess: () => {
      toast.success("Vehicle updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["vehicles"],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update vehicle.");
    },
  });
};