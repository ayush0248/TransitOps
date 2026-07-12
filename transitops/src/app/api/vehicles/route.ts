import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { vehicleSchema } from "@/lib/validations";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const region = searchParams.get("region") || "";

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const where: any = {};

    if (search) {
      where.OR = [
        {
          registrationNumber: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (region) where.region = region;

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      db.vehicle.count({
        where,
      }),
    ]);

    return sendSuccess(
      {
        vehicles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Vehicles retrieved successfully.",
      200
    );
  } catch (error: any) {
    return sendError(
      error.message || "Failed to fetch vehicles.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== "fleet_manager") {
      return sendError("Forbidden. Only Fleet Managers can register new vehicles.", "FORBIDDEN", 403);
    }

    const body = await request.json();

    const validation = vehicleSchema.safeParse(body);

    if (!validation.success) {
      return sendError(
        validation.error.issues.map((e) => e.message).join(", "),
        "VALIDATION_ERROR",
        400,
        validation.error.flatten()
      );
    }

    const vehicle = await db.vehicle.create({
      data: validation.data,
    });

    return sendSuccess(vehicle, "Vehicle created successfully.", 201);
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(
        "Registration number already exists.",
        "DUPLICATE_REGISTRATION",
        409
      );
    }

    return sendError(
      error.message || "Failed to create vehicle.",
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}