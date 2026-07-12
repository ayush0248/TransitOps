import { useQuery } from "@tanstack/react-query";
import { getVehicles } from "../services/vehicle.service";
import { VehicleListResponse, Vehicle } from "@/types/types";

export const useVehicles = (params?: any) => {
  const query = useQuery<VehicleListResponse>({
    queryKey: ["vehicles", params],
    queryFn: () => getVehicles(params),
  });

  const vehicles: Vehicle[] = query.data?.vehicles ?? (Array.isArray(query.data) ? (query.data as unknown as Vehicle[]) : []);

  return {
    ...query,
    vehicles,
  };
};