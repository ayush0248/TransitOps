import { NextRequest } from "next/server";
import { sendSuccess } from "@/lib/response";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = sendSuccess({}, "Logged out successfully.", 200);

  // Clear cookie
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
