import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingLog = await db.maintenanceLog.findUnique({
      where: { id: params.id },
    });

    if (!existingLog) {
      return sendError("Maintenance ticket not found.", "NOT_FOUND", 404);
    }

    if (existingLog.status === "closed") {
      return sendError("Maintenance ticket is already closed.", "ALREADY_CLOSED", 400);
    }

    const closedLog = await db.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.update({
        where: { id: params.id },
        data: {
          status: "closed",
          closedAt: new Date(),
        },
      });

      await tx.vehicle.update({
        where: { id: existingLog.vehicleId },
        data: { status: "available" },
      });

      return log;
    });

    return sendSuccess(closedLog, "Maintenance ticket closed. Vehicle restored to Available.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to close maintenance ticket.", "INTERNAL_SERVER_ERROR", 500);
  }
}
