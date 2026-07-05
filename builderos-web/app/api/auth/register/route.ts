import { NextRequest } from "next/server";
import { postAuth } from "@/lib/server/bff";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return postAuth(request, "/api/auth/register");
}
