"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import type { Dict } from "@/lib/get-dictionary";
import { motorcycleBrands, currentYear, minYear } from "@/config/motorcycle-brands";

type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  engineCc: number;
  licensePlate: string | null;
  purchaseDate: string | null;
  currentOdometer: number;
  nickname: string | null;
};

export function MotorcycleForm({
  dictionary,
  motorcycle,
}: {
  dictionary: Dict;
  motorcycle?: Motorcycle | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState(motorcycle?.brand ?? "Honda");
  const [engineCc, setEngineCc] = useState(motorcycle?.engineCc ?? 0);
  const [currentOdometer, setCurrentOdometer] = useState(motorcycle?.currentOdometer ?? 0);
  const t = dictionary.garage;
  const common = dictionary.common;

  const models = useMemo(
    () => (brand ? (motorcycleBrands[brand] ?? motorcycleBrands.Other) : []),
    [brand]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      year: Number(formData.get("year")),
      engineCc,
      licensePlate: (formData.get("licensePlate") as string) || null,
      purchaseDate: (formData.get("purchaseDate") as string) || null,
      currentOdometer,
      nickname: (formData.get("nickname") as string) || null,
    };

    try {
      const url = motorcycle ? `/api/motorcycles/${motorcycle.id}` : "/api/motorcycles";
      const method = motorcycle ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? { _: ["Request failed"] });
        setLoading(false);
        return;
      }
      router.push("/garage");
      router.refresh();
    } catch {
      setError({ _: ["Request failed"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand">{t.brand}</Label>
            <select
              id="brand"
              name="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select brand</option>
              {Object.keys(motorcycleBrands).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">{t.model}</Label>
            <select
              id="model"
              name="model"
              required
              defaultValue={motorcycle?.model ?? ""}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select model</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">{t.year}</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min={minYear}
                max={currentYear}
                required
                defaultValue={motorcycle?.year ?? currentYear}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="engineCc">{t.engineCc}</Label>
              <NumberInput
                id="engineCc"
                value={engineCc}
                onChange={setEngineCc}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentOdometer">{t.currentOdometer}</Label>
            <NumberInput
              id="currentOdometer"
              value={currentOdometer}
              onChange={setCurrentOdometer}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">{t.nickname}</Label>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={motorcycle?.nickname ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licensePlate">{t.licensePlate}</Label>
            <Input
              id="licensePlate"
              name="licensePlate"
              defaultValue={motorcycle?.licensePlate ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">{t.purchaseDate}</Label>
            <Input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              defaultValue={
                motorcycle?.purchaseDate
                  ? motorcycle.purchaseDate.slice(0, 10)
                  : ""
              }
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">
              {typeof error === "object" && !Array.isArray(error)
                ? Object.values(error).flat().join(", ")
                : "Request failed"}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? common.loading : common.save}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/garage">{common.cancel}</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
