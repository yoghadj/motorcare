"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import { localeNames } from "@/lib/i18n";
import type { Dict } from "@/lib/get-dictionary";

interface HeaderProps {
  locale: Locale;
  dictionary: Dict;
}

export function Header({ locale, dictionary }: HeaderProps) {
  const t = dictionary.nav;

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <span className="text-sm text-muted-foreground">{t.locale}</span>
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border">
          {(["en", "id"] as const).map((loc) => (
            <Link
              key={loc}
              href={`/api/locale/${loc}`}
              className={cn(
                "px-3 py-1.5 text-sm font-medium",
                locale === loc
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {localeNames[loc]}
            </Link>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          {dictionary.common.logout}
        </Button>
      </div>
    </header>
  );
}
