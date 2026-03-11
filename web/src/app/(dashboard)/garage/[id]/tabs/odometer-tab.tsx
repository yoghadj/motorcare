"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/get-dictionary";
import { formatNumber } from "@/lib/format";
import { AddOdometerForm } from "./add-odometer-form";
import { EditOdometerForm } from "./edit-odometer-form";

type Log = { id: string; date: string; odometer: number; distanceSinceLast: number | null };

export function OdometerTab({
  motorcycleId,
  dictionary,
}: {
  motorcycleId: string;
  dictionary: Dict;
}) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const t = dictionary.odometer;
  const common = dictionary.common;

  async function fetchLogs() {
    const res = await fetch(`/api/motorcycles/${motorcycleId}/odometer`);
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
    if (!confirm("Delete this odometer entry?")) return;
    setDeletingId(logId);
    try {
      const res = await fetch(`/api/odometer/${logId}`, { method: "DELETE" });
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
        <AddOdometerForm
          motorcycleId={motorcycleId}
          dictionary={dictionary}
          onSuccess={() => { setShowAdd(false); fetchLogs(); }}
        />
      )}
      {editingLog && (
        <EditOdometerForm
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
                <th className="px-4 py-2 text-left font-medium">{t.reading}</th>
                <th className="px-4 py-2 text-left font-medium">{t.distance}</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="px-4 py-2">{log.date}</td>
                  <td className="px-4 py-2">{formatNumber(log.odometer)}</td>
                  <td className="px-4 py-2">
                    {log.distanceSinceLast != null ? `${formatNumber(log.distanceSinceLast)} km` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-1"
                      onClick={() => setEditingLog(log)}
                      disabled={!!editingLog}
                    >
                      {common.edit}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(log.id)}
                      disabled={deletingId === log.id}
                    >
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
