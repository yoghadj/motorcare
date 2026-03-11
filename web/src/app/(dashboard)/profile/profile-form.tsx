"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Dict } from "@/lib/get-dictionary";

interface Initial {
  name: string | null;
  email: string;
  phone: string | null;
}

export function ProfileForm({
  dictionary,
  initial,
}: {
  dictionary: Dict;
  initial: Initial;
}) {
  const router = useRouter();
  const [error, setError] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      name: (formData.get("name") as string) || undefined,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
    };

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? { _: ["Update failed"] });
      return;
    }
    router.refresh();
  }

  const t = dictionary.common;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{t.name} &amp; {t.email}</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={initial.name ?? ""}
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={initial.email}
              autoComplete="email"
            />
            {error?.email && (
              <p className="text-sm text-destructive">{error.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initial.phone ?? ""}
              autoComplete="tel"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? t.loading : t.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
