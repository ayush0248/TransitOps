import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";

const tripUpdateSchema = z.object({
  source: z.string().min(2).optional(),
  destination: z.string().min(2).optional(),
  cargoWeight: z.number().positive().optional(),
  plannedDistance: z.number().positive().optional(),
});

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await db.trip.findUnique({
      where: { id: params.id },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (!trip) {
      return sendError("Trip not found.", "NOT_FOUND", 404);
    }

    return sendSuccess(trip, "Trip retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch trip details.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "driver_user" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Dispatchers or Fleet Managers can modify trips.", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const validationResult = tripUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const existingTrip = await db.trip.findUnique({
      where: { id: params.id },
      include: { vehicle: true },
    });

    if (!existingTrip) {
      return sendError("Trip not found.", "NOT_FOUND", 404);
    }

    // Business rule: Can only modify trip details while in 'draft' state
    if (existingTrip.status !== "draft") {
      return sendError(
        `Cannot edit trip details once trip is ${existingTrip.status.toUpperCase()}. Use state transitions instead.`,
        "TRIP_LOCKED",
        400
      );
    }

    // Check cargo weight vs vehicle capacity if cargoWeight is updated
    if (validationResult.data.cargoWeight) {
      const maxCap = Number(existingTrip.vehicle.maxLoadCapacity);
      if (validationResult.data.cargoWeight > maxCap) {
        return sendError(
          `Cargo weight (${validationResult.data.cargoWeight} kg) exceeds maximum load capacity (${maxCap} kg) of assigned vehicle ${existingTrip.vehicle.registrationNumber}.`,
          "CAPACITY_EXCEEDED",
          400
        );
      }
    }

    const updatedTrip = await db.trip.update({
      where: { id: params.id },
      data: validationResult.data,
      include: { vehicle: true, driver: true },
    });

    return sendSuccess(updatedTrip, "Trip updated successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to update trip.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "driver_user" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Dispatchers or Fleet Managers can delete trips.", "FORBIDDEN", 403);
    }

    const existingTrip = await db.trip.findUnique({
      where: { id: params.id },
    });

    if (!existingTrip) {
      return sendError("Trip not found.", "NOT_FOUND", 404);
    }

    if (existingTrip.status === "dispatched") {
      return sendError(
        "Cannot delete an active dispatched trip. Please complete or cancel the trip first to release assigned vehicle and driver.",
        "TRIP_ACTIVE",
        400
      );
    }

    await db.trip.delete({
      where: { id: params.id },
    });

    return sendSuccess(null, "Trip deleted successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to delete trip.", "INTERNAL_SERVER_ERROR", 500);
  }
}
