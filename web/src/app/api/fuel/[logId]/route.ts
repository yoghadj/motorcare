import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.max(0, n);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ logId: string }> }
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
  const { logId } = await params;

  const log = await prisma.fuelLog.findUnique({
    where: { id: logId },
    include: { motorcycle: true },
  });
  if (!log || log.motorcycle.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const update: Prisma.FuelLogUpdateInput = {};
  if (body.refillDate != null) update.refillDate = new Date(body.refillDate);
  if (body.liters != null) update.liters = new Prisma.Decimal(toNum(body.liters));
  if (body.totalPrice != null) update.totalPrice = new Prisma.Decimal(toNum(body.totalPrice));
  if (body.odometer != null) update.odometer = toNum(body.odometer);
  if (body.fuelProvider !== undefined) update.fuelProvider = body.fuelProvider ? String(body.fuelProvider).trim() : null;
  if (body.fuelType !== undefined) update.fuelType = body.fuelType ? String(body.fuelType).trim() : null;
  if (body.stationName !== undefined) update.stationName = body.stationName ? String(body.stationName).trim() : null;
  if (body.isFullTank !== undefined) update.isFullTank = Boolean(body.isFullTank);

  const updated = await prisma.fuelLog.update({
    where: { id: logId },
    data: update,
  });
  return NextResponse.json({
    ...updated,
    refillDate: updated.refillDate.toISOString().slice(0, 10),
    liters: Number(updated.liters),
    totalPrice: Number(updated.totalPrice),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> }
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
  const { logId } = await params;

  const log = await prisma.fuelLog.findUnique({
    where: { id: logId },
    include: { motorcycle: true },
  });
  if (!log || log.motorcycle.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.fuelLog.delete({ where: { id: logId } });
  return NextResponse.json({ success: true });
}
