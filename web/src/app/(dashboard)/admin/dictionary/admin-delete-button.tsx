"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Dict } from "@/lib/get-dictionary";

export function AdminDeleteDictionaryButton({
  entryId,
  dictionary,
}: {
  entryId: string;
  dictionary: Dict;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this entry? Image will be removed.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dictionary/${entryId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className="ml-2"
      onClick={handleDelete}
      disabled={loading}
    >
      {dictionary.dictionary.delete}
    </Button>
  );
}
