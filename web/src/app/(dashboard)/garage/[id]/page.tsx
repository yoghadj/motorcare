import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { SetActiveButton } from "../set-active-button";
import { DeleteMotorcycleButton } from "../delete-motorcycle-button";
import { MotorcycleTabs } from "./motorcycle-tabs";

export default async function MotorcycleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const { id } = await params;
  const { tab } = await searchParams;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const motorcycle = await prisma.motorcycle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!motorcycle) notFound();

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  const t = dictionary.garage;

  const serialized = {
    ...motorcycle,
    purchaseDate: motorcycle.purchaseDate
      ? motorcycle.purchaseDate.toISOString().slice(0, 10)
      : null,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            {motorcycle.nickname || `${motorcycle.brand} ${motorcycle.model}`}
          </h1>
          {motorcycle.isActive && (
            <Star className="h-6 w-6 fill-primary text-primary" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!motorcycle.isActive && (
            <SetActiveButton motorcycleId={id} dictionary={dictionary} />
          )}
          <Button variant="outline" asChild>
            <Link href={`/garage/${id}/edit`}>{t.edit}</Link>
          </Button>
          <DeleteMotorcycleButton motorcycleId={id} dictionary={dictionary} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            {motorcycle.brand} {motorcycle.model} ({motorcycle.year}) · {motorcycle.engineCc} cc
          </p>
          <p className="mt-1 font-medium">
            {t.currentOdometer}: {motorcycle.currentOdometer.toLocaleString()} km
          </p>
        </CardContent>
      </Card>

      <MotorcycleTabs
        motorcycleId={id}
        motorcycle={serialized}
        dictionary={dictionary}
        tab={tab ?? "odometer"}
      />
    </div>
  );
}
