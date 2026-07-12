import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const vehicles = await db.vehicle.findMany({
      include: {
        fuelLogs: true,
        trips: true,
      },
    }).catch(() => []);

    const reportData = vehicles.map((v) => {
      const totalLiters = v.fuelLogs.reduce((sum, log) => sum + Number(log.liters), 0);
      const totalFuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      
      // Calculate distance from completed trips or odometer
      const tripDistance = v.trips
        .filter((t) => t.status === "completed" || t.status === "dispatched")
        .reduce((sum, t) => sum + Number(t.actualDistance || t.plannedDistance || 0), 0);
      const distance = tripDistance > 0 ? tripDistance : Number(v.odometer) || 100;

      const efficiencyKmPerLiter = totalLiters > 0 ? Number((distance / totalLiters).toFixed(2)) : 0;
      const costPerKm = distance > 0 ? Number((totalFuelCost / distance).toFixed(2)) : 0;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        type: v.type,
        distance,
        totalLiters,
        totalFuelCost,
        efficiencyKmPerLiter,
        costPerKm,
      };
    });

    return sendSuccess(reportData, "Fuel efficiency report generated successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to generate fuel efficiency report.", "INTERNAL_SERVER_ERROR", 500);
  }
}
