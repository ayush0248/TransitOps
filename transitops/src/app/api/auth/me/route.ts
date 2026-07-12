import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { AuthService } from "@/services/auth.service";
import { sendSuccess, sendError } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const payload = getAuthUser(request);
    if (!payload) {
      return sendError("Not authenticated. Please log in.", "UNAUTHORIZED", 401);
    }

    const user = await AuthService.getCurrentUser(payload.id);
    return sendSuccess(user, "User profile retrieved successfully.", 200);
  } catch (error: any) {
    return sendError(error.message || "Failed to fetch current user.", "UNAUTHORIZED", 401);
  }
}
