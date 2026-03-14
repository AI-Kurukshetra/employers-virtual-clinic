import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { logHipaaAudit } from "@/lib/hipaa-logger";

function roleAllowed(pathname: string, role?: string | null) {
  if (pathname.startsWith("/patient")) return role === "PATIENT";
  if (pathname.startsWith("/provider")) return role === "PROVIDER";
  if (pathname.startsWith("/employer")) return role === "EMPLOYER_ADMIN";
  if (pathname.startsWith("/admin")) return role === "SUPER_ADMIN";
  return true;
}

export async function middleware(req: NextRequest) {
  const requestId = uuidv4();
  const headers = new Headers(req.headers);
  headers.set("x-request-id", requestId);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as string | undefined;
  const userId = token?.sub;

  if (!roleAllowed(req.nextUrl.pathname, role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    (req.nextUrl.pathname.startsWith("/patient") ||
      req.nextUrl.pathname.startsWith("/provider") ||
      req.nextUrl.pathname.startsWith("/employer") ||
      req.nextUrl.pathname.startsWith("/admin")) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/api")) {
    logHipaaAudit({
      requestId,
      method: req.method,
      path: req.nextUrl.pathname,
      userId: userId ?? null,
      timestamp: new Date().toISOString(),
    });
  }

  const res = NextResponse.next({ request: { headers } });
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
