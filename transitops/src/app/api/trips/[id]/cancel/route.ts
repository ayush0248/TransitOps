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
      return sendError("Forbidden. Only Dispatchers or Fleet Managers can cancel trips.", "FORBIDDEN", 403);
    }

    const cancelledTrip = await db.$transaction(async (tx) => {
      // 1. Fetch trip inside transaction
      const trip = await tx.trip.findUnique({
        where: { id: params.id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new Error("TRIP_NOT_FOUND");
      }

      if (trip.status === "completed" || trip.status === "cancelled") {
        throw new Error(`TRIP_ALREADY_${trip.status.toUpperCase()}`);
      }

      const wasDispatched = trip.status === "dispatched";

      // 2. Update Trip status -> cancelled
      const updatedTrip = await tx.trip.update({
        where: { id: trip.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
        include: { vehicle: true, driver: true },
      });

      // 3. If the trip was currently dispatched, restore Vehicle and Driver back to available
      if (wasDispatched) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: "available" },
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: "available" },
        });
      }

      return updatedTrip;
    });

    return sendSuccess(
      cancelledTrip,
      "Trip marked as Cancelled. Assigned vehicle and driver have been unlocked if previously dispatched.",
      200
    );
  } catch (error: any) {
    const msg = error.message || "Failed to cancel trip.";
    if (msg === "TRIP_NOT_FOUND") {
      return sendError("Trip not found.", "NOT_FOUND", 404);
    }
    if (msg.startsWith("TRIP_ALREADY_")) {
      const status = msg.replace("TRIP_ALREADY_", "");
      return sendError(`Cannot cancel trip because it is already ${status}.`, "TRIP_INVALID_STATE", 400);
    }
    return sendError(msg, "CANCELLATION_ERROR", 500);
  }
}
