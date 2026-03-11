"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Dict } from "@/lib/get-dictionary";

type Entry = { id: string; title: string; description: string | null; image: string | null };

export function DictionaryEntryForm({
  dictionary,
  entry,
}: {
  dictionary: Dict;
  entry?: Entry | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = dictionary.dictionary;
  const common = dictionary.common;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;

    if (!title) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    try {
      if (entry) {
        const res = await fetch(`/api/dictionary/${entry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Update failed");
          setLoading(false);
          return;
        }
      } else {
        const res = await fetch("/api/dictionary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Create failed");
          setLoading(false);
          return;
        }
        const created = await res.json();
        const imageFile = formData.get("image") as File | null;
        if (imageFile?.size) {
          const fd = new FormData();
          fd.set("image", imageFile);
          await fetch(`/api/dictionary/${created.id}/image`, {
            method: "POST",
            body: fd,
          });
        }
        router.push("/dictionary");
        router.refresh();
        return;
      }

      const imageFile = formData.get("image") as File | null;
      if (imageFile?.size && entry) {
        const fd = new FormData();
        fd.set("image", imageFile);
        await fetch(`/api/dictionary/${entry.id}/image`, {
          method: "POST",
          body: fd,
        });
      }
      router.push("/dictionary");
      router.refresh();
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.titleLabel}</Label>
            <Input
              id="title"
              name="title"
              defaultValue={entry?.title ?? ""}
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t.descriptionLabel}</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={entry?.description ?? ""}
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{t.imageLabel}</Label>
            <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/gif,image/webp" />
            {entry?.image && (
              <p className="text-sm text-muted-foreground">Current image set. Upload a new file to replace.</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? common.loading : common.save}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/dictionary">{common.cancel}</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
