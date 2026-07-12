import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validations";
import { AuthService } from "@/services/auth.service";
import { sendSuccess, sendError } from "@/lib/response";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const { user, token } = await AuthService.registerUser(validationResult.data);

    const response = sendSuccess({ user, token }, "Registration completed successfully.", 201);

    // Set HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      return sendError(error.message, "USER_EXISTS", 409);
    }
    return sendError(error.message || "An unexpected error occurred during registration.", "INTERNAL_SERVER_ERROR", 500);
  }
}
