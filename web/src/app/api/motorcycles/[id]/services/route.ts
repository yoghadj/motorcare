import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const SERVICE_TYPES = ["REGULAR_SERVICE", "REPAIR", "EMERGENCY", "OTHER"] as const;

async function getMyMotorcycle(id: string, userId: string) {
  return prisma.motorcycle.findFirst({
    where: { id, userId, deletedAt: null },
  });
}

function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.max(0, n);
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

  const records = await prisma.serviceRecord.findMany({
    where: { motorcycleId: id, deletedAt: null },
    orderBy: { serviceDate: "desc" },
    include: { items: true },
  });
  const serialized = records.map((r) => ({
    ...r,
    serviceDate: r.serviceDate.toISOString().slice(0, 10),
    serviceCost: Number(r.serviceCost),
    totalCost: Number(r.totalCost),
    items: r.items.map((i) => ({
      ...i,
      unitCost: Number(i.unitCost),
      totalCost: Number(i.totalCost),
    })),
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
    const serviceDate = new Date(body.serviceDate);
    const odometer = toNum(body.odometer);
    const serviceType = body.serviceType ?? "REGULAR_SERVICE";
    if (!SERVICE_TYPES.includes(serviceType)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
    }
    const serviceCost = toNum(body.serviceCost);
    const totalCost = toNum(body.totalCost);
    const workshopName = body.workshopName ? String(body.workshopName).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;
    const items = Array.isArray(body.items) ? body.items : [];

    const lastOdometer = await prisma.odometerLog.findFirst({
      where: { motorcycleId: id },
      orderBy: { date: "desc" },
      select: { odometer: true },
    });
    const minOdometer = lastOdometer?.odometer ?? motorcycle.currentOdometer;
    if (odometer < minOdometer) {
      return NextResponse.json(
        { error: "Odometer must be >= last odometer reading" },
        { status: 400 }
      );
    }

    const serviceRecord = await prisma.serviceRecord.create({
      data: {
        motorcycleId: id,
        serviceDate,
        odometer,
        workshopName,
        notes,
        serviceCost: new Prisma.Decimal(serviceCost),
        totalCost: new Prisma.Decimal(totalCost),
        serviceType,
        items: {
          create: items.map((it: { itemName: string; quantity?: number; unitCost?: number; totalCost?: number }) => ({
            itemName: String(it.itemName || "").trim() || "Item",
            quantity: Math.max(1, toNum(it.quantity)),
            unitCost: new Prisma.Decimal(toNum(it.unitCost)),
            totalCost: new Prisma.Decimal(toNum(it.totalCost)),
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json({
      ...serviceRecord,
      serviceDate: serviceRecord.serviceDate.toISOString().slice(0, 10),
      serviceCost: Number(serviceRecord.serviceCost),
      totalCost: Number(serviceRecord.totalCost),
      items: serviceRecord.items.map((i) => ({
        ...i,
        unitCost: Number(i.unitCost),
        totalCost: Number(i.totalCost),
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
