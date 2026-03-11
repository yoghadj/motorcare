"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/get-dictionary";

export function DeleteMotorcycleButton({
  motorcycleId,
  dictionary,
}: {
  motorcycleId: string;
  dictionary: Dict;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = dictionary.garage;

  async function handleDelete() {
    if (!confirm("Remove this motorcycle? Data will be kept (soft delete).")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/motorcycles/${motorcycleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {t.delete}
    </Button>
  );
}
