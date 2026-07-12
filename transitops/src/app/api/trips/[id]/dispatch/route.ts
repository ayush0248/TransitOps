import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "driver_user" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Dispatchers or Fleet Managers can dispatch trips.", "FORBIDDEN", 403);
    }

    // We use a Prisma interactive transaction to guarantee atomicity across Trip, Vehicle, and Driver
    const dispatchedTrip = await db.$transaction(async (tx) => {
      // 1. Fetch trip along with current vehicle and driver state inside transaction lock
      const trip = await tx.trip.findUnique({
        where: { id: params.id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new Error("TRIP_NOT_FOUND");
      }

      // 2. Validate Trip Lifecycle Status
      if (trip.status !== "draft") {
        throw new Error(`TRIP_ALREADY_${trip.status.toUpperCase()}`);
      }

      // 3. Validate Cargo Weight vs Vehicle Capacity
      const cargoNum = Number(trip.cargoWeight);
      const capNum = Number(trip.vehicle.maxLoadCapacity);
      if (cargoNum > capNum) {
        throw new Error(`CARGO_EXCEEDS_CAPACITY:${cargoNum}:${capNum}:${trip.vehicle.registrationNumber}`);
      }

      // 4. Validate Vehicle Availability (Must not be On Trip, In Shop, or Retired)
      if (trip.vehicle.status !== "available") {
        throw new Error(`VEHICLE_UNAVAILABLE:${trip.vehicle.registrationNumber}:${trip.vehicle.status}`);
      }

      // 5. Validate Driver Availability (Must not be On Trip, Off Duty, or Suspended)
      if (trip.driver.status !== "available") {
        throw new Error(`DRIVER_UNAVAILABLE:${trip.driver.name}:${trip.driver.status}`);
      }

      // 6. Validate Driver License Expiry Date
      const now = new Date();
      if (new Date(trip.driver.licenseExpiryDate) < now) {
        throw new Error(`LICENSE_EXPIRED:${trip.driver.name}:${trip.driver.licenseNumber}`);
      }

      // 7. Execute atomic status updates
      // Update Vehicle -> on_trip
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "on_trip" },
      });

      // Update Driver -> on_trip
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "on_trip" },
      });

      // Update Trip -> dispatched
      const updatedTrip = await tx.trip.update({
        where: { id: trip.id },
        data: { status: "dispatched" },
        include: { vehicle: true, driver: true },
      });

      return updatedTrip;
    });

    return sendSuccess(dispatchedTrip, "Trip dispatched successfully! Vehicle and Driver are now marked On Trip.", 200);
  } catch (error: any) {
    const msg = error.message || "Dispatch failed.";

    if (msg === "TRIP_NOT_FOUND") {
      return sendError("Trip not found.", "NOT_FOUND", 404);
    }
    if (msg.startsWith("TRIP_ALREADY_")) {
      const status = msg.replace("TRIP_ALREADY_", "");
      return sendError(`Cannot dispatch trip because it is already ${status}.`, "TRIP_INVALID_STATE", 400);
    }
    if (msg.startsWith("CARGO_EXCEEDS_CAPACITY:")) {
      const parts = msg.split(":");
      return sendError(`Cargo weight (${parts[1]} kg) exceeds vehicle ${parts[3]} capacity (${parts[2]} kg).`, "CAPACITY_EXCEEDED", 400);
    }
    if (msg.startsWith("VEHICLE_UNAVAILABLE:")) {
      const parts = msg.split(":");
      return sendError(`Assigned vehicle ${parts[1]} cannot be dispatched because its status is currently ${parts[2].toUpperCase()}.`, "VEHICLE_UNAVAILABLE", 400);
    }
    if (msg.startsWith("DRIVER_UNAVAILABLE:")) {
      const parts = msg.split(":");
      return sendError(`Assigned driver ${parts[1]} cannot be dispatched because their status is currently ${parts[2].toUpperCase()}.`, "DRIVER_UNAVAILABLE", 400);
    }
    if (msg.startsWith("LICENSE_EXPIRED:")) {
      const parts = msg.split(":");
      return sendError(`Assigned driver ${parts[1]} (${parts[2]}) has an expired driving license. Safety rule prohibits dispatch.`, "LICENSE_EXPIRED", 400);
    }

    return sendError(msg, "DISPATCH_ERROR", 500);
  }
}
