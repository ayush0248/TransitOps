import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../services/vehicle.service";
import { VehicleListResponse } from "@/types/types";

export const useVehicles = (params?: any) => {
  return useQuery<VehicleListResponse>({
    queryKey: ["vehicles", params],
    queryFn: () => getVehicles(params),
  });
};