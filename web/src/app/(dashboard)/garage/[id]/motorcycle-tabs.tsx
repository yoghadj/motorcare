"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Dict } from "@/lib/get-dictionary";
import { OdometerTab } from "./tabs/odometer-tab";
import { ServicesTab } from "./tabs/services-tab";
import { FuelTab } from "./tabs/fuel-tab";
import { AnalyticsTab } from "./tabs/analytics-tab";

const TABS = [
  { id: "odometer", labelKey: "odometer" as const },
  { id: "services", labelKey: "service" as const },
  { id: "fuel", labelKey: "fuel" as const },
  { id: "analytics", labelKey: "analytics" as const },
] as const;

type TabId = (typeof TABS)[number]["id"];

type MotorcycleSerialized = {
  id: string;
  currentOdometer: number;
  [key: string]: unknown;
};

interface MotorcycleTabsProps {
  motorcycleId: string;
  motorcycle: MotorcycleSerialized;
  dictionary: Dict;
  tab: string;
}

export function MotorcycleTabs({
  motorcycleId,
  motorcycle,
  dictionary,
  tab,
}: MotorcycleTabsProps) {
  const searchParams = useSearchParams();
  const currentTab = TABS.some((t) => t.id === tab) ? (tab as TabId) : "odometer";

  return (
    <div>
      <nav className="flex gap-2 border-b">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/garage/${motorcycleId}?tab=${t.id}`}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              currentTab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {dictionary[t.labelKey].title}
          </Link>
        ))}
      </nav>
      <div className="mt-4">
        {currentTab === "odometer" && (
          <OdometerTab motorcycleId={motorcycleId} dictionary={dictionary} />
        )}
        {currentTab === "services" && (
          <ServicesTab motorcycleId={motorcycleId} dictionary={dictionary} />
        )}
        {currentTab === "fuel" && (
          <FuelTab motorcycleId={motorcycleId} dictionary={dictionary} />
        )}
        {currentTab === "analytics" && (
          <AnalyticsTab motorcycleId={motorcycleId} motorcycle={motorcycle} dictionary={dictionary} />
        )}
      </div>
    </div>
  );
}
