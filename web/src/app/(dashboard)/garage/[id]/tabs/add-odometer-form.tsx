"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import type { Dict } from "@/lib/get-dictionary";

export function AddOdometerForm({
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
  const [odometer, setOdometer] = useState<number>(0);
  const t = dictionary.odometer;
  const common = dictionary.common;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const date = formData.get("date") as string;
    const res = await fetch(`/api/motorcycles/${motorcycleId}/odometer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, odometer }),
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
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">{t.date}</Label>
            <Input id="date" name="date" type="date" required defaultValue={today} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="odometer">{t.reading}</Label>
            <NumberInput
              id="odometer"
              value={odometer}
              onChange={(v) => setOdometer(v)}
              placeholder="0"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive w-full">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? common.loading : common.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
