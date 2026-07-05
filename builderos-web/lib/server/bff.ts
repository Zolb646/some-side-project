import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.BUILDEROS_API_BASE_URL ?? "http://localhost:8080";
const authCookieName = process.env.AUTH_COOKIE_NAME ?? "builderos_session";

export function authCookieOptions(maxAge?: number) {
  const secure =
    process.env.AUTH_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge,
  };
}

export async function proxyRequest(request: NextRequest, backendPath: string) {
  const token = request.cookies.get(authCookieName)?.value;

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 },
    );
  }

  const url = new URL(backendPath, apiBaseUrl);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  if (request.headers.get("content-type")) {
    headers.set("Content-Type", request.headers.get("content-type") ?? "application/json");
  }

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
  const backendResponse = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseBody = await backendResponse.text();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
    },
  });
}

export function resourcePath(resource: string, path?: string[]) {
  const suffix = path?.length ? `/${path.map(encodeURIComponent).join("/")}` : "";
  return `/api/${resource}${suffix}`;
}

export async function postAuth(request: NextRequest, path: "/api/auth/login" | "/api/auth/register") {
  const backendResponse = await fetch(new URL(path, apiBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body: await request.text(),
    cache: "no-store",
  });

  const contentType = backendResponse.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await backendResponse.json()
    : await backendResponse.text();

  if (!backendResponse.ok || typeof data !== "object" || data === null) {
    return NextResponse.json(data, { status: backendResponse.status });
  }

  const { token, expiresIn, user } = data as {
    token?: string;
    expiresIn?: number;
    user?: unknown;
  };

  const response = NextResponse.json({ expiresIn, user }, { status: backendResponse.status });
  if (token) {
    response.cookies.set(authCookieName, token, authCookieOptions(expiresIn));
  }
  return response;
}

export async function logout(request: NextRequest) {
  const token = request.cookies.get(authCookieName)?.value;

  if (token) {
    await fetch(new URL("/api/auth/logout", apiBaseUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName, "", authCookieOptions(0));
  return response;
}
