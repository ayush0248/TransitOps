import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { vehicleUpdateSchema } from "@/lib/validations";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
){
  try {
   const id = params.id;

const vehicle = await db.vehicle.findUnique({
  where: {
    id,
  },
});

    if (!vehicle) {
      return sendError(
        "Vehicle not found.",
        "NOT_FOUND",
        404
      );
    }

    return sendSuccess(
      vehicle,
      "Vehicle retrieved successfully.",
      200
    );
  } catch (error: any) {
    return sendError(
      error.message,
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const id = params.id;

    const body = await request.json();

    const validation = vehicleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return sendError(
        validation.error.issues.map((e) => e.message).join(", "),
        "VALIDATION_ERROR",
        400,
        validation.error.flatten()
      );
    }

    const exists = await db.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!exists) {
      return sendError(
        "Vehicle not found.",
        "NOT_FOUND",
        404
      );
    }

    const vehicle = await db.vehicle.update({
      where: {
        id,
      },
      data: validation.data,
    });

    return sendSuccess(
      vehicle,
      "Vehicle updated successfully.",
      200
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return sendError(
        "Registration number already exists.",
        "DUPLICATE_REGISTRATION",
        409
      );
    }

    return sendError(
      error.message,
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const id = params.id;

    const exists = await db.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!exists) {
      return sendError(
        "Vehicle not found.",
        "NOT_FOUND",
        404
      );
    }

    await db.vehicle.delete({
      where: {
        id,
      },
    });

    return sendSuccess(
      null,
      "Vehicle deleted successfully.",
      200
    );
  } catch (error: any) {
    if (error.code === "P2003") {
      return sendError(
        "Vehicle cannot be deleted because it is linked to trips or other records.",
        "FOREIGN_KEY_CONSTRAINT",
        409
      );
    }

    return sendError(
      error.message,
      "INTERNAL_SERVER_ERROR",
      500
    );
  }
}