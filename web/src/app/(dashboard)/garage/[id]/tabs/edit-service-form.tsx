"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { NumberInput } from "@/components/ui/number-input";
import type { Dict } from "@/lib/get-dictionary";

const SERVICE_TYPES = ["REGULAR_SERVICE", "REPAIR", "EMERGENCY", "OTHER"] as const;

type ServiceRecord = {
  id: string;
  serviceDate: string;
  odometer: number;
  workshopName: string | null;
  serviceCost: number;
  totalCost: number;
  serviceType: string;
  items: { itemName: string; quantity: number; unitCost: number; totalCost: number }[];
};

export function EditServiceForm({
  record,
  dictionary,
  onSuccess,
  onCancel,
}: {
  record: ServiceRecord;
  dictionary: Dict;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceDate, setServiceDate] = useState(record.serviceDate);
  const [odometer, setOdometer] = useState(record.odometer);
  const [workshopName, setWorkshopName] = useState(record.workshopName ?? "");
  const [notes, setNotes] = useState("");
  const [serviceCost, setServiceCost] = useState(record.serviceCost);
  const [serviceType, setServiceType] = useState(record.serviceType);
  const [items, setItems] = useState(
    record.items.length > 0
      ? record.items.map((i) => ({ ...i }))
      : [{ itemName: "", quantity: 1, unitCost: 0, totalCost: 0 }]
  );
  const t = dictionary.service;
  const types = t.types as Record<string, string>;
  const common = dictionary.common;

  function addItem() {
    setItems((prev) => [...prev, { itemName: "", quantity: 1, unitCost: 0, totalCost: 0 }]);
  }

  function updateItem(i: number, field: string, value: string | number) {
    setItems((prev) => {
      const next = prev.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item
      );
      const item = { ...next[i] };
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

    const res = await fetch(`/api/services/${record.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceDate,
        odometer,
        workshopName: workshopName.trim() || null,
        notes: notes.trim() || null,
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

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.date}</Label>
              <Input type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t.odometer}</Label>
              <NumberInput value={odometer} onChange={setOdometer} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.type}</Label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {SERVICE_TYPES.map((st) => (
                <option key={st} value={st}>{types[st]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t.workshop}</Label>
            <Input value={workshopName} onChange={(e) => setWorkshopName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t.laborCost}</Label>
            <NumberInput currency value={serviceCost} onChange={setServiceCost} />
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
                  className="w-28"
                />
              </div>
            ))}
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
