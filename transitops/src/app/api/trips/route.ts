import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { tripSchema } from "@/lib/validations";

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
    const body = await request.json();
    const validationResult = tripSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const newTrip = await db.trip.create({
      data: validationResult.data,
    });

    return sendSuccess(newTrip, "Trip created successfully.", 201);
  } catch (error: any) {
    return sendError(error.message || "Failed to create trip.", "INTERNAL_SERVER_ERROR", 500);
  }
}
