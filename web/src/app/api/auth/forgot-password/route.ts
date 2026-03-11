import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";

// Placeholder: in production, create a PasswordResetToken model and send email.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    // TODO: create reset token, send email with link to /reset-password?token=...
    // For now return success to avoid leaking whether email exists.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 }
    );
  }
}
