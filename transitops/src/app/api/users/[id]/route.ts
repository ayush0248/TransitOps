import { NextRequest } from "next/server";
import db from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/response";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== "fleet_manager") {
      return sendError("Forbidden. Only Fleet Managers can delete users.", "FORBIDDEN", 403);
    }

    const { id } = params;

    // Prevent self-deletion
    if (authUser.id === id) {
      return sendError("You cannot delete your own active account.", "BAD_REQUEST", 400);
    }

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return sendError("User not found.", "NOT_FOUND", 404);
    }

    await db.user.delete({
      where: { id },
    });

    return sendSuccess(null, "User deleted successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to delete user.", "INTERNAL_SERVER_ERROR", 500);
  }
}
