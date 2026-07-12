import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { driverSchema } from "@/lib/validations";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";

const driverUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  licenseNumber: z.string().min(3).optional(),
  licenseCategory: z.string().min(1).optional(),
  licenseExpiryDate: z.string().transform((str) => new Date(str)).optional(),
  contactNumber: z.string().optional(),
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driver = await db.driver.findUnique({
      where: { id: params.id },
      include: {
        trips: {
          include: { vehicle: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!driver) {
      return sendError("Driver not found.", "NOT_FOUND", 404);
    }

    return sendSuccess(driver, "Driver retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch driver.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "safety_officer" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Safety Officers or Fleet Managers can modify driver profiles.", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const validationResult = driverUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    // Check if driver exists
    const existingDriver = await db.driver.findUnique({
      where: { id: params.id },
    });

    if (!existingDriver) {
      return sendError("Driver not found.", "NOT_FOUND", 404);
    }

    // Business rule: if driver is currently on_trip, cannot change status to off_duty or suspended
    if (
      existingDriver.status === "on_trip" &&
      validationResult.data.status &&
      validationResult.data.status !== "on_trip"
    ) {
      return sendError("Cannot change status of a driver currently On Trip.", "DRIVER_BUSY", 400);
    }

    const updatedDriver = await db.driver.update({
      where: { id: params.id },
      data: validationResult.data,
    });

    return sendSuccess(updatedDriver, "Driver updated successfully.", 200);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError("License number already registered.", "DUPLICATE_LICENSE", 409);
    }
    return sendError(error.message || "Failed to update driver.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "safety_officer" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Safety Officers or Fleet Managers can delete driver profiles.", "FORBIDDEN", 403);
    }

    const existingDriver = await db.driver.findUnique({
      where: { id: params.id },
    });

    if (!existingDriver) {
      return sendError("Driver not found.", "NOT_FOUND", 404);
    }

    if (existingDriver.status === "on_trip") {
      return sendError("Cannot delete a driver currently assigned to an active trip.", "DRIVER_BUSY", 400);
    }

    await db.driver.delete({
      where: { id: params.id },
    });

    return sendSuccess(null, "Driver deleted successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to delete driver.", "INTERNAL_SERVER_ERROR", 500);
  }
}
