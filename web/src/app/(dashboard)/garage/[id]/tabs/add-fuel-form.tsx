"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import type { Dict } from "@/lib/get-dictionary";
import { fuelProviders } from "@/config/fuel-providers";

export function AddFuelForm({
  motorcycleId,
  dictionary,
  onSuccess,
}: {
  motorcycleId: string;
  dictionary: Dict;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("");
  const [liters, setLiters] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [odometer, setOdometer] = useState<number>(0);
  const t = dictionary.fuel;
  const common = dictionary.common;
  const types = provider ? fuelProviders[provider] ?? [] : [];
  const pricePerLiter = liters > 0 ? totalPrice / liters : 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const refillDate = formData.get("refillDate") as string;
    const isFullTank = formData.get("isFullTank") === "on";
    const fuelProvider = formData.get("fuelProvider") ? String(formData.get("fuelProvider")).trim() : null;
    const fuelType = formData.get("fuelType") ? String(formData.get("fuelType")).trim() : null;
    const stationName = formData.get("stationName") ? String(formData.get("stationName")).trim() : null;

    const res = await fetch(`/api/motorcycles/${motorcycleId}/fuel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refillDate,
        liters: liters || undefined,
        totalPrice: totalPrice || undefined,
        pricePerLiter: liters > 0 ? totalPrice / liters : undefined,
        odometer,
        isFullTank,
        fuelProvider,
        fuelType,
        stationName,
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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="refillDate">{t.date}</Label>
              <Input id="refillDate" name="refillDate" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">{t.odometer}</Label>
              <NumberInput id="odometer" value={odometer} onChange={setOdometer} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liters">{t.liters}</Label>
              <NumberInput id="liters" value={liters} onChange={setLiters} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPrice">{t.totalPrice}</Label>
              <NumberInput id="totalPrice" currency value={totalPrice} onChange={setTotalPrice} placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerLiter">{t.pricePerLiter}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <NumberInput
                  id="pricePerLiter"
                  currency
                  value={pricePerLiter}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <span className="text-sm text-muted-foreground">/ L</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelProvider">{t.provider}</Label>
            <select
              id="fuelProvider"
              name="fuelProvider"
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
              <Label htmlFor="fuelType">{t.type}</Label>
              <select
                id="fuelType"
                name="fuelType"
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
            <input id="isFullTank" name="isFullTank" type="checkbox" defaultChecked className="rounded" />
            <Label htmlFor="isFullTank">{t.fullTank}</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? common.loading : common.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
