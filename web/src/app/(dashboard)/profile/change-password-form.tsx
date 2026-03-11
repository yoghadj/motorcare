"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Dict } from "@/lib/get-dictionary";

export function ChangePasswordForm({ dictionary }: { dictionary: Dict }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
    };

    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(
        (data.error?.currentPassword?.[0] ?? data.error?.newPassword?.[0]) ??
          "Failed to change password"
      );
      return;
    }
    setSuccess(true);
    (e.target as HTMLFormElement).reset();
  }

  const t = dictionary.common;
  const auth = dictionary.auth;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">{auth.changePassword}</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{auth.currentPassword}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{auth.newPassword}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">Password updated successfully.</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? t.loading : auth.changePassword}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
