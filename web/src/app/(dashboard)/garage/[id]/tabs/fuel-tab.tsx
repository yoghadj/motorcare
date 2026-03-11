"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/get-dictionary";
import { formatNumber, formatCurrency } from "@/lib/format";
import { AddFuelForm } from "./add-fuel-form";
import { EditFuelForm } from "./edit-fuel-form";

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

export function FuelTab({
  motorcycleId,
  dictionary,
}: {
  motorcycleId: string;
  dictionary: Dict;
}) {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingLog, setEditingLog] = useState<FuelLog | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = dictionary.fuel;
  const common = dictionary.common;

  async function fetchLogs() {
    const res = await fetch(`/api/motorcycles/${motorcycleId}/fuel`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();
  }, [motorcycleId]);

  async function handleDelete(logId: string) {
    if (!confirm("Delete this fuel entry?")) return;
    setDeletingId(logId);
    try {
      const res = await fetch(`/api/fuel/${logId}`, { method: "DELETE" });
      if (res.ok) fetchLogs();
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="text-muted-foreground">{common.loading}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.title}</h2>
        <Button onClick={() => setShowAdd((s) => !s)} disabled={!!editingLog}>
          {showAdd ? common.cancel : t.add}
        </Button>
      </div>
      {showAdd && (
        <AddFuelForm
          motorcycleId={motorcycleId}
          dictionary={dictionary}
          onSuccess={() => { setShowAdd(false); fetchLogs(); }}
        />
      )}
      {editingLog && (
        <EditFuelForm
          log={editingLog}
          dictionary={dictionary}
          onSuccess={() => { setEditingLog(null); fetchLogs(); }}
          onCancel={() => setEditingLog(null)}
        />
      )}
      {logs.length === 0 ? (
        <p className="text-muted-foreground">{t.noLogs}</p>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">{t.date}</th>
                <th className="px-4 py-2 text-left font-medium">{t.liters}</th>
                <th className="px-4 py-2 text-left font-medium">{t.totalPrice}</th>
                <th className="px-4 py-2 text-left font-medium">{t.odometer}</th>
                <th className="px-4 py-2 text-left font-medium">{t.fullTank}</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="px-4 py-2">{log.refillDate}</td>
                  <td className="px-4 py-2">{formatNumber(log.liters)}</td>
                  <td className="px-4 py-2">{formatCurrency(log.totalPrice)}</td>
                  <td className="px-4 py-2">{formatNumber(log.odometer)}</td>
                  <td className="px-4 py-2">{log.isFullTank ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="outline" size="sm" className="mr-1" onClick={() => setEditingLog(log)} disabled={!!editingLog}>
                      {common.edit}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(log.id)} disabled={deletingId === log.id}>
                      {dictionary.garage.delete}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
