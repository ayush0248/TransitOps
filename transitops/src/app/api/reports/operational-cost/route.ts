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
      const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
      const expenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const totalOperationalCost = fuelCost + maintenanceCost + expenseCost;

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: v.name,
        type: v.type,
        status: v.status,
        fuelCost,
        maintenanceCost,
        expenseCost,
        totalOperationalCost,
      };
    });

    const overallTotal = reportData.reduce((sum, item) => sum + item.totalOperationalCost, 0);

    return sendSuccess(
      {
        vehicles: reportData,
        overallTotalOperationalCost: overallTotal,
      },
      "Operational cost report generated successfully.",
      200
    );
  } catch (error: any) {
    return sendError(error.message || "Failed to generate operational cost report.", "INTERNAL_SERVER_ERROR", 500);
  }
}
