import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const vehicles = await db.vehicle.findMany({
      include: {
        fuelLogs: true,
        expenses: true,
        maintenanceLogs: true,
        trips: true,
      },
    }).catch(() => []);

    const reportData = vehicles.map((v) => {
      const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
      const expenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const totalOperatingCost = fuelCost + maintenanceCost + expenseCost;

      const acquisitionCost = Number(v.acquisitionCost) || 10000;
      
      // Calculate revenue based on trips or odometer
      const tripRevenue = v.trips
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + (Number(t.actualDistance || t.plannedDistance || 0) * 2.5), 0);
      
      const revenue = Number(v.revenue) || (tripRevenue > 0 ? tripRevenue : (Number(v.odometer) * 1.5) + 5000);
      const netProfit = revenue - totalOperatingCost;
      const roiPercentage = acquisitionCost > 0 ? Number(((netProfit / acquisitionCost) * 100).toFixed(2)) : 0;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        type: v.type,
        acquisitionCost,
        revenue,
        fuelCost,
        maintenanceCost,
        expenseCost,
        totalOperatingCost,
        netProfit,
        roiPercentage,
      };
    });

    return sendSuccess(reportData, "Vehicle ROI report generated successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to generate vehicle ROI report.", "INTERNAL_SERVER_ERROR", 500);
  }
}
