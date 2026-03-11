import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { defaultLocale, localeCookieName, locales } from "@/lib/i18n";
import { getDictionary } from "@/lib/get-dictionary";

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  if (value && locales.includes(value as Locale)) return value as Locale;
  return defaultLocale;
}

export { getDictionary };
