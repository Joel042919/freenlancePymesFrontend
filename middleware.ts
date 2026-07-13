import { NextRequest, NextResponse } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  "/freelancer": "FREELANCER",
  "/pyme": "PYME",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) => pathname.startsWith(prefix));
  if (!matchedPrefix) {
    return NextResponse.next();
  }

  const token = request.cookies.get("jwt_token")?.value;
  const role = request.cookies.get("user_role")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role !== ROLE_PREFIXES[matchedPrefix] && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/freelancer/:path*", "/pyme/:path*"],
};
