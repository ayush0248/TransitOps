import { NextRequest } from "next/server";
import { verifyToken, JwtPayload } from "./jwt";
import { AUTH_COOKIE_NAME } from "./constants";

export function getAuthUser(request: NextRequest | Request): JwtPayload | null {
  // Try cookie first
  let token: string | undefined;
  if ("cookies" in request && typeof request.cookies.get === "function") {
    token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  }

  // Try Authorization header fallback
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function checkRBAC(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
