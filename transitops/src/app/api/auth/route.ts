import { NextRequest } from "next/server";
import { GET as getMe } from "./me/route";

export async function GET(request: NextRequest) {
  return getMe(request);
}
