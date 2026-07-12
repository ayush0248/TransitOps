import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { tripSchema } from "@/lib/validations";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const trips = await db.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return sendSuccess(trips, "Trips retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch trips.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "driver_user" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Dispatchers or Fleet Managers can create trips.", "FORBIDDEN", 403);
    }

    const body = await request.json();
    body.createdById = authUser.id;
    const validationResult = tripSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const { vehicleId, driverId, cargoWeight } = validationResult.data;

    // 1. Verify Vehicle exists and is available
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return sendError("Selected vehicle does not exist.", "NOT_FOUND", 404);
    }
    if (vehicle.status !== "available") {
      return sendError(
        `Cannot assign vehicle [${vehicle.registrationNumber}]. It is currently ${vehicle.status.toUpperCase()}. Only available vehicles can be assigned to trips.`,
        "VEHICLE_UNAVAILABLE",
        400
      );
    }
    if (Number(cargoWeight) > Number(vehicle.maxLoadCapacity)) {
      return sendError(
        `Cargo weight (${cargoWeight} kg) exceeds vehicle [${vehicle.registrationNumber}] maximum load capacity (${vehicle.maxLoadCapacity} kg).`,
        "CAPACITY_EXCEEDED",
        400
      );
    }

    // 2. Verify Driver exists, is available, and license is not expired
    const driver = await db.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      return sendError("Selected driver does not exist.", "NOT_FOUND", 404);
    }
    if (driver.status !== "available") {
      return sendError(
        `Cannot assign driver [${driver.name}]. They are currently ${driver.status.toUpperCase()}. Suspended, Off Duty, or On Trip drivers cannot be assigned.`,
        "DRIVER_UNAVAILABLE",
        400
      );
    }
    if (new Date(driver.licenseExpiryDate) < new Date()) {
      return sendError(
        `Cannot assign driver [${driver.name}]. Their driving license expired on ${new Date(driver.licenseExpiryDate).toLocaleDateString()}.`,
        "LICENSE_EXPIRED",
        400
      );
    }

    const newTrip = await db.trip.create({
      data: validationResult.data,
    });

    return sendSuccess(newTrip, "Trip created successfully.", 201);
  } catch (error: any) {
    return sendError(error.message || "Failed to create trip.", "INTERNAL_SERVER_ERROR", 500);
  }
}
