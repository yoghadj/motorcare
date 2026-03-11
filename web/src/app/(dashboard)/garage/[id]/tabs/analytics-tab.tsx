"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatCurrency } from "@/lib/format";
import type { Dict } from "@/lib/get-dictionary";

type MotorcycleSerialized = { id: string; currentOdometer: number; [key: string]: unknown };

export function AnalyticsTab({
  motorcycleId,
  motorcycle,
  dictionary,
}: {
  motorcycleId: string;
  motorcycle: MotorcycleSerialized;
  dictionary: Dict;
}) {
  const [stats, setStats] = useState<{
    totalServiceCost: number;
    totalFuelCost: number;
    totalKm: number;
  } | null>(null);
  const t = dictionary.analytics;

  useEffect(() => {
    async function fetchStats() {
      const [servicesRes, fuelRes, odometerRes] = await Promise.all([
        fetch(`/api/motorcycles/${motorcycleId}/services`),
        fetch(`/api/motorcycles/${motorcycleId}/fuel`),
        fetch(`/api/motorcycles/${motorcycleId}/odometer`),
      ]);
      const services = servicesRes.ok ? await servicesRes.json() : [];
      const fuel = fuelRes.ok ? await fuelRes.json() : [];
      const odometerLogs = odometerRes.ok ? await odometerRes.json() : [];

      const totalServiceCost = services.reduce((s: number, r: { totalCost: number }) => s + Number(r.totalCost), 0);
      const totalFuelCost = fuel.reduce((s: number, l: { totalPrice: number }) => s + Number(l.totalPrice), 0);
      const totalKm =
        odometerLogs.length > 1
          ? odometerLogs[0].odometer - odometerLogs[odometerLogs.length - 1].odometer
          : 0;

      setStats({ totalServiceCost, totalFuelCost, totalKm: totalKm > 0 ? totalKm : 0 });
    }
    fetchStats();
  }, [motorcycleId]);

  if (!stats) return <p className="text-muted-foreground">{dictionary.common.loading}</p>;

  const costPerKm = stats.totalKm > 0
    ? (stats.totalServiceCost + stats.totalFuelCost) / stats.totalKm
    : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{dictionary.dashboard.totalKm}</p>
            <p className="text-2xl font-bold">{formatNumber(stats.totalKm)} km</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{dictionary.dashboard.totalServiceCost}</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalServiceCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{dictionary.dashboard.totalFuelCost}</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalFuelCost)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cost per km</p>
            <p className="text-2xl font-bold">{formatCurrency(costPerKm)}</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-muted-foreground">{t.comingSoon}</p>
    </div>
  );
}
