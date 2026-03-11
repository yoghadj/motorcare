import { NextResponse } from "next/server";
import { locales, localeCookieName, type Locale } from "@/lib/i18n";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const valid = locales.includes(locale as Locale);
  if (!valid) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const referer = request.headers.get("referer");
  const url = referer ? new URL(referer) : new URL("/", request.url);
  const res = NextResponse.redirect(url);
  res.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
