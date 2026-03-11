"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import type { Dict } from "@/lib/get-dictionary";

type Log = { id: string; date: string; odometer: number };

export function EditOdometerForm({
  log,
  dictionary,
  onSuccess,
  onCancel,
}: {
  log: Log;
  dictionary: Dict;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(log.date);
  const [odometer, setOdometer] = useState(log.odometer);
  const t = dictionary.odometer;
  const common = dictionary.common;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/odometer/${log.id}`, {
      method: "PATCH",
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

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">{t.date}</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-odometer">{t.reading}</Label>
            <NumberInput
              id="edit-odometer"
              value={odometer}
              onChange={setOdometer}
            />
          </div>
          {error && <p className="text-sm text-destructive w-full">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? common.loading : common.save}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {common.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
