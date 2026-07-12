import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { sendLicenseExpiryWarning } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Note: In a real production app, you would add an authorization header check here
    // e.g., if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find all drivers whose license expires within 30 days OR is already expired
    const drivers = await db.driver.findMany({
      where: {
        licenseExpiryDate: {
          lte: thirtyDaysFromNow,
        },
      },
    });

    if (drivers.length === 0) {
      return sendSuccess({ emailsSent: 0 }, "No licenses expiring within 30 days.", 200);
    }

    // Get all safety officers
    const safetyOfficers = await db.user.findMany({
      where: { role: "safety_officer" },
      select: { email: true },
    });
    const safetyOfficerEmails = safetyOfficers.map((u) => u.email);

    // Get all driver_users to match emails
    // A better schema would link Driver to User directly, but for now we match by name
    const allUsers = await db.user.findMany({
      where: { role: "driver_user" },
      select: { name: true, email: true },
    });

    const results = [];

    for (const driver of drivers) {
      const expiry = new Date(driver.licenseExpiryDate);
      const timeDiff = expiry.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Attempt to find the driver's user account
      const matchedUser = allUsers.find((u) => u.name === driver.name);
      const driverEmail = matchedUser ? matchedUser.email : null;

      // Send Email
      const emailResult = await sendLicenseExpiryWarning(
        driver.name,
        driverEmail,
        safetyOfficerEmails,
        daysRemaining,
        expiry
      );

      results.push({
        driver: driver.name,
        daysRemaining,
        previewUrl: emailResult?.previewUrl || null,
      });
    }

    return sendSuccess(
      { emailsSent: results.length, results },
      "License expiry checks completed successfully.",
      200
    );
  } catch (error: any) {
    console.error("Cron Error:", error);
    return sendError(error.message || "Failed to run license cron.", "INTERNAL_SERVER_ERROR", 500);
  }
}
