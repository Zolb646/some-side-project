import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server/bff";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/api/auth/me");
}
