import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { formatNumber, formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Bike, Fuel, Wrench, Gauge } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  const t = dictionary.dashboard;
  const nav = dictionary.nav;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const motorcycles = await prisma.motorcycle.findMany({
    where: { userId: user.id, deletedAt: null },
    select: { id: true, isActive: true, nickname: true, brand: true, model: true, currentOdometer: true },
    orderBy: { isActive: "desc" },
  });

  const motorcycleIds = motorcycles.map((m) => m.id);
  const [odometerCount, serviceCount, fuelCount, odometerLogs, serviceRecords, fuelLogs] = await Promise.all([
    prisma.odometerLog.count({ where: { motorcycleId: { in: motorcycleIds } } }),
    prisma.serviceRecord.count({ where: { motorcycleId: { in: motorcycleIds }, deletedAt: null } }),
    prisma.fuelLog.count({ where: { motorcycleId: { in: motorcycleIds } } }),
    prisma.odometerLog.findMany({
      where: { motorcycleId: { in: motorcycleIds } },
      orderBy: { date: "desc" },
      take: 100,
      select: { odometer: true, motorcycleId: true, date: true },
    }),
    prisma.serviceRecord.findMany({
      where: { motorcycleId: { in: motorcycleIds }, deletedAt: null },
      orderBy: { serviceDate: "desc" },
      take: 5,
      include: { motorcycle: { select: { nickname: true, brand: true, model: true } } },
    }),
    prisma.fuelLog.findMany({
      where: { motorcycleId: { in: motorcycleIds } },
      orderBy: { refillDate: "desc" },
      take: 5,
      include: { motorcycle: { select: { nickname: true, brand: true, model: true } } },
    }),
  ]);

  const totalKm = (() => {
    const byBike = new Map<string, { min: number; max: number }>();
    for (const log of odometerLogs) {
      const cur = byBike.get(log.motorcycleId) ?? { min: log.odometer, max: log.odometer };
      cur.min = Math.min(cur.min, log.odometer);
      cur.max = Math.max(cur.max, log.odometer);
      byBike.set(log.motorcycleId, cur);
    }
    return Array.from(byBike.values()).reduce((s, { min, max }) => s + (max - min), 0);
  })();

  const allServices = await prisma.serviceRecord.findMany({
    where: { motorcycleId: { in: motorcycleIds }, deletedAt: null },
    select: { totalCost: true },
  });
  const totalServiceCostAll = allServices.reduce((s, r) => s + Number(r.totalCost), 0);

  const allFuel = await prisma.fuelLog.findMany({
    where: { motorcycleId: { in: motorcycleIds } },
    select: { totalPrice: true },
  });
  const totalFuelCost = allFuel.reduce((s, r) => s + Number(r.totalPrice), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{nav.dashboard}</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t.stats}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Bike className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Motorcycles</p>
                <p className="text-2xl font-bold">{motorcycles.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Gauge className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.totalKm}</p>
                <p className="text-2xl font-bold">{formatNumber(totalKm)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Wrench className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.totalServiceCost}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalServiceCostAll)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Fuel className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t.totalFuelCost}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalFuelCost)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.recentServices}</h2>
          {serviceRecords.length === 0 ? (
            <p className="text-muted-foreground">No services yet.</p>
          ) : (
            <div className="space-y-2">
              {serviceRecords.map((r) => (
                <Link
                  key={r.id}
                  href={`/garage/${r.motorcycleId}?tab=services`}
                  className="block rounded-md border p-3 hover:bg-muted/50"
                >
                  <span className="font-medium">
                    {r.motorcycle.nickname || `${r.motorcycle.brand} ${r.motorcycle.model}`}
                  </span>
                  <span className="text-muted-foreground"> · {r.serviceDate.toISOString().slice(0, 10)}</span>
                  <span className="ml-2 font-medium">{formatCurrency(r.totalCost)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t.recentFuel}</h2>
          {fuelLogs.length === 0 ? (
            <p className="text-muted-foreground">No fuel logs yet.</p>
          ) : (
            <div className="space-y-2">
              {fuelLogs.map((l) => (
                <Link
                  key={l.id}
                  href={`/garage/${l.motorcycleId}?tab=fuel`}
                  className="block rounded-md border p-3 hover:bg-muted/50"
                >
                  <span className="font-medium">
                    {l.motorcycle.nickname || `${l.motorcycle.brand} ${l.motorcycle.model}`}
                  </span>
                  <span className="text-muted-foreground"> · {l.refillDate.toISOString().slice(0, 10)}</span>
                  <span className="ml-2 font-medium">{formatCurrency(l.totalPrice)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t.quickLinks}</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/garage"
            className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            {nav.garage}
          </Link>
          {motorcycles.length > 0 && (
            <Link
              href={`/garage/${motorcycles[0].id}`}
              className="rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              {motorcycles[0].nickname || `${motorcycles[0].brand} ${motorcycles[0].model}`}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
