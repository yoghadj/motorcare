import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { motorcycleSchema } from "@/lib/validations/motorcycle";

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
  return NextResponse.json(motorcycle);
}

export async function PATCH(
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
  const existing = await getMyMotorcycle(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = motorcycleSchema.partial().safeParse({
      ...body,
      year: body.year != null ? Number(body.year) : undefined,
      engineCc: body.engineCc != null ? Number(body.engineCc) : undefined,
      currentOdometer: body.currentOdometer != null ? Number(body.currentOdometer) : undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const update: Record<string, unknown> = {};
    if (data.brand !== undefined) update.brand = data.brand;
    if (data.model !== undefined) update.model = data.model;
    if (data.year !== undefined) update.year = data.year;
    if (data.engineCc !== undefined) update.engineCc = data.engineCc;
    if (data.licensePlate !== undefined) update.licensePlate = data.licensePlate;
    if (data.purchaseDate !== undefined) update.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null;
    if (data.currentOdometer !== undefined) update.currentOdometer = data.currentOdometer;
    if (data.nickname !== undefined) update.nickname = data.nickname;

    const motorcycle = await prisma.motorcycle.update({
      where: { id },
      data: update as Parameters<typeof prisma.motorcycle.update>[0]["data"],
    });
    return NextResponse.json(motorcycle);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
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
  const existing = await getMyMotorcycle(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.motorcycle.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const active = await prisma.motorcycle.findFirst({
      where: { userId: user.id, deletedAt: null, id: { not: id } },
    });
    if (active && existing.isActive) {
      await prisma.motorcycle.update({
        where: { id: active.id },
        data: { isActive: true },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
