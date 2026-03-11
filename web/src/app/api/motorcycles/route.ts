import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { motorcycleSchema } from "@/lib/validations/motorcycle";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const list = await prisma.motorcycle.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const parsed = motorcycleSchema.safeParse({
      ...body,
      year: body.year != null ? Number(body.year) : undefined,
      engineCc: body.engineCc != null ? Number(body.engineCc) : undefined,
      currentOdometer: body.currentOdometer != null ? Number(body.currentOdometer) : 0,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const purchaseDate = data.purchaseDate
      ? new Date(data.purchaseDate)
      : null;
    const isFirst = (await prisma.motorcycle.count({ where: { userId: user.id, deletedAt: null } })) === 0;
    const motorcycle = await prisma.motorcycle.create({
      data: {
        userId: user.id,
        brand: data.brand,
        model: data.model,
        year: data.year,
        engineCc: data.engineCc,
        licensePlate: data.licensePlate ?? null,
        purchaseDate,
        currentOdometer: data.currentOdometer,
        nickname: data.nickname ?? null,
        isActive: isFirst,
      },
    });
    return NextResponse.json(motorcycle);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
