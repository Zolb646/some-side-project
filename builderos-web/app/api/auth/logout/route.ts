import { NextRequest } from "next/server";
import { logout } from "@/lib/server/bff";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return logout(request);
}
