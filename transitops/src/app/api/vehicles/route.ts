import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { vehicleSchema } from "@/lib/validations";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const vehicles = await db.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return sendSuccess(vehicles, "Vehicles retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch vehicles.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== "fleet_manager") {
      return sendError("Forbidden. Only Fleet Managers can register new vehicles.", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const validationResult = vehicleSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const newVehicle = await db.vehicle.create({
      data: validationResult.data,
    });

    return sendSuccess(newVehicle, "Vehicle registered successfully.", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError("Vehicle registration number already exists.", "DUPLICATE_REGISTRATION", 409);
    }
    return sendError(error.message || "Failed to create vehicle.", "INTERNAL_SERVER_ERROR", 500);
  }
}
