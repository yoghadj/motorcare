import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const valid = await compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: { currentPassword: ["Current password is incorrect"] } },
        { status: 400 }
      );
    }
    const passwordHash = await hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Change password failed" },
      { status: 500 }
    );
  }
}
