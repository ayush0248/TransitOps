import axios from "axios";
import { Vehicle, VehicleFormValues, VehicleListResponse } from "../types/types";


export const getVehicles = async (
  params?: any
): Promise<VehicleListResponse> => {
  const response = await axios.get("/api/vehicles", {
    params,
  });

  return response.data.data;
};

export const getVehicle = async (id: string): Promise<Vehicle> => {
  const { data } = await axios.get(`/api/vehicles/${id}`);

  return data.data;
};

export const createVehicle = async (
  payload: VehicleFormValues
): Promise<Vehicle> => {
  const { data } = await axios.post("/api/vehicles", payload);

  return data.data;
};

export const updateVehicle = async (
  id: string,
  payload: Partial<VehicleFormValues>
): Promise<Vehicle> => {
  const { data } = await axios.patch(`/api/vehicles/${id}`, payload);

  return data.data;
};

export const deleteVehicle = async (id: string) => {
  const { data } = await axios.delete(`/api/vehicles/${id}`);

  return data;
};