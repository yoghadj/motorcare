"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import type { Dict } from "@/lib/get-dictionary";
import { fuelProviders } from "@/config/fuel-providers";

type FuelLog = {
  id: string;
  refillDate: string;
  liters: number;
  totalPrice: number;
  odometer: number;
  fuelProvider: string | null;
  fuelType: string | null;
  isFullTank: boolean;
};

export function EditFuelForm({
  log,
  dictionary,
  onSuccess,
  onCancel,
}: {
  log: FuelLog;
  dictionary: Dict;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refillDate, setRefillDate] = useState(log.refillDate);
  const [liters, setLiters] = useState(log.liters);
  const [totalPrice, setTotalPrice] = useState(log.totalPrice);
  const [odometer, setOdometer] = useState(log.odometer);
  const [provider, setProvider] = useState(log.fuelProvider ?? "");
  const [fuelType, setFuelType] = useState(log.fuelType ?? "");
  const [isFullTank, setIsFullTank] = useState(log.isFullTank);
  const t = dictionary.fuel;
  const common = dictionary.common;
  const types = provider ? fuelProviders[provider] ?? [] : [];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/fuel/${log.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refillDate,
        liters,
        totalPrice,
        odometer,
        fuelProvider: provider.trim() || null,
        fuelType: fuelType.trim() || null,
        isFullTank,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    onSuccess();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.date}</Label>
              <Input type="date" value={refillDate} onChange={(e) => setRefillDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t.odometer}</Label>
              <NumberInput value={odometer} onChange={setOdometer} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.liters}</Label>
            <NumberInput value={liters} onChange={setLiters} />
          </div>
          <div className="space-y-2">
            <Label>{t.totalPrice}</Label>
            <NumberInput currency value={totalPrice} onChange={setTotalPrice} />
          </div>
          <div className="space-y-2">
            <Label>{t.provider}</Label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">—</option>
              {Object.keys(fuelProviders).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {types.length > 0 && (
            <div className="space-y-2">
              <Label>{t.type}</Label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">—</option>
                {types.map((ty) => (
                  <option key={ty} value={ty}>{ty}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isFullTank} onChange={(e) => setIsFullTank(e.target.checked)} className="rounded" />
            <Label>{t.fullTank}</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? common.loading : common.save}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>{common.cancel}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
