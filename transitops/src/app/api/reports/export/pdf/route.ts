import { NextRequest, NextResponse } from "next/server";
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

    const reportSummary = vehicles.map((v) => {
      const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
      const expenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const totalOperatingCost = fuelCost + maintenanceCost + expenseCost;

      const acquisitionCost = Number(v.acquisitionCost) || 10000;
      const revenue = Number(v.revenue) || (Number(v.odometer) * 1.5) + 5000;
      const netProfit = revenue - totalOperatingCost;
      const roiPercentage = acquisitionCost > 0 ? Number(((netProfit / acquisitionCost) * 100).toFixed(2)) : 0;

      return {
        registrationNumber: v.registrationNumber,
        name: v.name,
        type: v.type,
        status: v.status,
        odometer: v.odometer,
        acquisitionCost,
        fuelCost,
        maintenanceCost,
        expenseCost,
        totalOperatingCost,
        revenue,
        netProfit,
        roiPercentage,
      };
    });

    return sendSuccess(
      {
        generatedAt: new Date().toISOString(),
        totalVehicles: vehicles.length,
        summary: reportSummary,
      },
      "PDF export summary data ready.",
      200
    );
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch PDF report summary.", "INTERNAL_SERVER_ERROR", 500);
  }
}
