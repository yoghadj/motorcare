"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bike,
  User,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dict } from "@/lib/get-dictionary";

const navItems = (
  isAdmin: boolean,
  t: Dict["nav"]
) => {
  const items = [
    { href: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { href: "/garage", label: t.garage, icon: Bike },
    { href: "/dictionary", label: t.dictionary, icon: BookOpen },
    { href: "/profile", label: t.profile, icon: User },
  ];
  if (isAdmin) {
    items.push({ href: "/admin/users", label: t.users, icon: Users });
    items.push({ href: "/admin/dictionary", label: t.dictionaryManage, icon: BookOpen });
  }
  return items;
};

interface SidebarProps {
  locale: Locale;
  dictionary: Dict;
  userRole?: string;
}

export function Sidebar({ locale, dictionary, userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const t = dictionary.nav;
  const isAdmin = userRole === "ADMIN";

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card text-card-foreground transition-[width] duration-200",
        collapsed ? "w-[4rem]" : "w-56"
      )}
    >
      <div className="flex h-14 items-center border-b px-3 gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0 shrink-0">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="shrink-0"
          />
          {!collapsed && (
            <span className="font-semibold truncate">
              {dictionary.common.appName}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto shrink-0 rounded p-1.5 hover:bg-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems(isAdmin, t).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
