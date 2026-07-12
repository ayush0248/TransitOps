import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { driverSchema } from "@/lib/validations";
import { getAuthUser } from "@/lib/auth";
import { hashPassword } from "@/lib/bcrypt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
    return sendSuccess(drivers, "Drivers retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch drivers.", "INTERNAL_SERVER_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== "safety_officer" && authUser.role !== "fleet_manager")) {
      return sendError("Forbidden. Only Safety Officers or Fleet Managers can register new drivers.", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const validationResult = driverSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const { loginEmail, loginPassword, ...driverData } = validationResult.data;

    let newDriver;

    if (loginEmail && loginPassword) {
      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email: loginEmail.toLowerCase() },
      });

      if (existingUser) {
        return sendError("A user with this login email already exists.", "USER_EXISTS", 409);
      }

      const passwordHash = await hashPassword(loginPassword);

      // Create both within a transaction
      newDriver = await db.$transaction(async (tx) => {
        const driver = await tx.driver.create({
          data: driverData,
        });

        await tx.user.create({
          data: {
            name: driverData.name,
            email: loginEmail.toLowerCase(),
            passwordHash,
            role: "driver_user",
          },
        });

        return driver;
      });
    } else {
      newDriver = await db.driver.create({
        data: driverData,
      });
    }

    return sendSuccess(newDriver, "Driver registered successfully.", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError("Driver license number already registered.", "DUPLICATE_LICENSE", 409);
    }
    return sendError(error.message || "Failed to create driver.", "INTERNAL_SERVER_ERROR", 500);
  }
}
