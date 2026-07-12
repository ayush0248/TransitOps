import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validations";
import { AuthService } from "@/services/auth.service";
import { sendSuccess, sendError } from "@/lib/response";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues.map((e) => e.message).join(", ");
      return sendError(errorMessage, "VALIDATION_ERROR", 400, validationResult.error.flatten());
    }

    const { user, token } = await AuthService.loginUser(validationResult.data);

    const response = sendSuccess({ user, token }, "Login completed successfully.", 200);

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
    if (error.message && error.message.includes("Invalid credentials")) {
      return sendError("Invalid credentials. Please verify your email and password.", "INVALID_CREDENTIALS", 401);
    }
    if (error.message && error.message.includes("Role mismatch")) {
      return sendError(error.message, "ROLE_MISMATCH", 403);
    }
    return sendError(error.message || "An unexpected error occurred during login.", "INTERNAL_SERVER_ERROR", 500);
  }
}
