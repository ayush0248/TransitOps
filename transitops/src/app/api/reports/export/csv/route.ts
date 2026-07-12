import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";

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

    const rows = [
      ["Registration No", "Vehicle Name", "Type", "Status", "Odometer (km)", "Acquisition Cost", "Fuel Cost", "Maintenance Cost", "Other Expenses", "Total Operating Cost", "Estimated Revenue", "Net Profit", "ROI (%)"],
    ];

    vehicles.forEach((v) => {
      const fuelCost = v.fuelLogs.reduce((sum, log) => sum + Number(log.cost), 0);
      const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + Number(m.cost), 0);
      const expenseCost = v.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const totalOperatingCost = fuelCost + maintenanceCost + expenseCost;

      const acquisitionCost = Number(v.acquisitionCost) || 10000;
      const revenue = Number(v.revenue) || (Number(v.odometer) * 1.5) + 5000;
      const netProfit = revenue - totalOperatingCost;
      const roiPercentage = acquisitionCost > 0 ? ((netProfit / acquisitionCost) * 100).toFixed(2) : "0.00";

      rows.push([
        v.registrationNumber,
        v.name,
        v.type,
        v.status,
        String(v.odometer),
        String(acquisitionCost),
        String(fuelCost),
        String(maintenanceCost),
        String(expenseCost),
        String(totalOperatingCost),
        String(revenue),
        String(netProfit),
        roiPercentage,
      ]);
    });

    const csvContent = rows.map((e) => e.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transitops_financial_report_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Failed to export CSV." }, { status: 500 });
  }
}
