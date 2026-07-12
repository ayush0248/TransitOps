import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeFilter = searchParams.get("type");
    const statusFilter = searchParams.get("status");
    const regionFilter = searchParams.get("region");

    const vehicleWhere: any = {};
    if (typeFilter && typeFilter !== "all") vehicleWhere.type = typeFilter;
    if (statusFilter && statusFilter !== "all") vehicleWhere.status = statusFilter;
    if (regionFilter && regionFilter !== "all") vehicleWhere.region = regionFilter;

    // We still want total vehicles globally for fleet utilization if we are filtering, 
    // but the filter might apply strictly to the subset. We'll apply filters to all vehicle aggregations.
    const [
      totalVehiclesCount,
      activeVehiclesCount,
      inShopVehiclesCount,
      activeTripsCount,
      pendingTripsCount,
      driversOnDutyCount,
      totalDriversCount,
      recentTrips,
      vehicleStatusGroups
    ] = await Promise.all([
      db.vehicle.count({ where: vehicleWhere }),
      db.vehicle.count({ where: { ...vehicleWhere, status: "on_trip" } }),
      db.vehicle.count({ where: { ...vehicleWhere, status: "in_shop" } }),
      db.trip.count({ where: { status: "dispatched", vehicle: vehicleWhere } }),
      db.trip.count({ where: { status: "draft", vehicle: vehicleWhere } }),
      db.driver.count({ where: { status: "on_trip" } }),
      db.driver.count({}),
      db.trip.findMany({
        where: { vehicle: vehicleWhere },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: { select: { registrationNumber: true } },
          driver: { select: { name: true } },
        },
      }),
      db.vehicle.groupBy({
        by: ["status"],
        where: vehicleWhere,
        _count: {
          status: true,
        },
      }),
    ]);

    const vehicleStatusCounts = {
      available: 0,
      on_trip: 0,
      in_shop: 0,
      retired: 0,
    };

    vehicleStatusGroups.forEach((group) => {
      vehicleStatusCounts[group.status] = group._count.status;
    });

    const fleetUtilization = totalVehiclesCount > 0 
      ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100) 
      : 0;

    return sendSuccess(
      {
        stats: {
          totalVehicles: totalVehiclesCount,
          activeVehicles: activeVehiclesCount,
          availableVehicles: vehicleStatusCounts.available,
          inShopVehicles: inShopVehiclesCount,
          fleetUtilization,
          activeTrips: activeTripsCount,
          pendingTrips: pendingTripsCount,
          driversOnDuty: driversOnDutyCount,
          totalDrivers: totalDriversCount,
        },
        vehicleStatusCounts,
        recentTrips,
      },
      "Dashboard statistics retrieved successfully.",
      200
    );
  } catch (error: any) {
    return sendError(error.message || "Failed to retrieve dashboard stats.", "INTERNAL_SERVER_ERROR", 500);
  }
}
