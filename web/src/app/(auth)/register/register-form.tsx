"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Dict } from "@/lib/get-dictionary";

export function RegisterForm({ dictionary }: { dictionary: Dict }) {
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
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: (formData.get("name") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      acceptTerms: formData.get("acceptTerms") === "on",
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? { _: ["Registration failed"] });
      return;
    }
    router.push("/login");
    router.refresh();
  }

  const t = dictionary.common;
  const auth = dictionary.auth;
  const err = dictionary.validation;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input id="name" name="name" type="text" autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
            {error?.email && (
              <p className="text-sm text-destructive">{error.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
            {error?.password && (
              <p className="text-sm text-destructive">{error.password[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className="flex items-start gap-2">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              required
              className="mt-1 rounded border-input"
            />
            <Label htmlFor="acceptTerms" className="text-sm font-normal">
              {auth.acceptTerms}
            </Label>
          </div>
          {error?.acceptTerms && (
            <p className="text-sm text-destructive">{error.acceptTerms[0]}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.loading : t.register}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
