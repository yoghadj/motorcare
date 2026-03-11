import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Star } from "lucide-react";
import { SetActiveButton } from "./set-active-button";
import { DeleteMotorcycleButton } from "./delete-motorcycle-button";

export default async function GaragePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  const t = dictionary.garage;
  const nav = dictionary.nav;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const motorcycles = await prisma.motorcycle.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{nav.garage}</h1>
        <Button asChild>
          <Link href="/garage/new">
            <Plus className="h-4 w-4" />
            {t.add}
          </Link>
        </Button>
      </div>
      {motorcycles.length === 0 ? (
        <p className="text-muted-foreground">{t.noMotorcycles}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {motorcycles.map((m) => (
            <Card key={m.id} className={m.isActive ? "ring-2 ring-primary" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/garage/${m.id}`} className="font-semibold hover:underline">
                      {m.nickname || `${m.brand} ${m.model}`}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {m.brand} {m.model} ({m.year}) · {m.engineCc} cc
                    </p>
                    <p className="mt-1 text-sm">
                      {t.currentOdometer}: {m.currentOdometer.toLocaleString()} km
                    </p>
                  </div>
                  {m.isActive && (
                    <Star className="h-5 w-5 fill-primary text-primary" />
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!m.isActive && (
                    <SetActiveButton motorcycleId={m.id} dictionary={dictionary} />
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/garage/${m.id}/edit`}>{t.edit}</Link>
                  </Button>
                  <DeleteMotorcycleButton motorcycleId={m.id} dictionary={dictionary} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
