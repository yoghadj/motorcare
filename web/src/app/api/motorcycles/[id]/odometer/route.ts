import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

const MAX_GAP_KM = 50_000;

async function getMyMotorcycle(id: string, userId: string) {
  return prisma.motorcycle.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      odometerLogs: { orderBy: { date: "desc" }, take: 1 },
    },
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

  const logs = await prisma.odometerLog.findMany({
    where: { motorcycleId: id },
    orderBy: { date: "desc" },
  });
  const withDistance = logs.map((log, i) => {
    const next = logs[i + 1];
    const distanceSinceLast = next ? log.odometer - next.odometer : null;
    return {
      ...log,
      date: log.date.toISOString().slice(0, 10),
      distanceSinceLast,
    };
  });
  return NextResponse.json(withDistance);
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
    const date = new Date(body.date);
    const odometer = Number(body.odometer);
    if (isNaN(odometer) || odometer < 0) {
      return NextResponse.json(
        { error: "Odometer must be a number >= 0" },
        { status: 400 }
      );
    }

    const lastLog = motorcycle.odometerLogs[0];
    const lastOdometer = lastLog?.odometer ?? motorcycle.currentOdometer;
    const lastDate = lastLog?.date ? new Date(lastLog.date) : null;

    if (odometer < lastOdometer) {
      return NextResponse.json(
        { error: "Odometer cannot be less than previous reading (no rollback)" },
        { status: 400 }
      );
    }
    if (lastDate && date < lastDate) {
      return NextResponse.json(
        { error: "Date cannot be before previous entry date" },
        { status: 400 }
      );
    }
    const gap = odometer - lastOdometer;
    if (gap > MAX_GAP_KM) {
      return NextResponse.json(
        { error: `Odometer gap cannot exceed ${MAX_GAP_KM.toLocaleString()} km` },
        { status: 400 }
      );
    }

    const distanceSinceLast = lastLog ? odometer - lastOdometer : null;
    const log = await prisma.odometerLog.create({
      data: {
        motorcycleId: id,
        date,
        odometer,
        distanceSinceLast,
      },
    });
    await prisma.motorcycle.update({
      where: { id },
      data: { currentOdometer: odometer },
    });
    return NextResponse.json({
      ...log,
      date: log.date.toISOString().slice(0, 10),
      distanceSinceLast,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
