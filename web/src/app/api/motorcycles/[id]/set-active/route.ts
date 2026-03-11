import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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
  const motorcycle = await prisma.motorcycle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!motorcycle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.motorcycle.updateMany({
      where: { userId: user.id },
      data: { isActive: false },
    }),
    prisma.motorcycle.update({
      where: { id },
      data: { isActive: true },
    }),
  ]);
  return NextResponse.json({ success: true });
}
