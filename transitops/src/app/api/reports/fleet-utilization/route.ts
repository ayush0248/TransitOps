import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const vehicles = await db.vehicle.findMany().catch(() => []);
    
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "on_trip").length;
    const availableVehicles = vehicles.filter((v) => v.status === "available").length;
    const inShopVehicles = vehicles.filter((v) => v.status === "in_shop").length;
    const retiredVehicles = vehicles.filter((v) => v.status === "retired").length;

    const activeOrAvailable = activeVehicles + availableVehicles;
    const utilizationPercentage = activeOrAvailable > 0
      ? Number(((activeVehicles / activeOrAvailable) * 100).toFixed(2))
      : 0;

    // Breakdown by Type
    const byTypeMap: Record<string, { total: number; active: number; utilization: number }> = {};
    vehicles.forEach((v) => {
      if (!byTypeMap[v.type]) {
        byTypeMap[v.type] = { total: 0, active: 0, utilization: 0 };
      }
      byTypeMap[v.type].total += 1;
      if (v.status === "on_trip") {
        byTypeMap[v.type].active += 1;
      }
    });

    Object.keys(byTypeMap).forEach((type) => {
      const { total, active } = byTypeMap[type];
      byTypeMap[type].utilization = total > 0 ? Number(((active / total) * 100).toFixed(2)) : 0;
    });

    return sendSuccess(
      {
        totalVehicles,
        activeVehicles,
        availableVehicles,
        inShopVehicles,
        retiredVehicles,
        utilizationPercentage,
        byType: byTypeMap,
      },
      "Fleet utilization report retrieved successfully.",
      200
    );
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch fleet utilization report.", "INTERNAL_SERVER_ERROR", 500);
  }
}
