"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/get-dictionary";

export function SetActiveButton({
  motorcycleId,
  dictionary,
}: {
  motorcycleId: string;
  dictionary: Dict;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = dictionary.garage;

  async function handleSetActive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/motorcycles/${motorcycleId}/set-active`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSetActive} disabled={loading}>
      {t.setActive}
    </Button>
  );
}
