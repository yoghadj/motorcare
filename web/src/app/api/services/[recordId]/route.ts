import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const SERVICE_TYPES = ["REGULAR_SERVICE", "REPAIR", "EMERGENCY", "OTHER"] as const;

function toNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.max(0, n);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> }
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
  const { recordId } = await params;

  const record = await prisma.serviceRecord.findUnique({
    where: { id: recordId },
    include: { motorcycle: true },
  });
  if (!record || record.motorcycle.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (record.deletedAt) {
    return NextResponse.json({ error: "Record is deleted" }, { status: 400 });
  }

  const body = await request.json();
  const update: Prisma.ServiceRecordUpdateInput = {};
  if (body.serviceDate != null) update.serviceDate = new Date(body.serviceDate);
  if (body.odometer != null) update.odometer = toNum(body.odometer);
  if (body.workshopName !== undefined) update.workshopName = body.workshopName ? String(body.workshopName).trim() : null;
  if (body.notes !== undefined) update.notes = body.notes ? String(body.notes).trim() : null;
  if (body.serviceType != null && SERVICE_TYPES.includes(body.serviceType)) update.serviceType = body.serviceType;
  if (body.serviceCost != null) update.serviceCost = new Prisma.Decimal(toNum(body.serviceCost));
  if (body.totalCost != null) update.totalCost = new Prisma.Decimal(toNum(body.totalCost));
  if (Array.isArray(body.items)) {
    await prisma.serviceItem.deleteMany({ where: { serviceRecordId: recordId } });
    update.items = {
      create: body.items.map((it: { itemName?: string; quantity?: number; unitCost?: number; totalCost?: number }) => ({
        itemName: String(it.itemName || "").trim() || "Item",
        quantity: Math.max(1, toNum(it.quantity)),
        unitCost: new Prisma.Decimal(toNum(it.unitCost)),
        totalCost: new Prisma.Decimal(toNum(it.totalCost)),
      })),
    };
  }

  const updated = await prisma.serviceRecord.update({
    where: { id: recordId },
    data: update,
    include: { items: true },
  });
  return NextResponse.json({
    ...updated,
    serviceDate: updated.serviceDate.toISOString().slice(0, 10),
    serviceCost: Number(updated.serviceCost),
    totalCost: Number(updated.totalCost),
    items: updated.items.map((i) => ({
      ...i,
      unitCost: Number(i.unitCost),
      totalCost: Number(i.totalCost),
    })),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ recordId: string }> }
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
  const { recordId } = await params;

  const record = await prisma.serviceRecord.findUnique({
    where: { id: recordId },
    include: { motorcycle: true },
  });
  if (!record || record.motorcycle.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.serviceRecord.update({
    where: { id: recordId },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
