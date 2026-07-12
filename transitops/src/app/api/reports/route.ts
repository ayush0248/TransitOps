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
      },
    }).catch(() => []);

    const reportData = vehicles.map((v) => {
      const totalFuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const totalExpenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const totalMaintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
      const totalOperatingCost = totalFuelCost + totalExpenseCost + totalMaintenanceCost;

      const acquisitionCost = Number(v.acquisitionCost) || 10000;
      // Simulated revenue estimate based on odometer
      const estimatedRevenue = (Number(v.odometer) * 0.8) + 15000;
      const netProfit = estimatedRevenue - totalOperatingCost;
      const roiPercentage = acquisitionCost > 0 ? ((netProfit / acquisitionCost) * 100).toFixed(2) : "0.00";

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        type: v.type,
        odometer: v.odometer,
        totalFuelCost,
        totalExpenseCost,
        totalMaintenanceCost,
        totalOperatingCost,
        estimatedRevenue,
        netProfit,
        roiPercentage: Number(roiPercentage),
      };
    });

    return sendSuccess(reportData, "ROI and financial report generated successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to generate report.", "INTERNAL_SERVER_ERROR", 500);
  }
}
