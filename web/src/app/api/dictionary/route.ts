import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  if (all && isAdmin) {
    const entries = await prisma.dictionaryEntry.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(entries);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entries = await prisma.dictionaryEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(entries);
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
    const title = String(body.title ?? "").trim();
    const description = body.description != null ? String(body.description).trim() : null;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const entry = await prisma.dictionaryEntry.create({
      data: { userId: user.id, title, description: description || null },
    });
    return NextResponse.json(entry);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
