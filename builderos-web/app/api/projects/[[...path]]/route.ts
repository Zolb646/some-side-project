import { NextRequest } from "next/server";
import { proxyRequest, resourcePath } from "@/lib/server/bff";

export const runtime = "nodejs";

type Context = { params: Promise<{ path?: string[] }> };

async function path(ctx: Context) {
  return resourcePath("projects", (await ctx.params).path);
}

export async function GET(request: NextRequest, ctx: Context) {
  return proxyRequest(request, await path(ctx));
}

export async function POST(request: NextRequest, ctx: Context) {
  return proxyRequest(request, await path(ctx));
}

export async function PUT(request: NextRequest, ctx: Context) {
  return proxyRequest(request, await path(ctx));
}

export async function DELETE(request: NextRequest, ctx: Context) {
  return proxyRequest(request, await path(ctx));
}
