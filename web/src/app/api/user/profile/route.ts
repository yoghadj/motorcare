import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validations/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, phone: true, role: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, phone } = parsed.data;
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing && existing.id !== (session.user as { id?: string }).id) {
      return NextResponse.json(
        { error: { email: ["Email already in use"] } },
        { status: 400 }
      );
    }
    const updated = await prisma.user.update({
      where: { email: session.user.email },
      data: { name: name ?? null, email: email.toLowerCase(), phone: phone ?? null },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
