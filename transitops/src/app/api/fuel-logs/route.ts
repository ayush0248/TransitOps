import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { fuelLogSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const logs = await db.fuelLog.findMany({
      include: { vehicle: true, trip: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return sendSuccess(logs, "Fuel logs retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch fuel logs.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = fuelLogSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const newLog = await db.fuelLog.create({
      data: validationResult.data,
    });

    return sendSuccess(newLog, "Fuel log recorded successfully.", 201);
  } catch (error: any) {
    return sendError(error.message || "Failed to record fuel log.", "INTERNAL_SERVER_ERROR", 500);
  }
}
