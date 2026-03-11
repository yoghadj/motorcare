import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

async function canEditDelete(
  entryId: string,
  user: { email?: string | null; role?: string }
) {
  const entry = await prisma.dictionaryEntry.findUnique({
    where: { id: entryId },
    include: { user: { select: { email: true } } },
  });
  if (!entry) return { allowed: false, entry: null as typeof entry };
  const isAdmin = user.role === "ADMIN";
  const isOwner = entry.user.email === user.email;
  return { allowed: isAdmin || isOwner, entry };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const entry = await prisma.dictionaryEntry.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (entry.userId !== me?.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(entry);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { allowed } = await canEditDelete(id, session.user as { email?: string | null; role?: string });
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const title = body.title != null ? String(body.title).trim() : undefined;
    const description = body.description !== undefined ? (body.description == null ? null : String(body.description).trim()) : undefined;
    if (title !== undefined && !title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const entry = await prisma.dictionaryEntry.update({
      where: { id },
      data: { ...(title !== undefined && { title }), ...(description !== undefined && { description }) },
    });
    return NextResponse.json(entry);
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
  const { id } = await params;
  const { allowed, entry } = await canEditDelete(id, session.user as { email?: string | null; role?: string });
  if (!allowed || !entry) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    if (entry.image) {
      const base = process.cwd();
      const imagePath = path.join(base, "public", entry.image);
      try {
        await unlink(imagePath);
      } catch (_) {}
    }
    await prisma.dictionaryEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
