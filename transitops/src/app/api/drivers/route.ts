import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { driverSchema } from "@/lib/validations";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return sendSuccess(drivers, "Drivers retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch drivers.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "safety_officer" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Safety Officers or Fleet Managers can register new drivers.", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const validationResult = driverSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const newDriver = await db.driver.create({
      data: validationResult.data,
    });

    return sendSuccess(newDriver, "Driver registered successfully.", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError("Driver license number already registered.", "DUPLICATE_LICENSE", 409);
    }
    return sendError(error.message || "Failed to create driver.", "INTERNAL_SERVER_ERROR", 500);
  }
}
