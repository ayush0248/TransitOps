import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";

const completeSchema = z.object({
  actualDistance: z.number().nonnegative().optional(),
  fuelConsumed: z.number().nonnegative().optional(),
  fuelCost: z.number().nonnegative().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "driver_user" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Dispatchers or Fleet Managers can complete trips.", "FORBIDDEN", 403);
    }

    const body = await request.json().catch(() => ({}));
    const validationResult = completeSchema.safeParse(body);

    if (!validationResult.success) {
      return sendError("Invalid completion metrics provided.", "VALIDATION_ERROR", 400);
    }

    const { actualDistance, fuelConsumed, fuelCost } = validationResult.data;

    const completedTrip = await db.$transaction(async (tx) => {
      // 1. Fetch trip inside transaction
      const trip = await tx.trip.findUnique({
        where: { id: params.id },
        include: { vehicle: true, driver: true },
      });

      if (!trip) {
        throw new Error("TRIP_NOT_FOUND");
      }

      if (trip.status !== "dispatched") {
        throw new Error(`TRIP_NOT_DISPATCHED:${trip.status}`);
      }

      const distanceToAdd = actualDistance || Number(trip.plannedDistance) || 0;

      // 2. Update Trip status -> completed
      const updatedTrip = await tx.trip.update({
        where: { id: trip.id },
        data: {
          status: "completed",
          completedAt: new Date(),
          actualDistance: distanceToAdd,
          fuelConsumed: fuelConsumed || null,
        },
        include: { vehicle: true, driver: true },
      });

      // 3. Restore Vehicle -> available & increment odometer
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: "available",
          odometer: {
            increment: distanceToAdd,
          },
        },
      });

      // 4. Restore Driver -> available
      await tx.driver.update({
        where: { id: trip.driverId },
        data: {
          status: "available",
        },
      });

      // 5. If fuel consumed & fuel cost provided, log fuel consumption automatically
      if (fuelConsumed && fuelCost && fuelConsumed > 0 && fuelCost > 0) {
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            tripId: trip.id,
            liters: fuelConsumed,
            cost: fuelCost,
            date: new Date(),
          },
        });
      }

      return updatedTrip;
    });

    return sendSuccess(
      completedTrip,
      "Trip marked as Completed! Vehicle and Driver restored to available. Odometer updated.",
      200
    );
  } catch (error: any) {
    const msg = error.message || "Failed to complete trip.";
    if (msg === "TRIP_NOT_FOUND") {
      return sendError("Trip not found.", "NOT_FOUND", 404);
    }
    if (msg.startsWith("TRIP_NOT_DISPATCHED:")) {
      const status = msg.split(":")[1];
      return sendError(`Cannot complete trip because current state is ${status.toUpperCase()}. Only DISPATCHED trips can be completed.`, "TRIP_INVALID_STATE", 400);
    }
    return sendError(msg, "COMPLETION_ERROR", 500);
  }
}
