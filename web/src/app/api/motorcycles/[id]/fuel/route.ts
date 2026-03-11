import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.max(0, n);
}

async function getMyMotorcycle(id: string, userId: string) {
  return prisma.motorcycle.findFirst({
    where: { id, userId, deletedAt: null },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  const motorcycle = await getMyMotorcycle(id, user.id);
  if (!motorcycle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const logs = await prisma.fuelLog.findMany({
    where: { motorcycleId: id },
    orderBy: { refillDate: "desc" },
  });
  const serialized = logs.map((l) => ({
    ...l,
    refillDate: l.refillDate.toISOString().slice(0, 10),
    liters: Number(l.liters),
    totalPrice: Number(l.totalPrice),
  }));
  return NextResponse.json(serialized);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  const motorcycle = await getMyMotorcycle(id, user.id);
  if (!motorcycle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const refillDate = new Date(body.refillDate);
    let liters = toNum(body.liters);
    let totalPrice = toNum(body.totalPrice);
    const pricePerLiter = body.pricePerLiter != null ? toNum(body.pricePerLiter) : null;
    const odometer = toNum(body.odometer);
    const isFullTank = body.isFullTank !== false;
    const fuelProvider = body.fuelProvider ? String(body.fuelProvider).trim() : null;
    const fuelType = body.fuelType ? String(body.fuelType).trim() : null;
    const stationName = body.stationName ? String(body.stationName).trim() : null;

    if (totalPrice > 0 && liters <= 0 && pricePerLiter != null && pricePerLiter > 0) {
      liters = totalPrice / pricePerLiter;
    } else if (liters > 0 && totalPrice <= 0 && pricePerLiter != null && pricePerLiter > 0) {
      totalPrice = liters * pricePerLiter;
    } else if (liters > 0 && totalPrice > 0 && (pricePerLiter == null || pricePerLiter <= 0)) {
      // pricePerLiter derived
    }
    if (totalPrice <= 0 || liters <= 0) {
      return NextResponse.json(
        { error: "Provide total price and liters (or price per liter)" },
        { status: 400 }
      );
    }

    const log = await prisma.fuelLog.create({
      data: {
        motorcycleId: id,
        refillDate,
        liters: new Prisma.Decimal(liters),
        totalPrice: new Prisma.Decimal(totalPrice),
        odometer,
        fuelProvider,
        fuelType,
        stationName,
        isFullTank,
      },
    });
    return NextResponse.json({
      ...log,
      refillDate: log.refillDate.toISOString().slice(0, 10),
      liters: Number(log.liters),
      totalPrice: Number(log.totalPrice),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
