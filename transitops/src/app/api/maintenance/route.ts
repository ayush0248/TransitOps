import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { maintenanceSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const logs = await db.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return sendSuccess(logs, "Maintenance logs retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch maintenance logs.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = maintenanceSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const newLog = await db.maintenanceLog.create({
      data: validationResult.data,
    });

    return sendSuccess(newLog, "Maintenance log created successfully.", 201);
  } catch (error: any) {
    return sendError(error.message || "Failed to create maintenance log.", "INTERNAL_SERVER_ERROR", 500);
  }
}
