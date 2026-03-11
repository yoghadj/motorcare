import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_GAP_KM = 50_000;

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

  const log = await prisma.odometerLog.findUnique({
    where: { id: logId },
    include: { motorcycle: true },
  });
  if (!log || log.motorcycle.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const date = body.date ? new Date(body.date) : undefined;
  const odometer = body.odometer != null ? Number(body.odometer) : undefined;

  const [prevLog, nextLog] = await Promise.all([
    prisma.odometerLog.findFirst({
      where: { motorcycleId: log.motorcycleId, date: { lt: log.date } },
      orderBy: { date: "desc" },
    }),
    prisma.odometerLog.findFirst({
      where: { motorcycleId: log.motorcycleId, date: { gt: log.date } },
      orderBy: { date: "asc" },
    }),
  ]);

  const newDate = date ?? log.date;
  const newOdometer = odometer ?? log.odometer;
  const minOdometer = prevLog ? prevLog.odometer : log.motorcycle.currentOdometer;
  const maxOdometer = nextLog ? nextLog.odometer : null;
  const minDate = prevLog ? new Date(prevLog.date) : null;
  const maxDate = nextLog ? new Date(nextLog.date) : null;

  if (newOdometer < minOdometer) {
    return NextResponse.json(
      { error: "Odometer cannot be less than previous reading" },
      { status: 400 }
    );
  }
  if (maxOdometer != null && newOdometer > maxOdometer) {
    return NextResponse.json(
      { error: "Odometer cannot exceed next entry reading" },
      { status: 400 }
    );
  }
  if (newOdometer - minOdometer > MAX_GAP_KM) {
    return NextResponse.json(
      { error: `Gap cannot exceed ${MAX_GAP_KM.toLocaleString()} km` },
      { status: 400 }
    );
  }
  if (minDate && newDate < minDate) {
    return NextResponse.json(
      { error: "Date cannot be before previous entry" },
      { status: 400 }
    );
  }
  if (maxDate && newDate > maxDate) {
    return NextResponse.json(
      { error: "Date cannot be after next entry" },
      { status: 400 }
    );
  }

  const distanceSinceLast = prevLog ? newOdometer - prevLog.odometer : null;
  const updated = await prisma.odometerLog.update({
    where: { id: logId },
    data: {
      ...(date !== undefined && { date }),
      ...(odometer !== undefined && { odometer, distanceSinceLast }),
    },
  });

  const motorcycleLogs = await prisma.odometerLog.findMany({
    where: { motorcycleId: log.motorcycleId },
    orderBy: { date: "desc" },
    take: 1,
  });
  const latestOdometer = motorcycleLogs[0]?.odometer ?? 0;
  await prisma.motorcycle.update({
    where: { id: log.motorcycleId },
    data: { currentOdometer: latestOdometer },
  });

  return NextResponse.json({
    ...updated,
    date: updated.date.toISOString().slice(0, 10),
    distanceSinceLast,
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

  const log = await prisma.odometerLog.findUnique({
    where: { id: logId },
    include: { motorcycle: true },
  });
  if (!log || log.motorcycle.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.odometerLog.delete({ where: { id: logId } });
  const remaining = await prisma.odometerLog.findMany({
    where: { motorcycleId: log.motorcycleId },
    orderBy: { date: "desc" },
    take: 1,
  });
  const newCurrent = remaining[0]?.odometer ?? 0;
  await prisma.motorcycle.update({
    where: { id: log.motorcycleId },
    data: { currentOdometer: newCurrent },
  });
  return NextResponse.json({ success: true });
}
