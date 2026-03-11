"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import { formatCurrency } from "@/lib/format";
import type { Dict } from "@/lib/get-dictionary";

const SERVICE_TYPES = ["REGULAR_SERVICE", "REPAIR", "EMERGENCY", "OTHER"] as const;

export function AddServiceForm({
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
  const [serviceCost, setServiceCost] = useState<number>(0);
  const [items, setItems] = useState([{ itemName: "", quantity: 1, unitCost: 0, totalCost: 0 }]);
  const t = dictionary.service;
  const types = t.types as Record<string, string>;
  const common = dictionary.common;

  function addItem() {
    setItems((prev) => [...prev, { itemName: "", quantity: 1, unitCost: 0, totalCost: 0 }]);
  }

  function updateItem(i: number, field: string, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[i], [field]: value };
      if (field === "quantity" || field === "unitCost") {
        item.totalCost = Number(item.quantity) * Number(item.unitCost);
      }
      next[i] = item;
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const serviceDate = formData.get("serviceDate") as string;
    const workshopName = (formData.get("workshopName") as string) || null;
    const notes = (formData.get("notes") as string) || null;
    const serviceType = (formData.get("serviceType") as string) || "REGULAR_SERVICE";
    const itemsData = items
      .filter((i) => i.itemName.trim())
      .map((i) => ({
        itemName: i.itemName,
        quantity: i.quantity,
        unitCost: i.unitCost,
        totalCost: i.quantity * i.unitCost,
      }));
    const itemsTotal = itemsData.reduce((s, i) => s + i.totalCost, 0);
    const totalCost = serviceCost + itemsTotal;

    const res = await fetch(`/api/motorcycles/${motorcycleId}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceDate,
        odometer,
        workshopName,
        notes,
        serviceCost,
        totalCost,
        serviceType,
        items: itemsData,
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
              <Label htmlFor="serviceDate">{t.date}</Label>
              <Input id="serviceDate" name="serviceDate" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">{t.odometer}</Label>
              <NumberInput id="odometer" value={odometer} onChange={setOdometer} placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceType">{t.type}</Label>
            <select
              id="serviceType"
              name="serviceType"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {SERVICE_TYPES.map((st) => (
                <option key={st} value={st}>{types[st]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workshopName">{t.workshop}</Label>
            <Input id="workshopName" name="workshopName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceCost">{t.laborCost}</Label>
            <NumberInput id="serviceCost" currency value={serviceCost} onChange={setServiceCost} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label>{t.items}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Add item
              </Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="mt-2 flex flex-wrap gap-2">
                <Input
                  placeholder={t.itemName}
                  value={item.itemName}
                  onChange={(e) => updateItem(i, "itemName", e.target.value)}
                  className="w-32"
                />
                <NumberInput
                  value={item.quantity}
                  onChange={(v) => updateItem(i, "quantity", v)}
                  className="w-16"
                />
                <NumberInput
                  currency
                  value={item.unitCost}
                  onChange={(v) => updateItem(i, "unitCost", v)}
                  placeholder={t.unitCost}
                  className="w-28"
                />
                <span className="py-2 text-sm">= {formatCurrency(item.totalCost)}</span>
              </div>
            ))}
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
