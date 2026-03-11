import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = request.nextUrl.pathname;

  // Public routes
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/locale")
  ) {
    return NextResponse.next();
  }

  // Protected: must be signed in
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  // Admin routes: require ADMIN role
  if (path.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
