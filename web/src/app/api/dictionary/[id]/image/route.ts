import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const entry = await prisma.dictionaryEntry.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (entry.user.email !== session.user.email && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  if (!file || !file.size) {
    return NextResponse.json({ error: "No image file" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be at most 2 MB" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const relPath = path.join("uploads", "dictionaries", `${id}${ext}`);
  const dir = path.join(process.cwd(), "public", "uploads", "dictionaries");
  await mkdir(dir, { recursive: true });
  const absPath = path.join(process.cwd(), "public", relPath);

  if (entry.image) {
    const oldPath = path.join(process.cwd(), "public", entry.image);
    try { await unlink(oldPath); } catch (_) {}
  }

  const bytes = await file.arrayBuffer();
  await writeFile(absPath, Buffer.from(bytes));

  await prisma.dictionaryEntry.update({
    where: { id },
    data: { image: `/${relPath.replace(/\\/g, "/")}` },
  });

  return NextResponse.json({ image: `/${relPath.replace(/\\/g, "/")}` });
}
