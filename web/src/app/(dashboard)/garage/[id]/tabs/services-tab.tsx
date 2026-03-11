"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/get-dictionary";
import { formatNumber, formatCurrency } from "@/lib/format";
import { AddServiceForm } from "./add-service-form";
import { EditServiceForm } from "./edit-service-form";

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

export function ServicesTab({
  motorcycleId,
  dictionary,
}: {
  motorcycleId: string;
  dictionary: Dict;
}) {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = dictionary.service;
  const common = dictionary.common;
  const types = t.types as Record<string, string>;

  async function fetchRecords() {
    const res = await fetch(`/api/motorcycles/${motorcycleId}/services`);
    if (res.ok) {
      const data = await res.json();
      setRecords(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRecords();
  }, [motorcycleId]);

  async function handleDelete(recordId: string) {
    if (!confirm("Delete this service record?")) return;
    setDeletingId(recordId);
    try {
      const res = await fetch(`/api/services/${recordId}`, { method: "DELETE" });
      if (res.ok) fetchRecords();
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="text-muted-foreground">{common.loading}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <Button onClick={() => setShowAdd((s) => !s)} disabled={!!editingRecord}>
          {showAdd ? common.cancel : t.add}
        </Button>
      </div>
      {showAdd && (
        <AddServiceForm
          motorcycleId={motorcycleId}
          dictionary={dictionary}
          onSuccess={() => { setShowAdd(false); fetchRecords(); }}
        />
      )}
      {editingRecord && (
        <EditServiceForm
          record={editingRecord}
          dictionary={dictionary}
          onSuccess={() => { setEditingRecord(null); fetchRecords(); }}
          onCancel={() => setEditingRecord(null)}
        />
      )}
      {records.length === 0 ? (
        <p className="text-muted-foreground">{t.noRecords}</p>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.id} className="rounded-md border p-4">
              <div className="flex justify-between">
                <span className="font-medium">{r.serviceDate}</span>
                <span>{types[r.serviceType] ?? r.serviceType}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.odometer}: {formatNumber(r.odometer)} km
                {r.workshopName && ` · ${r.workshopName}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.laborCost}: {formatCurrency(r.serviceCost)}
              </p>
              {r.items.length > 0 && (
                <ul className="mt-2 text-sm">
                  {r.items.map((i, idx) => (
                    <li key={idx}>
                      {i.itemName} × {i.quantity} = {formatCurrency(i.totalCost)}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 font-medium">
                {t.totalCost}: {formatCurrency(r.totalCost)}
              </p>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingRecord(r)} disabled={!!editingRecord}>
                  {common.edit}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}>
                  {dictionary.garage.delete}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
